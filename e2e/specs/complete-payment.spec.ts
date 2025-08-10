import { expect, test } from "../fixtures/test-base";
import { HomePage } from "../pages/home.page";

test.describe("Complete Payment Flow", () => {
  test.setTimeout(60000); // Increase timeout for payment processing

  const TEST_CARD = {
    email: "test@example.com",
    name: "TEST USER",
    number: "4111111111111111",
    expiry: "12/32",
    cvv: "123",
  };

  test("should complete full payment with test credit card", async ({ page }) => {
    const homePage = new HomePage(page);

    // Step 1: Start at home page
    await homePage.goto();
    await expect(homePage.pageTitle).toBeVisible();
    console.log("✓ Home page loaded");

    // Step 2: Fill payment form
    await homePage.fillAmount("1000");
    await homePage.selectPaymentMethod("credit_card");
    console.log("✓ Payment form filled");

    // Step 3: Submit to create payment session
    await homePage.submitPayment();
    console.log("✓ Payment session created");

    // Step 4: Wait for redirect to KOMOJU
    await page.waitForURL(/komoju\.com/, { timeout: 15000 });
    console.log("✓ Redirected to KOMOJU");
    console.log("  Current URL:", page.url());

    // Step 5: Wait for KOMOJU page to load
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);

    // Step 6: Fill email (required field)
    await page.getByRole("textbox", { name: "メールアドレス" }).fill(TEST_CARD.email);
    console.log("✓ Email filled");

    // Step 7: Fill cardholder name
    await page.getByRole("textbox", { name: "カード所有者名" }).fill(TEST_CARD.name);
    console.log("✓ Cardholder name filled");

    // Step 8: Fill card number
    await page.getByRole("textbox", { name: "カード番号" }).fill(TEST_CARD.number);
    console.log("✓ Card number filled");

    // Step 9: Fill expiry date
    await page.getByRole("textbox", { name: "有効期限" }).fill(TEST_CARD.expiry);
    console.log("✓ Expiry date filled");

    // Step 10: Fill CVV
    await page.getByRole("textbox", { name: "セキュリティコード" }).fill(TEST_CARD.cvv);
    console.log("✓ CVV filled");

    // Take screenshot after filling
    await page.screenshot({ path: "test-results/card-form-filled.png", fullPage: true });

    // Step 11: Submit payment
    await page.getByRole("button", { name: /支払い.*￥/ }).click();
    console.log("✓ Payment submitted");

    // Step 12: Wait for redirect to return page
    await page.waitForURL(/\/return/, { timeout: 30000 });

    // Step 13: Verify payment completion
    const finalUrl = page.url();
    console.log("  Final URL:", finalUrl);

    // Take final screenshot
    await page.screenshot({ path: "test-results/payment-complete.png", fullPage: true });

    // Verify we're on the return page with success message
    expect(finalUrl).toContain("/return");
    await expect(page.locator('text="決済完了 — ありがとうございます"')).toBeVisible();
    await expect(page.locator("text=/captured/i")).toBeVisible();

    console.log("✓ Payment completed successfully!");
  });

  test("should complete payment with different amounts", async ({ page }) => {
    const homePage = new HomePage(page);
    const testAmounts = ["500", "2500", "10000"];

    for (const amount of testAmounts) {
      console.log(`\nTesting with amount: ¥${amount}`);

      // Navigate to home page
      await homePage.goto();
      await homePage.fillAmount(amount);
      await homePage.selectPaymentMethod("credit_card");

      // Submit payment form
      await homePage.submitPayment();

      // Wait for KOMOJU redirect
      await page.waitForURL(/komoju\.com/, { timeout: 15000 });
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(2000);

      // Fill KOMOJU payment form
      await page.getByRole("textbox", { name: "メールアドレス" }).fill(TEST_CARD.email);
      await page.getByRole("textbox", { name: "カード所有者名" }).fill(TEST_CARD.name);
      await page.getByRole("textbox", { name: "カード番号" }).fill(TEST_CARD.number);
      await page.getByRole("textbox", { name: "有効期限" }).fill(TEST_CARD.expiry);
      await page.getByRole("textbox", { name: "セキュリティコード" }).fill(TEST_CARD.cvv);

      // Submit payment
      await page.getByRole("button", { name: /支払い.*￥/ }).click();

      // Wait for redirect to return page
      await page.waitForURL(/\/return/, { timeout: 30000 });

      // Verify payment completion
      await expect(page.locator('text="決済完了 — ありがとうございます"')).toBeVisible();
      await expect(page.locator("text=/captured/i")).toBeVisible();

      // Verify amount
      await expect(page.locator(`text=/金額.*${amount}/`)).toBeVisible();

      console.log(`  ✓ Payment of ¥${amount} completed successfully`);
    }
  });
});

test.describe("Payment Error Handling", () => {
  test("should handle invalid card number", async ({ page }) => {
    const homePage = new HomePage(page);

    // Navigate and setup payment
    await homePage.goto();
    await homePage.fillAmount("1000");
    await homePage.selectPaymentMethod("credit_card");
    await homePage.submitPayment();

    // Wait for KOMOJU
    await page.waitForURL(/komoju\.com/, { timeout: 15000 });
    await page.waitForLoadState("networkidle");
    await page.waitForTimeout(2000);

    // Fill form with invalid card number
    await page.getByRole("textbox", { name: "メールアドレス" }).fill("test@example.com");
    await page.getByRole("textbox", { name: "カード所有者名" }).fill("TEST USER");
    await page.getByRole("textbox", { name: "カード番号" }).fill("4111111111111112"); // Invalid card
    await page.getByRole("textbox", { name: "有効期限" }).fill("12/25");
    await page.getByRole("textbox", { name: "セキュリティコード" }).fill("123");

    // Submit payment
    await page.getByRole("button", { name: /支払い.*￥/ }).click();

    // Should see error message (not redirect to success)
    await page.waitForTimeout(5000);
    const currentUrl = page.url();
    expect(currentUrl).toContain("komoju.com");
    expect(currentUrl).not.toContain("/return");

    console.log("✓ Invalid card error handled correctly");
  });
});
