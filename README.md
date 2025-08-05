# ハッカソンテンプレート (React版)

シンプルなカウンターアプリのReact + React Router + Tailwind CSSテンプレートです。  
ハッカソンやプロトタイプ開発の出発点として使用できます。

## 🚀 クイックスタート

### 必要な環境

- Node.js 18以上
- npm または yarn

### セットアップと起動

```bash
# 依存関係をインストール
npm install

# 開発サーバーを起動
npm run dev
```

ブラウザで `http://localhost:5173` にアクセスしてください。

### その他のコマンド

```bash
# プロダクション用ビルド
npm run build

# 型チェック
npm run typecheck

# プロダクション版を起動
npm run start
```

## 📁 プロジェクト構成

```
dohack-template-react/
├── app/                    # アプリケーションのメインコード
│   ├── routes/            # ページコンポーネント
│   │   ├── home.tsx       # メインページ（カウンター）
│   │   └── about.tsx      # このアプリについてページ
│   ├── app.css            # グローバルスタイル
│   ├── root.tsx           # ルートコンポーネント
│   └── routes.ts          # ルーティング設定
├── public/                # 静的ファイル
│   └── favicon.ico
├── package.json           # 依存関係とスクリプト
├── vite.config.ts         # Vite設定
├── tsconfig.json          # TypeScript設定
├── react-router.config.ts # React Router設定
└── README.md
```

## 🏗️ アーキテクチャ

### 技術スタック

- **React 19**: UIライブラリ
- **React Router v7**: SPA（Single Page Application）のルーティング
- **TypeScript**: 静的型付けによる開発体験の向上
- **Tailwind CSS v4**: ユーティリティファーストなCSSフレームワーク
- **Vite**: 高速なビルドツール

### 設計思想

- **シンプル**: 最小限の機能で学習しやすい構成
- **モダン**: 最新の技術スタックを採用
- **拡張可能**: 機能追加がしやすい構造

## 🎯 実装されている機能

### 1. カウンター機能
- **状態管理**: `useState`フックでカウンターの値を管理
- **操作**: +1、-1、リセットボタン
- **リアルタイム更新**: ボタンクリックで即座に画面更新

### 2. ページ遷移
- **React Router**: 宣言的なルーティング
- **2つのページ**: メインページ（`/`）と紹介ページ（`/about`）
- **ナビゲーション**: `Link`コンポーネントによるSPA内遷移

### 3. レスポンシブデザイン
- **Tailwind CSS**: ユーティリティクラスによるスタイリング
- **モバイル対応**: 画面サイズに応じたレイアウト調整

## 📚 主要ファイルの説明

### `app/routes/home.tsx`
メインページのコンポーネント。カウンター機能を実装。

```tsx
const [counter, setCounter] = useState(0);  // 状態管理
const incrementCounter = () => setCounter(prev => prev + 1);  // カウンター増加
```

### `app/routes/about.tsx`
アプリの紹介ページ。技術スタックや機能の説明を表示。

### `app/routes.ts`
ルーティング設定。URL とコンポーネントの対応関係を定義。

```tsx
export default [
  index("routes/home.tsx"),      // / → home.tsx
  route("/about", "routes/about.tsx"),  // /about → about.tsx
] satisfies RouteConfig;
```

### `app/root.tsx`
アプリケーションのルートコンポーネント。HTML構造とエラーハンドリングを定義。

## 🛠️ カスタマイズのヒント

### 新しいページを追加する

1. `app/routes/` に新しい `.tsx` ファイルを作成
2. `app/routes.ts` にルートを追加

```tsx
// app/routes.ts
export default [
  index("routes/home.tsx"),
  route("/about", "routes/about.tsx"),
  route("/new-page", "routes/new-page.tsx"),  // 新しいページ
] satisfies RouteConfig;
```

### スタイルをカスタマイズする

Tailwind CSSのユーティリティクラスを使用してスタイルを調整できます。

```tsx
<button className="bg-blue-600 hover:bg-blue-800 text-white px-6 py-3 rounded">
  ボタン
</button>
```

### 状態管理を拡張する

より複雑な状態管理が必要な場合は、Context APIやZustandなどを検討してください。

## 🐛 トラブルシューティング

### ポートが使用中の場合
```bash
# 異なるポートで起動
npm run dev -- --port 3001
```

### 型エラーが発生する場合
```bash
# 型定義を再生成
npm run typecheck
```

### ビルドエラーが発生する場合
```bash
# node_modulesを削除して再インストール
rm -rf node_modules package-lock.json
npm install
```

## 📖 学習リソース

- [React公式ドキュメント](https://react.dev/)
- [React Router公式ドキュメント](https://reactrouter.com/)
- [Tailwind CSS公式ドキュメント](https://tailwindcss.com/)
- [TypeScript公式ドキュメント](https://www.typescriptlang.org/)

## 🎨 次のステップ

このテンプレートから始めて、以下のような機能を追加してみてください：

- [ ] データの永続化（localStorage、API連携）
- [ ] 複数のカウンター管理
- [ ] アニメーション効果
- [ ] フォーム入力
- [ ] 外部APIとの連携
- [ ] 認証機能
- [ ] データベース接続

ハッピーハッキング！ 🚀