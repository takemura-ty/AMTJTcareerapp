# AMTJTcareerapp

This workspace contains a minimal Next.js + TypeScript prototype for the AMTJT career portal.

Run locally:

```bash
npm install
npm run dev
```

Open http://localhost:3000 and use the configured student login or Supabase Auth staff login.

Implemented:
- Student login (server-verified session)
- 学生ページ: 見学・面接報告書一覧, 勉強会案内, 報告書提出リンク
- 職員ページ: 報告書一覧の Excel/CSV 一括更新と報告書一覧
- API: `/api/reports`, `/api/workshops` returning Supabase data when configured, otherwise mock data

Supabase Setup
--------------

1. Create a Supabase project.
2. Copy [.env.example](.env.example) to `.env.local` and fill in:

```bash
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
STUDENT_LOGIN_ID=your-student-login-id
STUDENT_LOGIN_PASSWORD=your-student-login-password
STUDENT_SESSION_SECRET=a-long-random-secret
```

3. Run the SQL in [supabase/schema.sql](supabase/schema.sql) inside the Supabase SQL Editor.
4. Restart the Next.js server.

If the environment variables are not set, the app continues to use the existing mock data.

File Uploads
------------

- PDF and image uploads and their metadata are stored in Supabase.
- `career-files` Storage bucket is created automatically on the first upload.
- Staff-side uploads for `JOB HUNTING TIPS` and `INFORMATION SESSION` require `SUPABASE_SERVICE_ROLE_KEY` on the server side. If this is missing, reading works but saving fails.

Report List Imports
-------------------

- Staff can upload `.xlsx` or `.xls` files from the visit or interview report page. New rows are added to the selected report type; existing rows with the same company, date, and major are skipped.
- Required header columns are `学科名`, `所在地`, and either `見学先名` with `見学日`, or `面接先名` with `面接日`. `治療院名` and `日付` can be used instead of the type-specific column names. `学科名` accepts values containing `鍼灸` or `柔道整復`.
- Optional columns are `市町村`, `院長先生や見学担当者の方の印象`, `スタッフの印象`, `院全体の印象`, `その他（印象に残ったことなど）`, `面接希望（３年生のみ）（１.２年生は希望者のみ）`, and `今後見学を希望する後輩へのアドバイス`.
- Interview report uploads also accept `面接官の人数`, `面接担当者`, `試験内容`, `質問を受けた内容`, `筆記試験・実技試験があった場合その内容`, `結果`, `結果が後日の場合、いつどのような形で届くのか`, and `今後面接を希望する後輩へのアドバイス`. Run the updated `supabase/schema.sql` once to add the corresponding columns and migrate existing interview reports.
- The import requires `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, and `SUPABASE_SERVICE_ROLE_KEY`.

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
