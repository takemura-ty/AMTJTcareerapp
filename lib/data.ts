export type Report = {
  id: string
  company: string
  subCompany?: string
  region: string
  city?: string
  type: 'visit' | 'interview'
  date: string
  major: 'shinkyu' | 'judo'
  updatedAt?: string
  supervisorImpression?: string
  staffImpression?: string
  clinicImpression?: string
  otherNotes?: string
  interviewWish?: string
  advice?: string
}

export const reports: Report[] = [
  {
    id: 'r1',
    company: '田中治療院',
    subCompany: '田中グループ',
    region: '東京',
    city: '新宿区',
    type: 'visit',
    date: '2026-04-10',
    major: 'shinkyu',
    updatedAt: '2026-04-20',
    supervisorImpression: '院長先生が穏やかで、質問にも具体的に答えてくださいました。',
    staffImpression: 'スタッフ同士の声掛けが多く、連携が取りやすい雰囲気でした。',
    clinicImpression: '受付から施術室まで整理されていて、患者様への配慮が感じられました。',
    otherNotes: '見学中に物療機器の説明もしていただき、実際の運用を理解しやすかったです。',
    interviewWish: '面接を希望します。',
    advice: '気になったことはその場で質問すると、働くイメージが持ちやすいです。'
  },
  {
    id: 'r2',
    company: '鈴木整骨院',
    region: '大阪',
    city: '大阪市',
    type: 'interview',
    date: '2026-03-28',
    major: 'judo',
    updatedAt: '2026-04-20',
    supervisorImpression: '面接担当の先生が丁寧で、評価ポイントを明確に伝えてくださいました。',
    staffImpression: '学生への接し方が柔らかく、落ち着いて面接を受けられました。',
    clinicImpression: '活気がありつつも清潔感があり、来院数の多さに納得しました。',
    otherNotes: '実技確認では基本手技の説明力も見られました。',
    interviewWish: '面接希望あり。',
    advice: '自己紹介と志望動機は短く整理しておくと答えやすいです。'
  },
  {
    id: 'r3',
    company: 'みらい治療院',
    subCompany: 'みらいグループ',
    region: '東京',
    city: '立川市',
    type: 'visit',
    date: '2026-04-20',
    major: 'judo',
    updatedAt: '2026-04-20',
    supervisorImpression: '見学担当の先生が現場での役割を具体的に話してくださり理解しやすかったです。',
    staffImpression: '若手スタッフの方も積極的に話しかけてくださり、質問しやすかったです。',
    clinicImpression: '院内が明るく、患者様との距離感も近い印象でした。',
    otherNotes: '受付業務から施術補助まで幅広い業務説明がありました。',
    interviewWish: '今のところ未定です。',
    advice: '一日の流れを確認すると、自分が働く場面を想像しやすいです。'
  },
  {
    id: 'r4',
    company: 'さくら治療院',
    region: '北海道',
    city: '札幌市',
    type: 'interview',
    date: '2026-02-12',
    major: 'shinkyu',
    updatedAt: '2026-02-15',
    supervisorImpression: '面接の進行が丁寧で、こちらの話を最後まで聞いてくださいました。',
    staffImpression: 'スタッフの方が明るく、面接前後も緊張を和らげてくださいました。',
    clinicImpression: '地域密着型で患者様との信頼関係が強いと感じました。',
    otherNotes: '面接後に施設見学もあり、設備面まで確認できました。',
    interviewWish: '面接済みです。',
    advice: '見学時の印象と面接時の質問内容をセットで振り返ると比較しやすいです。'
  },
  {
    id: 'r5',
    company: '鈴木整骨院',
    region: '大阪',
    city: '大阪市',
    type: 'interview',
    date: '2026-04-18',
    major: 'shinkyu',
    updatedAt: '2026-04-20',
    supervisorImpression: '院長先生が教育体制を詳しく説明してくださり、入職後のイメージが湧きました。',
    staffImpression: 'スタッフ間の雰囲気が良く、新人の先生も意見を出しやすそうでした。',
    clinicImpression: '駅から近く通勤しやすく、院内導線も分かりやすかったです。',
    otherNotes: '筆記よりも対話重視の面接でした。',
    interviewWish: '第一希望です。',
    advice: '面接前に見学内容を振り返っておくと、志望理由につなげやすいです。'
  },
  {
    id: 'r6',
    company: '神戸中央治療院',
    region: '兵庫',
    city: '神戸市',
    type: 'visit',
    date: '2026-04-15',
    major: 'judo',
    updatedAt: '2026-04-20',
    supervisorImpression: '見学担当の方が現場で必要な姿勢を具体例つきで説明してくださいました。',
    staffImpression: 'スタッフの皆さんが患者様への声掛けを大切にしている印象でした。',
    clinicImpression: 'リハビリスペースが広く、チームで患者様を診る体制が整っていました。',
    otherNotes: '自費メニューの説明もあり、運営面も参考になりました。',
    interviewWish: '希望します。',
    advice: '神戸市内でも院ごとに特色が違うので、複数比較するとよいです。'
  }
]

export type Workshop = {
  id: string
  title: string
  date: string
  pdfUrl?: string
  fileName?: string
  updatedAt?: string
}

export const workshops: Workshop[] = [
  { id: 'w1', title: '治療技術セミナー', date: '2026-05-10', pdfUrl: '/pdfs/seminar1.pdf' },
  { id: 'w2', title: '就職対策講座', date: '2026-03-15', pdfUrl: '/pdfs/seminar2.pdf' },
  { id: 'w3', title: '最新治療事例', date: '2026-06-01', pdfUrl: '/pdfs/seminar3.pdf' }
]
