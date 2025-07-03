import { test, expect } from "@playwright/test";

test("Verify read/unread indicators with reference numbers match API data", async ({
  page,
  request,
}) => {
  // Step 1: Login and ensure we're fully logged in
  await page.goto("https://hues-frontend-dev.vercel.app/en/login");
  await page.getByPlaceholder("Enter a Aadhar linked phone").fill("9532751771");
  await page.getByRole("button", { name: "Send OTP" }).click();
  await page.getByRole("textbox").fill("8080");
  await page.getByRole("button", { name: "Verify" }).click();

  // Wait for redirect after login to ensure token is stored
  await page.waitForURL("https://hues-frontend-dev.vercel.app/en");

  // Step 2: Go to Purchase Orders page to ensure app is properly initialized
  await page.goto(
    "https://hues-frontend-dev.vercel.app/en/purchases/purchase-orders"
  );
  await page.waitForSelector("table tbody tr");

  // Get auth token from localStorage after navigation
  const token = await page.evaluate(() => {
    const rawToken = localStorage.getItem("token");
    return rawToken ? rawToken.replace(/^"|"$/g, "") : null;
  });

  if (!token) {
    throw new Error("No authentication token found in localStorage");
  }

  // Step 3: Get API data with proper error handling and token refresh capability
  const apiData = await getAPIData(page, request, token);
  const { apiItems } = apiData;

  // Step 4: Infinite scroll with improved reliability
  const scrollContainer = page.locator(
    "div.infinite-datatable-scrollable-body.scrollBarStyles"
  );

  let previousCount = 0;
  let currentCount = await page.locator("table tbody tr").count();
  let scrollAttempts = 0;
  const maxScrollAttempts = 10; // Prevent infinite loops

  while (currentCount > previousCount && scrollAttempts < maxScrollAttempts) {
    previousCount = currentCount;
    scrollAttempts++;

    // Scroll with more reliable approach
    await scrollContainer.evaluate((el) => {
      el.scrollTop = el.scrollHeight;
    });

    // Wait for potential new rows to load
    await page.waitForTimeout(2000);
    currentCount = await page.locator("table tbody tr").count();
  }

  // Step 5: Create API read status map using the correct field (readTracker.buyerIsRead)
  const apiMap = new Map();
  for (const item of apiItems) {
    // Extract the correct read status from the nested readTracker object
    const isRead = item.readTracker?.buyerIsRead ?? false;
    apiMap.set(item.referenceNumber, isRead);
    // console.log(
    //   `API item ${item.referenceNumber}: buyerIsRead=${isRead} (${isRead ? 'Read' : 'Unread'})`,
    // );
  }

  // Step 6: Match table rows with API
  const rows = await page.locator("table tbody tr").all();

  if (rows.length === 0) {
    throw new Error("No rows found in the table");
  }

  // console.log(
  //   `Found ${rows.length} rows in UI and ${apiItems.length} items from API`,
  // );

  let mismatches = 0;
  let matchedItems = 0;

  for (const row of rows) {
    // Get background color
    const bgColor = await row.evaluate(
      (el) => window.getComputedStyle(el).backgroundColor
    );

    const referenceTd = row.locator("td").nth(1);
    const referenceText = (await referenceTd.innerText()).trim();

    // Skip empty or invalid reference numbers
    if (!referenceText) {
      console.warn("Found row with empty reference number, skipping");
      continue;
    }

    // Determine visual status based on background color
    // White background (rgb(255, 255, 255)) = Unread (false)
    // Any other color = Read (true)
    const visualStatus = bgColor !== "rgb(255, 255, 255)";

    // Check if reference exists in API data
    if (!apiMap.has(referenceText)) {
      console.warn(
        `⚠️ Reference number ${referenceText} not found in API data`
      );
      continue;
    }

    const apiStatus = apiMap.get(referenceText);
    matchedItems++;

    // Add detailed logging for debugging
    // console.log(`Reference ${referenceText}:
    //   API buyerIsRead: ${apiStatus} (${apiStatus ? 'Read' : 'Unread'})
    //   UI status: ${visualStatus} (${visualStatus ? 'Read' : 'Unread'})
    //   Background color: ${bgColor}
    // `);

    // This is the key check - do API and UI statuses match?
    const statusMatch = apiStatus === visualStatus;

    if (statusMatch) {
      // console.log(
      //   `✅ Match: ${referenceText} | API: ${apiStatus ? 'Read' : 'Unread'} | UI: ${visualStatus ? 'Read' : 'Unread'}`,
      // );
    } else {
      // console.error(
      //   `❌ Mismatch: ${referenceText} | API: ${apiStatus ? 'Read' : 'Unread'} | UI: ${visualStatus ? 'Read' : 'Unread'} | BGC: ${bgColor}`,
      // );
      mismatches++;
    }
  }

  // console.log(`Matched ${matchedItems} items between UI and API`);
  // console.log(
  //   `Found ${mismatches} mismatches out of ${matchedItems} matched items`,
  // );

  expect(
    matchedItems,
    "No items were matched between API and UI"
  ).toBeGreaterThan(0);
  expect(mismatches, `${mismatches} mismatches found between API and UI`).toBe(
    0
  );
});

// Helper function to get API data with token refresh capability
async function getAPIData(page, request, token) {
  // Step 3: Get API data with proper error handling
  const apiRes = await request.post(
    "https://dev-hues-backend.paratech.ai/api/v1/order/getpurchases/52",
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      data: {
        page: 1,
        limit: 100, // Increased to get more items at once
      },
    }
  );

  if (!apiRes.ok()) {
    const errorText = await apiRes.text();
    console.error("API Response:", {
      status: apiRes.status(),
      statusText: apiRes.statusText(),
      body: errorText,
    });

    // If token expired, try to refresh the token
    if (apiRes.status() === 401) {
      // console.log('Token expired. Attempting to refresh login...');

      // Go back to login page and repeat login process
      await page.goto("https://hues-frontend-dev.vercel.app/en/login");
      await page
        .getByPlaceholder("Enter a Aadhar linked phone")
        .fill("9532751771");
      await page.getByRole("button", { name: "Send OTP" }).click();
      await page.getByRole("textbox").fill("8080");
      await page.getByRole("button", { name: "Verify" }).click();

      // Wait for login to complete
      await page.waitForURL("**/dashboard");

      // Get fresh token
      const refreshedToken = await page.evaluate(() => {
        const rawToken = localStorage.getItem("token");
        return rawToken ? rawToken.replace(/^"|"$/g, "") : null;
      });

      if (!refreshedToken) {
        throw new Error("Failed to refresh authentication token");
      }

      // Retry API call with new token
      const retriedApiRes = await request.post(
        "https://dev-hues-backend.paratech.ai/api/v1/order/getpurchases/52",
        {
          headers: {
            Authorization: `Bearer ${refreshedToken}`,
            "Content-Type": "application/json",
          },
          data: {
            page: 1,
            limit: 100,
          },
        }
      );

      if (!retriedApiRes.ok()) {
        const retriedErrorText = await retriedApiRes.text();
        console.error("API Response after token refresh:", {
          status: retriedApiRes.status(),
          statusText: retriedApiRes.statusText(),
          body: retriedErrorText,
        });
        expect(
          retriedApiRes.ok(),
          `API request failed even after token refresh: ${retriedErrorText}`
        ).toBeTruthy();
      }

      const json = await retriedApiRes.json();
      const apiItems = json?.data?.data ?? [];

      if (apiItems.length === 0) {
        console.warn(
          "Warning: No purchase orders returned from API after token refresh"
        );
      }

      // Re-navigate to purchase orders page
      await page.goto(
        "https://hues-frontend-dev.vercel.app/en/purchases/purchase-orders"
      );
      await page.waitForSelector("table tbody tr");

      return { apiItems };
    } else {
      // For non-401 errors, fail the test
      expect(
        apiRes.ok(),
        `API request failed with status ${apiRes.status()}: ${errorText}`
      ).toBeTruthy();
    }
  }

  const json = await apiRes.json();
  const apiItems = json?.data?.data ?? [];

  if (apiItems.length === 0) {
    console.warn("Warning: No purchase orders returned from API");
  }

  return { apiItems };
}
