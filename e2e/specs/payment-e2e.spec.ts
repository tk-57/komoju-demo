import { expect, test } from "../fixtures/test-base";
import { HomePage } from "../pages/home.page";
import { PaymentsPage } from "../pages/payments.page";

test.describe("決済 E2E テスト", () => {
  test.setTimeout(60000); // 決済処理のタイムアウトを延長

  const TEST_CARD = {
    email: "test@example.com",
    name: "TEST USER",
    number: "4111111111111111",
    expiry: "12/25",
    cvv: "123",
  };

  test.describe("基本的な UI 機能", () => {
    test("ホームページが正しく表示される", async ({ page }) => {
      const homePage = new HomePage(page);
      await homePage.goto();

      // 基本要素をチェック
      await expect(homePage.pageTitle).toBeVisible();
      await expect(homePage.pageTitle).toHaveText("KOMOJU サンプル決済");

      await expect(homePage.paymentForm).toBeVisible();
      await expect(homePage.amountInput).toBeVisible();
      await expect(homePage.amountInput).toHaveValue("1000");

      await expect(homePage.submitButton).toBeVisible();
      await expect(homePage.submitButton).toHaveText("決済ページへ");

      await expect(homePage.paymentHistoryLink).toBeVisible();
      await expect(homePage.paymentHistoryLink).toHaveText("決済履歴を見る");

      // 決済方法をチェック
      await expect(homePage.paymentMethodAll).toBeVisible();
      await expect(homePage.paymentMethodAll).toBeChecked();
      await expect(homePage.paymentMethodCreditCard).toBeVisible();
    });

    test("ページ間の遷移ができる", async ({ page }) => {
      const homePage = new HomePage(page);
      const paymentsPage = new PaymentsPage(page);

      // ホームページから開始
      await homePage.goto();
      await expect(homePage.pageTitle).toBeVisible();

      // 決済履歴ページへ遷移
      await homePage.goToPaymentHistory();
      await expect(page).toHaveURL("/payments");
      await expect(paymentsPage.paymentsTitle).toBeVisible();

      // ホームページへ戻る
      await paymentsPage.goToNewPayment();
      await expect(page).toHaveURL("/");
      await expect(homePage.pageTitle).toBeVisible();
    });

    test("決済履歴ページが表示される", async ({ page }) => {
      const paymentsPage = new PaymentsPage(page);
      await paymentsPage.goto();

      // ページ要素をチェック
      await expect(paymentsPage.paymentsTitle).toBeVisible();
      await expect(paymentsPage.paymentsTitle).toHaveText("決済履歴");

      await expect(paymentsPage.newPaymentLink).toBeVisible();
      await expect(paymentsPage.newPaymentLink).toHaveText("新規決済");

      // ページの読み込みを待つ（テーブルまたは決済履歴なしメッセージ）
      await page.waitForTimeout(3000);

      // ページのコンテンツが読み込まれたことを確認
      const containerElement = page.locator(".container");
      await expect(containerElement).toBeVisible();

      const hasContent = await containerElement.textContent();
      expect(hasContent).toBeTruthy();
      expect(hasContent?.length).toBeGreaterThan(0);
    });
  });

  test.describe("フォームバリデーション", () => {
    test("金額入力のバリデーション", async ({ page }) => {
      const homePage = new HomePage(page);
      await homePage.goto();

      // 空の金額でテスト
      await homePage.fillAmount("");
      const isEmpty = await homePage.amountInput.evaluate((el: HTMLInputElement) => {
        el.setCustomValidity("");
        return !el.checkValidity();
      });
      expect(isEmpty).toBe(true);

      // 0円でテスト
      await homePage.fillAmount("0");
      const isZero = await homePage.amountInput.evaluate((el: HTMLInputElement) => {
        el.setCustomValidity("");
        return !el.checkValidity();
      });
      expect(isZero).toBe(true);

      // 負の金額でテスト
      await homePage.fillAmount("-100");
      const isNegative = await homePage.amountInput.evaluate((el: HTMLInputElement) => {
        el.setCustomValidity("");
        return !el.checkValidity();
      });
      expect(isNegative).toBe(true);

      // 有効な金額でテスト
      await homePage.fillAmount("1000");
      const isValid = await homePage.amountInput.evaluate((el: HTMLInputElement) => {
        el.setCustomValidity("");
        return el.checkValidity();
      });
      expect(isValid).toBe(true);
    });

    test("決済方法の選択ができる", async ({ page }) => {
      const homePage = new HomePage(page);
      await homePage.goto();

      // デフォルト選択をチェック
      await expect(homePage.paymentMethodAll).toBeChecked();
      await expect(homePage.paymentMethodCreditCard).not.toBeChecked();

      // 選択を変更
      await homePage.selectPaymentMethod("credit_card");
      await expect(homePage.paymentMethodCreditCard).toBeChecked();
      await expect(homePage.paymentMethodAll).not.toBeChecked();

      // 元に戻す
      await homePage.selectPaymentMethod("all");
      await expect(homePage.paymentMethodAll).toBeChecked();
      await expect(homePage.paymentMethodCreditCard).not.toBeChecked();
    });

    test("バリデーションエラー時にフォーム状態が維持される", async ({ page }) => {
      const homePage = new HomePage(page);
      await homePage.goto();

      // 決済方法を選択
      await homePage.selectPaymentMethod("konbini");

      // バリデーションを発生させるため金額をクリア
      await homePage.fillAmount("");

      // 送信を試行（バリデーションエラーになるはず）
      await homePage.amountInput.evaluate((el: HTMLInputElement) => {
        el.form?.requestSubmit();
      });

      // 決済方法の選択が維持されるべき
      const konbiniMethod = page.getByTestId("payment-method-konbini");
      await expect(konbiniMethod).toBeChecked();

      // フォームは同じページにとどまるべき（送信されない）
      await expect(page).toHaveURL("/");
    });

    test("送信中にローディング状態を表示する", async ({ page }) => {
      const homePage = new HomePage(page);
      await homePage.goto();

      await homePage.fillAmount("3000");

      // 送信を開始して即座にローディング状態をチェック
      const submitPromise = homePage.submitPayment();

      // ローディング状態をチェック（素早く表示される）
      await expect(homePage.submitButton).toHaveText("処理中...", { timeout: 1000 });
      await expect(homePage.submitButton).toBeDisabled();

      // 送信完了を待つ
      await submitPromise;

      // 決済ページにリダイレクトされる
      await page.waitForURL(/komoju\.com/, { timeout: 15000 });
    });
  });

  test.describe("決済セッション作成", () => {
    test("クレジットカード選択で決済セッションを作成", async ({ page }) => {
      const homePage = new HomePage(page);
      await homePage.goto();

      // フォームに入力
      await homePage.fillAmount("2000");
      await homePage.selectPaymentMethod("credit_card");

      // フォームを送信
      await homePage.submitPayment();

      // KOMOJU決済ページへのリダイレクトを待つ
      await page.waitForURL(/komoju\.com/, { timeout: 15000 });

      // KOMOJU決済ページにいることを確認
      await expect(page).toHaveURL(/komoju\.com/);

      // ページに決済フォーム要素が含まれている
      const pageContent = await page.textContent("body");
      expect(pageContent).toBeTruthy();
    });

    test("すべての決済方法で決済セッションを作成", async ({ page }) => {
      const homePage = new HomePage(page);
      await homePage.goto();

      // デフォルト選択（すべて）を維持
      await homePage.fillAmount("1500");

      // デフォルト選択を確認
      await expect(homePage.paymentMethodAll).toBeChecked();

      // フォームを送信
      await homePage.submitPayment();

      // KOMOJU決済ページへのリダイレクトを待つ
      await page.waitForURL(/komoju\.com/, { timeout: 15000 });

      // KOMOJU決済ページにリダイレクトされる
      await expect(page).toHaveURL(/komoju\.com/);
    });

    test("異なる決済金額を処理できる", async ({ page }) => {
      const homePage = new HomePage(page);
      const testAmounts = ["500", "10000"];

      for (const amount of testAmounts) {
        await homePage.goto();

        // 異なる金額でテスト
        await homePage.fillAmount(amount);

        // 送信してリダイレクトを確認
        await homePage.submitPayment();
        await page.waitForURL(/komoju\.com/, { timeout: 15000 });

        // 成功したリダイレクトを確認
        await expect(page).toHaveURL(/komoju\.com/);

        // 次のテストのため戻る
        await page.goBack();
        await page.waitForTimeout(1000);
      }
    });
  });

  test.describe("完全な決済フロー", () => {
    test("テストクレジットカードで完全な決済を実行", async ({ page }) => {
      const homePage = new HomePage(page);

      // ステップ1: ホームページから開始
      await homePage.goto();
      await expect(homePage.pageTitle).toBeVisible();

      // ステップ2: 決済フォームに入力
      await homePage.fillAmount("1000");
      await homePage.selectPaymentMethod("credit_card");

      // ステップ3: 決済セッション作成のため送信
      await homePage.submitPayment();

      // ステップ4: KOMOJUへのリダイレクトを待つ
      await page.waitForURL(/komoju\.com/, { timeout: 15000 });

      // ステップ5: KOMOJUページの読み込みを待つ
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(2000);

      // ステップ6: テストカードでKOMOJU決済フォームに入力
      await page.getByRole("textbox", { name: "メールアドレス" }).fill(TEST_CARD.email);
      await page.getByRole("textbox", { name: "カード所有者名" }).fill(TEST_CARD.name);
      await page.getByRole("textbox", { name: "カード番号" }).fill(TEST_CARD.number);
      await page.getByRole("textbox", { name: "有効期限" }).fill(TEST_CARD.expiry);
      await page.getByRole("textbox", { name: "セキュリティコード" }).fill(TEST_CARD.cvv);

      // ステップ7: 決済を送信
      await page.getByRole("button", { name: /支払い.*￥/ }).click();

      // ステップ8: 戻りページへのリダイレクトを待つ
      await page.waitForURL(/\/return/, { timeout: 30000 });

      // ステップ9: 決済完了を確認
      await expect(page.locator('text="決済完了 — ありがとうございます"')).toBeVisible();
      await expect(page.locator("text=/captured/i")).toBeVisible();
      await expect(page.locator("text=/金額.*1000/")).toBeVisible();
    });

    test("複数の金額で決済完了できる", async ({ page }) => {
      const homePage = new HomePage(page);
      const testAmounts = ["2500", "5000"];

      for (const amount of testAmounts) {
        // ホームページに遷移
        await homePage.goto();
        await homePage.fillAmount(amount);
        await homePage.selectPaymentMethod("credit_card");

        // 決済フォームを送信
        await homePage.submitPayment();

        // KOMOJUリダイレクトを待つ
        await page.waitForURL(/komoju\.com/, { timeout: 15000 });
        await page.waitForLoadState("networkidle");
        await page.waitForTimeout(2000);

        // KOMOJU決済フォームに入力
        await page.getByRole("textbox", { name: "メールアドレス" }).fill(TEST_CARD.email);
        await page.getByRole("textbox", { name: "カード所有者名" }).fill(TEST_CARD.name);
        await page.getByRole("textbox", { name: "カード番号" }).fill(TEST_CARD.number);
        await page.getByRole("textbox", { name: "有効期限" }).fill(TEST_CARD.expiry);
        await page.getByRole("textbox", { name: "セキュリティコード" }).fill(TEST_CARD.cvv);

        // 決済を送信
        await page.getByRole("button", { name: /支払い.*￥/ }).click();

        // 戻りページへのリダイレクトを待つ
        await page.waitForURL(/\/return/, { timeout: 30000 });

        // 決済完了を確認
        await expect(page.locator('text="決済完了 — ありがとうございます"')).toBeVisible();
        await expect(page.locator("text=/captured/i")).toBeVisible();
        await expect(page.locator(`text=/金額.*${amount}/`)).toBeVisible();
      }
    });
  });

  test.describe("エラー処理", () => {
    test("無効なカード番号を処理できる", async ({ page }) => {
      const homePage = new HomePage(page);

      // 遷移して決済を設定
      await homePage.goto();
      await homePage.fillAmount("1000");
      await homePage.selectPaymentMethod("credit_card");
      await homePage.submitPayment();

      // KOMOJUを待つ
      await page.waitForURL(/komoju\.com/, { timeout: 15000 });
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(2000);

      // 無効なカード番号でフォームに入力
      await page.getByRole("textbox", { name: "メールアドレス" }).fill(TEST_CARD.email);
      await page.getByRole("textbox", { name: "カード所有者名" }).fill(TEST_CARD.name);
      await page.getByRole("textbox", { name: "カード番号" }).fill("4111111111111112"); // 無効なカード
      await page.getByRole("textbox", { name: "有効期限" }).fill(TEST_CARD.expiry);
      await page.getByRole("textbox", { name: "セキュリティコード" }).fill(TEST_CARD.cvv);

      // 決済を送信
      await page.getByRole("button", { name: /支払い.*￥/ }).click();

      // KOMOJUページにとどまる（成功ページにリダイレクトされない）
      await page.waitForTimeout(5000);
      const currentUrl = page.url();
      expect(currentUrl).toContain("komoju.com");
      expect(currentUrl).not.toContain("/return");
    });

    test("フォーム送信エラーを適切に処理する", async ({ page }) => {
      const homePage = new HomePage(page);
      await homePage.goto();

      // 無効な金額（0円）でテスト
      await homePage.fillAmount("0");

      // HTML5バリデーションによりフォーム送信が阻止される
      const isValid = await homePage.amountInput.evaluate((el: HTMLInputElement) => {
        return el.checkValidity();
      });
      expect(isValid).toBe(false);
    });
  });
});
