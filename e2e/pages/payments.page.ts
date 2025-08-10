import type { Locator, Page } from "@playwright/test";

export class PaymentsPage {
  readonly page: Page;
  readonly paymentsTitle: Locator;
  readonly paymentsTable: Locator;
  readonly newPaymentLink: Locator;
  readonly noPaymentsMessage: Locator;
  readonly prevPageLink: Locator;
  readonly nextPageLink: Locator;

  constructor(page: Page) {
    this.page = page;
    this.paymentsTitle = page.getByTestId("payments-title");
    this.paymentsTable = page.getByTestId("payments-table");
    this.newPaymentLink = page.getByTestId("new-payment-link");
    this.noPaymentsMessage = page.getByTestId("no-payments");
    this.prevPageLink = page.getByTestId("prev-page-link");
    this.nextPageLink = page.getByTestId("next-page-link");
  }

  async goto() {
    await this.page.goto("/payments");
  }

  async goToNewPayment() {
    await this.newPaymentLink.click();
  }

  async goToNextPage() {
    await this.nextPageLink.click();
  }

  async goToPrevPage() {
    await this.prevPageLink.click();
  }

  async getPaymentRows() {
    return this.paymentsTable.locator("tbody tr");
  }
}
