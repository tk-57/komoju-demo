import type { Locator, Page } from "@playwright/test";

export class HomePage {
  readonly page: Page;
  readonly pageTitle: Locator;
  readonly paymentForm: Locator;
  readonly amountInput: Locator;
  readonly submitButton: Locator;
  readonly paymentHistoryLink: Locator;
  readonly paymentMethodAll: Locator;
  readonly paymentMethodCreditCard: Locator;

  constructor(page: Page) {
    this.page = page;
    this.pageTitle = page.getByTestId("page-title");
    this.paymentForm = page.getByTestId("payment-form");
    this.amountInput = page.getByTestId("amount-input");
    this.submitButton = page.getByTestId("submit-button");
    this.paymentHistoryLink = page.getByTestId("payment-history-link");
    this.paymentMethodAll = page.getByTestId("payment-method-all");
    this.paymentMethodCreditCard = page.getByTestId("payment-method-credit_card");
  }

  async goto() {
    await this.page.goto("/");
  }

  async fillAmount(amount: string) {
    await this.amountInput.clear();
    await this.amountInput.fill(amount);
  }

  async selectPaymentMethod(method: string) {
    const paymentMethod = this.page.getByTestId(`payment-method-${method}`);
    await paymentMethod.check();
  }

  async submitPayment() {
    await this.submitButton.click();
  }

  async goToPaymentHistory() {
    await this.paymentHistoryLink.click();
  }
}
