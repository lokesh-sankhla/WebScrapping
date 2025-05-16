import { test, expect } from "@playwright/test";

test.only("test", async ({ browser }) => {
  const { checkInDay, checkOutDay } = getCheckInOutDays();

  const ratingLabel = await rating(5);

  //handle indian page for headless browser
  const context = await browser.newContext({
    locale: "en-IN",
    timezoneId: "Asia/Kolkata",
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/122 Safari/537.36",
    extraHTTPHeaders: {
      "Accept-Language": "en-IN,en;q=0.9",
    },
  });

  await context.addCookies([
    {
      name: "lang",
      value: "en-gb",
      domain: ".booking.com",
      path: "/",
    },
    {
      name: "selected_currency",
      value: "INR",
      domain: ".booking.com",
      path: "/",
    },
  ]);

  const page = await context.newPage();
  await page.goto(
    "https://www.booking.com/index.en-gb.html?selected_currency=INR&lang=en-gb"
  );

  await page.waitForTimeout(3000);
  await acceptCookiesIfVisible(page);
  // Dismiss sign-in modal if visible
  await closeGeniusPopupIfVisible(page);

  await page.getByRole("combobox", { name: "Where are you going?" }).click();
  await page
    .getByRole("combobox", { name: "Where are you going?" })
    .fill("jaipur");
  await page
    .getByRole("button", { name: "Jaipur Rajasthan, India", exact: true })
    .click();
  await page.waitForTimeout(3000);

  await page
    .getByRole("gridcell", { name: checkInDay })
    .first()
    .waitFor({ state: "visible" });
  await page.getByRole("gridcell", { name: checkInDay }).first().click();

  await page
    .getByRole("gridcell", { name: checkOutDay })
    .nth(1)
    .waitFor({ state: "visible" });
  await page.getByRole("gridcell", { name: checkOutDay }).nth(1).click();

  await page.getByTestId("occupancy-config").click();
  await page
    .locator("div")
    .filter({ hasText: /^0$/ })
    .locator("button")
    .nth(1)
    .click();
  await page.getByLabel("Age of child at check-out").selectOption("1");
  await page.getByRole("button", { name: "Done" }).click();

  await page.locator("button[type='submit']").click();

  await page.waitForTimeout(5000);
  // Dismiss sign-in modal if visible
  await closeGeniusPopupIfVisible(page);

  //find the neproperty rating text on the page
  const propertyrating = page.locator("text='Property rating'").first();
  //scroll until the button is visible
  await propertyrating.scrollIntoViewIfNeeded();

  const starCheckbox = page
    .getByRole("checkbox", { name: new RegExp(ratingLabel, "i") })
    .last();
  await expect(starCheckbox).toBeVisible();
  await starCheckbox.scrollIntoViewIfNeeded();
  await starCheckbox.click();

  // Sort by Price (lowest first)
  await page.getByTestId("sorters-dropdown-trigger").click();
  await page.getByRole("option", { name: "Price (lowest first)" }).click();

  // Print first hotel name and its price
  const hotelName = await page
    .getByRole("link", { name: /Opens in new/ })
    .first()
    .textContent();
  const price = await page
    .locator('span[data-testid="price-and-discounted-price"]')
    .first()
    .textContent();

  console.log("Hotel Name:", hotelName?.trim());
  console.log("Price:", price?.trim());
});

async function acceptCookiesIfVisible(page) {
  const cookieButton = page.locator("button", {
    hasText: /accept|agree|ok|got it/i,
  });

  if (await cookieButton.first().isVisible()) {
    await cookieButton.first().click();
  }
}

function getCheckInOutDays() {
  const today = new Date();
  const checkInDate = new Date(today);
  checkInDate.setDate(today.getDate() + 3);
  const checkOutDate = new Date(today);
  checkOutDate.setDate(today.getDate() + 8);

  const formatDate = (date) => String(date.getDate());

  const checkInDay = formatDate(checkInDate);
  const checkOutDay = formatDate(checkOutDate);

  return { checkInDay, checkOutDay };
}

async function rating(ratingValue) {
  // Handle singular/plural label
  const ratingLabel = ratingValue === 1 ? "1 star" : `${ratingValue} stars`;
  return ratingLabel;
}

async function closeGeniusPopupIfVisible(page) {
  try {
    const dismissBtn = page.getByRole("button", {
      name: "Dismiss sign in information.",
    });
    if (await dismissBtn.isVisible()) {
      await dismissBtn.click();
      console.log("Popup is closed");
    }
  } catch (error) {
    console.log("Genius popup not found or already dismissed.");
  }
}
