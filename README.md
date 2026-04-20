# AMTJTcareerapp

This workspace contains a minimal Next.js + TypeScript prototype for the AMTJT career portal.

Run locally:

```bash
npm install
npm run dev
```

Open http://localhost:3000 and use the mock login to enter as `学生` or `職員`.

Implemented:
- Mock login (client-side)
- 学生ページ: 見学・面接報告書一覧, 勉強会案内, 報告書提出リンク
- 職員ページ: ファイルアップロード（モック）と報告書一覧
- API: `/api/reports`, `/api/workshops` returning Supabase data when configured, otherwise mock data

Supabase Setup
--------------

1. Create a Supabase project.
2. Copy [.env.example](.env.example) to `.env.local` and fill in:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
BLOB_READ_WRITE_TOKEN=your-vercel-blob-read-write-token
```

3. Run the SQL in [supabase/schema.sql](supabase/schema.sql) inside the Supabase SQL Editor.
4. Restart the Next.js server.

If the environment variables are not set, the app continues to use the existing mock data.

File Uploads
------------

- PDF and image uploads are stored in Vercel Blob.
- Metadata for uploaded files is stored in Supabase.
- Staff-side uploads for `JOB HUNTING TIPS` and `INFORMATION SESSION` require both Supabase and `BLOB_READ_WRITE_TOKEN` to be configured.

Staff Login
-----------

- Staff login is managed in Supabase Authentication.
- Create a user in Supabase Auth with the staff email address and password you want to use.
- The current staff login ID is `career@toyoiryo.ac.jp`.
- Staff login uses Supabase Auth directly from the login page.

Next steps:
- Supabase への書き込み処理追加
- 認証の本実装
- 報告書入力フォーム・PDFアップロード

Preview
-------

ローカルで本番ビルドを確認するには次のコマンドを実行します。

```bash
npm install
npm run preview
```

これにより `next build` でビルドした後、`next start` でサーバーを起動します。デフォルトで http://localhost:3000 にアクセスしてください。

Docker（コンテナでプレビュー）
-----------------

コンテナで動作確認するには次のコマンドを使います。

```bash
docker build -t amtjt-careerapp:latest .
docker run -p 3000:3000 --rm amtjt-careerapp:latest
```

これによりビルド済みイメージが作られ、ホストの `3000` ポートで公開されます。
