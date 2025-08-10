import type { Page } from "@playwright/test";

export class KomojuPaymentPage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async waitForPageLoad() {
    // Wait for KOMOJU page to load
    await this.page.waitForLoadState("networkidle");
    await this.page.waitForTimeout(2000);
  }

  async selectCreditCardPayment() {
    // Click on credit card payment option

    // Try multiple selectors as KOMOJU might use different ones
    const selectors = [
      'button:has-text("クレジットカード")',
      'button:has-text("Credit Card")',
      '[data-payment-type="credit_card"]',
      ".payment-type-credit_card",
      'div[class*="credit"] button',
      'label:has-text("クレジット")',
      'input[value="credit_card"]',
      'button[aria-label*="credit" i]',
    ];

    for (const selector of selectors) {
      const element = this.page.locator(selector).first();
      if (await element.isVisible({ timeout: 1000 }).catch(() => false)) {
        await element.click();
        await this.page.waitForTimeout(1000);
        break;
      }
    }
  }

  async fillCreditCardForm(cardInfo: {
    number: string;
    expiry: string;
    cvv: string;
    name: string;
  }) {
    // Wait for credit card form to appear
    await this.page.waitForTimeout(2000);

    // Fill card number
    const cardNumberSelectors = [
      'input[name="card_number"]',
      'input[name="cardNumber"]',
      'input[placeholder*="カード番号" i]',
      'input[placeholder*="card number" i]',
      'input[id*="card-number" i]',
      'input[autocomplete="cc-number"]',
      "#cardNumber",
      ".card-number-input",
    ];

    for (const selector of cardNumberSelectors) {
      const input = this.page.locator(selector).first();
      if (await input.isVisible({ timeout: 1000 }).catch(() => false)) {
        await input.fill(cardInfo.number);
        break;
      }
    }

    // Fill expiry date
    const expirySelectors = [
      'input[name="card_expiry"]',
      'input[name="expiry"]',
      'input[placeholder*="有効期限" i]',
      'input[placeholder*="MM/YY" i]',
      'input[placeholder*="expiry" i]',
      'input[autocomplete="cc-exp"]',
      "#cardExpiry",
      ".card-expiry-input",
    ];

    for (const selector of expirySelectors) {
      const input = this.page.locator(selector).first();
      if (await input.isVisible({ timeout: 1000 }).catch(() => false)) {
        await input.fill(cardInfo.expiry);
        break;
      }
    }

    // Fill CVV
    const cvvSelectors = [
      'input[name="card_cvv"]',
      'input[name="cvv"]',
      'input[name="cvc"]',
      'input[placeholder*="CVV" i]',
      'input[placeholder*="CVC" i]',
      'input[placeholder*="セキュリティ" i]',
      'input[autocomplete="cc-csc"]',
      "#cardCvv",
      ".card-cvv-input",
    ];

    for (const selector of cvvSelectors) {
      const input = this.page.locator(selector).first();
      if (await input.isVisible({ timeout: 1000 }).catch(() => false)) {
        await input.fill(cardInfo.cvv);
        break;
      }
    }

    // Fill cardholder name
    const nameSelectors = [
      'input[name="card_name"]',
      'input[name="cardholderName"]',
      'input[placeholder*="カード名義" i]',
      'input[placeholder*="name" i]',
      'input[autocomplete="cc-name"]',
      "#cardName",
      ".card-name-input",
    ];

    for (const selector of nameSelectors) {
      const input = this.page.locator(selector).first();
      if (await input.isVisible({ timeout: 1000 }).catch(() => false)) {
        await input.fill(cardInfo.name);
        break;
      }
    }
  }

  async submitPayment() {
    // Submit the payment form
    const submitSelectors = [
      'button[type="submit"]:visible',
      'button:has-text("支払う")',
      'button:has-text("Pay")',
      'button:has-text("決済")',
      'button:has-text("Submit")',
      'input[type="submit"]',
      ".submit-button",
      "#submit-payment",
    ];

    for (const selector of submitSelectors) {
      const button = this.page.locator(selector).first();
      if (await button.isVisible({ timeout: 1000 }).catch(() => false)) {
        await button.click();
        break;
      }
    }
  }

  async waitForPaymentCompletion() {
    // Wait for payment to process
    await this.page.waitForTimeout(3000);

    // Wait for redirect or success message
    await Promise.race([
      this.page.waitForURL(/return/, { timeout: 30000 }),
      this.page.waitForSelector("text=/success|完了|complete/i", { timeout: 30000 }),
    ]).catch(() => {
      // Continue even if timeout
    });
  }
}
