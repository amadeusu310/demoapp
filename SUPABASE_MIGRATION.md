# Supabase移行ガイド

## セットアップ手順

### 1. Supabaseプロジェクトの作成
1. [Supabase](https://supabase.com)にアクセス
2. 新しいプロジェクトを作成
3. プロジェクトURLとanonキーを取得

### 2. 環境変数の設定
`.env`ファイルに以下の内容を設定してください：

```env
VITE_SUPABASE_URL=あなたのSupabaseプロジェクトURL
VITE_SUPABASE_ANON_KEY=あなたのSupabase anonキー
```

### 3. データベーススキーマの作成
`supabase-schema.sql`ファイルの内容をSupabaseのSQL Editorで実行してください。

### 4. 変更内容

#### ファイル構造
- `app/utils/supabase.ts` - Supabaseクライアント設定
- `app/utils/supabaseClient.ts` - データベース操作用API
- `supabase-schema.sql` - データベーススキーマ

#### 主な変更点
- `mockServer.ts`の代わりに`supabaseClient.ts`を使用
- LocalStorageの代わりにSupabaseのデータベースとテーブルを使用
- 型定義をSupabaseのスキーマに合わせて調整
- セッション管理はローカルストレージ + データベーステーブルで管理

#### データベーステーブル
- `users` - ユーザー情報
- `projects` - プロジェクト情報
- `project_participants` - プロジェクト参加者（多対多関係）
- `tasks` - タスク情報
- `sessions` - セッション管理

### 5. 実行

```bash
npm run dev
```

## 注意事項

- 初期データは`supabase-schema.sql`で自動的に挿入されます
- パスワードはプレーンテキストで保存されています（本番環境では適切なハッシュ化が必要）
- Row Level Security（RLS）は現在無効にしています（必要に応じて有効化してください）

## 今後の改善点

1. パスワードのハッシュ化
2. Row Level Security（RLS）の実装
3. エラーハンドリングの改善
4. データベース接続のテスト機能
5. 環境変数の検証
