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
- API: `/api/reports`, `/api/workshops` returning mock data

Next steps:
- 実データベース（SQLite / PostgreSQL + ORM）への移行
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
