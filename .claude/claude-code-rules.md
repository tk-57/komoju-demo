# Claude Code コーディングルール

## 基本原則
このプロジェクトでは以下のコーディングルールを厳守してください。すべてのコード生成、修正、レビューにおいて、これらのルールが適用されます。

## 1. 言語とドキュメンテーション
- **コメント**: すべてのコメントは日本語で記述する
- **テストタイトル**: describe、it、testなどのテストタイトルは日本語で記述する
- **ドキュメント**: README、設計書、仕様書等も日本語で記述する

## 2. インポートとモジュール管理
- **インポートパス**: 相対パス（`../`、`./`）ではなく、絶対パス（`@/`、`~/`）を使用する
  ```typescript
  // ❌ 避けるべき
  import { Component } from '../components/Component'
  
  // ✅ 推奨
  import { Component } from '@/components/Component'
  ```

## 3. パッケージマネージャー
- **Bun優先**: npm/npxコマンドは使用せず、bun/bunxを使用する
  ```bash
  # ❌ 避けるべき
  npm install package-name
  npx create-next-app
  
  # ✅ 推奨
  bun install package-name
  bunx create-next-app
  ```

## 4. コード品質管理
- **Biome準拠**: すべてのコード（テストコードを含む）はbiome checkを通過する必要がある
- **ビルド成功**: コードは必ずビルドが成功する状態を維持する
- **継続的検証**: biome check、テスト、ビルドがすべて通過するまで修正を継続する

## 5. 命名規則
- **ファイル名**: ページコンポーネント以外はケバブケース（kebab-case）を使用
  ```
  ✅ user-profile.tsx
  ✅ api-client.ts
  ✅ use-auth-hook.ts
  ```
- **変数・関数名**: キャメルケース（camelCase）を使用
  ```typescript
  const userName = "田中太郎";
  function calculateTotalPrice() {}
  ```
- **コンポーネント名**: パスカルケース（PascalCase）を使用
  ```typescript
  function UserProfile() {}
  ```

## 6. プログラミングスタイル
- **関数型プログラミング**: classは使用せず、関数コンポーネントと関数型プログラミングを採用
- **関数宣言**: アロー関数より関数宣言を優先（特にエクスポート時）
  ```typescript
  // ✅ 推奨：個々人の記述に差異が出にくい
  export default async function HomePage() {
    return <div>ホーム</div>
  }
  
  // ❌ 避けるべき：記述スタイルにばらつきが生じやすい
  const HomePage = async () => {
    return <div>ホーム</div>
  }
  export default HomePage
  ```

## 7. バリデーション（Zod）

### 7.1 必須要件
- **すべての入力データにZodバリデーション**: APIリクエスト、フォーム入力、外部データソースからのデータは必ずZodでバリデーション
- **型安全性の確保**: Zodスキーマから型を推論し、TypeScriptの型として使用

### 7.2 Zodスキーマの実装パターン
```typescript
// スキーマ定義
import { z } from 'zodv4'

// ユーザー作成用スキーマ
const createUserSchema = z.object({
  name: z.string().min(1, '名前は必須です').max(50, '名前は50文字以内で入力してください'),
  email: z.string().email('有効なメールアドレスを入力してください'),
  age: z.number().min(0, '年齢は0以上である必要があります').max(150, '有効な年齢を入力してください'),
  role: z.enum(['admin', 'user', 'guest']),
  profile: z.object({
    bio: z.string().optional(),
    avatar: z.url('有効なURLを入力してください').optional()
  }).optional()
})

// 型の推論
type CreateUserInput = z.infer<typeof createUserSchema>
```

## 8. Next.js/React最適化

### 8.1 レンダリング戦略
- **Server Components優先**: 可能な限りServer Componentsとして実装
- **Client Components最小化**: 'use client'は本当に必要な場合のみ使用
- **SSR/SSG活用**: 静的生成可能なページは積極的にSSGを採用

### 8.2 Suspenseの適切な使用
- **範囲の最小化**: Suspenseは非同期処理部分のみをラップする
- **即座にレンダリング可能な部分は含めない**
  ```tsx
  // ✅ 推奨：必要最小限の範囲
  <div>
    <Header /> {/* すぐに表示される */}
    <Suspense fallback={<Loading />}>
      <AsyncDataComponent /> {/* 時間がかかる部分のみ */}
    </Suspense>
    <Footer /> {/* すぐに表示される */}
  </div>
  
  // ❌ 避けるべき：範囲が広すぎる
  <Suspense fallback={<Loading />}>
    <div>
      <Header />
      <AsyncDataComponent />
      <Footer />
    </div>
  </Suspense>
  ```

### 8.3 キャッシュ戦略
- **積極的なキャッシュ活用**: React Cache、Next.js Cache、データキャッシュを適切に使用
- **キャッシュの種類**:
  - Request Memoization
  - Data Cache
  - Full Route Cache
  - Router Cache
- **revalidateの適切な設定**: データの更新頻度に応じて適切に設定

## 9. データフェッチング

### 9.1 Server Actions
- **用途制限**: Server ActionsはMutation（作成・更新・削除）処理のみに使用
- **Query処理**: データ取得はServer Componentsまたは専用のfetch関数で行う
  ```typescript
  // ✅ 推奨：Mutation用Server Action
  async function createUser(formData: FormData) {
    'use server'
    // Zodでバリデーション後、ユーザー作成処理
  }
  
  // ❌ 避けるべき：Query用Server Action
  async function getUsers() {
    'use server'
    // これは避ける - Server Componentで直接取得
  }
  ```

### 9.2 Client側のデータ取得
- **fetchの禁止**: Client ComponentsでfetchやaxiosによるAPI呼び出しは行わない
- **Server Actions経由**: 必要な場合はServer Actionsを介してデータを取得
- **データの受け渡し**: Server Componentsからprops経由でデータを渡す

## 10. エラーハンドリング
- **Error Boundaries**: 適切なエラーバウンダリーを設置
- **try-catch**: 非同期処理には必ずエラーハンドリングを実装
- **Zodエラーの処理**: バリデーションエラーは適切にキャッチし、ユーザーフレンドリーなメッセージに変換
- **ユーザーフィードバック**: エラー時は適切なメッセージを表示

## 11. パフォーマンス最適化
- **動的インポート**: 必要に応じてdynamic importを使用
- **画像最適化**: next/imageを使用し、適切なサイズと形式を指定
- **バンドルサイズ**: 不要な依存関係を避け、Tree Shakingを活用

## 12. セキュリティ
- **環境変数**: 機密情報は必ず環境変数で管理（Zodでバリデーション）
- **入力検証**: すべてのユーザー入力をZodで検証・サニタイズ
- **CSRF対策**: Server Actionsは自動的にCSRF保護されることを理解
- **SQLインジェクション対策**: Zodバリデーション後のデータのみをクエリに使用

## 13. テスト
- **テストカバレッジ**: 重要なビジネスロジックは必ずテストを書く
- **Zodスキーマのテスト**: 各スキーマの正常系・異常系をテスト
- **テストの種類**:
  - Unit Tests（単体テスト）- Zodスキーマを含む
  - Integration Tests（統合テスト）
  - E2E Tests（必要に応じて）
- **テスト駆動開発**: 可能な限りTDDアプローチを採用

## 14. ディレクトリ構成

```
project-root/
├── .claude/                     # Claude Code設定ディレクトリ
│   └── claude-code-rules.md     # プロジェクト固有のコーディングルール
├── e2e/                         # E2Eテストディレクトリ
│   ├── fixtures/                # テスト共通設定・ユーティリティ
│   │   └── *.ts                 # テストベース設定
│   ├── pages/                   # Page Objectモデル
│   │   └── *.page.ts            # 各ページの操作を抽象化
│   └── specs/                   # テストスペック
│       └── *.spec.ts            # 実際のテストケース
├── public/                      # 静的ファイルディレクトリ
│   └── *.*                      # 画像、アイコン、フォントなど
├── src/                         # メインソースコードディレクトリ
│   ├── app/                     # Next.js App Router
│   │   ├── api/                 # API Routes
│   │   │   └── */
│   │   │       └── route.ts     # RESTエンドポイント
│   │   ├── sample               # サンプルルーティング
│   │   │   ├── layout.tsx       # サンプルのレイアウト
│   │   │   ├── loading.tsx      # サンプルのローディングUI
│   │   │   ├── error.tsx        # サンプルのエラーUI
│   │   │   └── page.tsx         # サンプルのページ
│   │   ├── page.tsx             # ページコンポーネント
│   │   ├── layout.tsx           # レイアウトコンポーネント
│   │   ├── loading.tsx          # ローディングUI
│   │   ├── error.tsx            # エラーUI
│   │   ├── not-found.tsx        # 404ページ
│   │   ├── globals.css          # グローバルスタイル
│   │   └── favicon.ico          # ファビコン
│   ├── components/              # Reactコンポーネント
│   │   ├── domain/              # ドメイン固有コンポーネント
│   │   │   └── *.tsx            # 機能別コンポーネント
│   │   ├── provider/            # プロバイダーコンポーネント
│   │   │   └── *.tsx            # 機能別コンポーネント
│   │   └── ui/                  # 汎用UIコンポーネント
│   │       └── *.tsx            # ボタン、フォーム等
│   └── lib/                     # ビジネスロジック・ユーティリティ
│       ├── actions/             # Server Actions
│       │   └── *.ts             # フォーム処理・Mutation
│       ├── constants/           # 定数定義
│       │   └── *.ts             # 設定値、列挙型等
│       ├── schemas/             # Zodスキーマ
│       │   └── *.ts             # データバリデーション
│       ├── services/            # 外部サービス連携
│       │   └── *.ts             # API クライアント
│       └── utils/               # ユーティリティ関数
│           └── *.ts             # ヘルパー関数
├── biome.json                   # Biomeリンター・フォーマッター設定
├── next.config.*                # Next.js設定
├── package.json                 # 依存関係・スクリプト定義
├── playwright.config.*          # Playwright E2Eテスト設定
├── postcss.config.*             # PostCSS設定
├── tsconfig.json                # TypeScript設定
└── README.md                    # プロジェクトドキュメント
```

## 適用順序
1. Zodスキーマを定義し、型を推論
2. バリデーションロジックを実装
3. biome checkが通るようにコードを記述
4. テストを作成し、すべてのテストが通過することを確認
5. ビルドが成功することを確認
6. 上記すべてが通過するまで修正を継続

## 注意事項
- これらのルールは厳守事項です
- 特にZodバリデーションは、セキュリティとデータ整合性の観点から省略不可です
- 例外が必要な場合は、必ずコメントで理由を明記してください
- 定期的にルールの見直しと更新を行ってください