import { yearsExperience } from "../../utils/experience.ts";
import type { Messages } from "../messages.ts";

const ja: Messages = {
  site: {
    tagline: "意図をもって設計し、技巧をもって構築する。",
    pageTitle: "Jane Doe - フロントエンドエンジニア",
    skipLinkLabel: "メインコンテンツへスキップ",
    sectionErrorMessage: "申し訳ありません。このセクションを読み込めませんでした。",
    defaultLogoAlt: "デフォルト",
  },
  languageCopy: {
    label: "言語 (Language)",
    disclaimer: "この翻訳は AI の支援を受けており、誤りを含む場合があります。原文は英語です。",
    readInEnglish: "Read in English",
  },
  loader: { enterText: "INITIALIZING", portfolioLabel: "PORTFOLIO" },
  navLinks: {
    about: { label: "概要" },
    skills: { label: "スキル", title: "スキルと技術スタック" },
    projects: { label: "プロジェクト" },
    oss: { label: "OSS", title: "オープンソース" },
    experience: { label: "職歴", title: "職歴" },
    education: { label: "学歴" },
    awards: { label: "受賞歴" },
    contact: { label: "連絡先" },
  },
  navMenuLabel: { open: "メニューを開く", close: "メニューを閉じる" },
  availability: {
    compact: "求職中",
    full: "新しい仕事を探しています",
    statuses: ["新しい仕事を探しています", "正社員も歓迎", "フリーランス · コンサルティング"],
  },
  availabilitySince: (since) => `${since}から`,
  availabilityLinkSuffix: " - お問い合わせ",
  hero: {
    eyebrow: "シニア・フロントエンドエンジニア · デザインシステムとアクセシビリティ",
    roles: { frontend: "フロントエンド開発", design: "デザインシステム" },
    taglineHtml:
      "あなたが何をつくり、何が<b>強み</b>なのかを伝える、短く印象的な<b>キャッチコピー</b>。1〜2 文にまとめましょう。",
    ctaPrimary: "実績を見る →",
    ctaGhost: "履歴書をダウンロード",
    floatChips: {
      stack: "TypeScript · React",
      a11y: "アクセシビリティ · パフォーマンス",
      years: `エンジニア歴 ${yearsExperience} 年`,
    },
  },
  stats: {
    years: "年のソフトウェア開発経験",
    degree: "情報科学 - あなたの大学",
    oss: "オープンソースに貢献",
  },
  about: {
    headlineHtml: `${yearsExperience} 年、Web のためにつくり続けてきました。<br/><em>ここを</em>あなた自身の一行のストーリーに置き換えてください。`,
    bodyHtml:
      "あなたについて 1〜2 段落で:何をつくり、どのように働き、何を大切にしているか。読み手に覚えてほしいフレーズは<b>太字</b>にしましょう。<br/><br/>このページの内容はすべて <b>src/site.config.ts</b> と <b>src/i18n/locales/</b> の言語ファイルから生成されるため、コンポーネントに触れずに内容を変更できます。",
  },
  impactTitle: "数字で見る実績",
  impact: {
    users: { label: "月間ユーザー", context: "リリースに携わったプロダクト全体で" },
    components: { label: "再利用可能なコンポーネント", context: "共有デザインシステム内" },
    teams: { label: "支援したチーム", context: "同じコンポーネントライブラリを利用" },
    speed: { label: "読み込み時間を短縮", context: "パフォーマンス改善の結果" },
  },
  skillCategories: {
    frontend: "フロントエンドアーキテクチャ",
    styling: "CSS とスタイリング",
    tooling: "ツールとビルド",
    testing: "テスト",
  },
  viewProjectLabel: "プロジェクトを見る",
  projects: {
    designSystem: {
      type: "デザインシステム",
      desc: "アクセシビリティを組み込んだ、テーマ変更可能な React コンポーネントライブラリ。キーボード操作、フォーカス表示、色のコントラストを CI でチェックしています。あなたの代表的なプロジェクトに置き換えてください。",
    },
    dashboard: {
      type: "Web アプリ",
      desc: "サーバーで描画するグラフと、大量のデータでも高速なフィルターを備えたリアルタイム分析ダッシュボード。",
    },
    checkout: {
      type: "EC",
      desc: "速さを重視して作り直したモバイルファーストの決済フロー。すべての支払い方法を E2E テストでカバーしています。",
    },
  },
  repos: {
    "awesome-ui-kit": "React 向けの小さくてアクセシブルな UI キット。",
    "dev-notes": "何度も見返しているメモとスニペット集。",
    "weekend-project": "週末に作った遊びのプロジェクト。",
  },
  experienceNodes: {
    acme: {
      year: "2023 - 現在",
      role: "シニア・フロントエンドエンジニア",
      detail:
        "フロントエンドのアーキテクチャを主導し、5 名のエンジニアを指導。数百万人が使う、高速でアクセシブルな Web アプリを提供しています。",
    },
    techstart: {
      year: "2020 - 2023",
      role: "フロントエンドエンジニア",
      detail:
        "React と TypeScript でプロダクトの主要機能を開発し、パフォーマンス改善でページの読み込み時間を 40% 短縮しました。",
    },
    webworks: {
      year: "2018 - 2020",
      role: "ジュニア開発者",
      detail:
        "さまざまな業界のクライアント向けにレスポンシブな Web サイトを制作し、HTML・CSS・JavaScript を深く学びました。",
    },
  },
  educationNodes: {
    degree: {
      degree: "学士 - 情報科学",
      school: "あなたの大学",
      detail: "ソフトウェア工学、アルゴリズム、ヒューマンコンピュータインタラクション。",
    },
    school: { degree: "高等学校", school: "あなたの高校", detail: "数学、物理、情報。" },
  },
  awards: {
    excellence: "エンジニアリング優秀賞",
    hackathon: "ハッカソン優勝",
  },
  heading: { muted: "一緒に、", grad: "本物をつくりましょう。" },
  note: "新しい機会や興味深い対話を歓迎します。正社員のポジション、フリーランスの案件、あるいは Web についての雑談でも。",
  openTo: ["正社員のポジション", "フリーランスの案件", "オープンソースでの協業", "オンラインでの雑談"],
  profile: {
    headline: "シニア・フロントエンドエンジニア · デザインシステム",
    location: "イギリス・ロンドン",
    meta: [`ソフトウェア開発経験 ${yearsExperience} 年`, "情報科学 学士 · あなたの大学"],
    highlightsHtml: [
      "6 つのプロダクトチームが使う<b>デザインシステム</b>を主導。",
      "高トラフィックなプロダクトの読み込み時間を <b>40%</b> 短縮。",
      "エンジニアを指導し、チームの<b>コードレビュー基準</b>を策定。",
    ],
  },
  commandGroups: {
    navigate: "移動",
    actions: "操作",
    projects: "プロジェクト",
    social: "外部リンク",
  },
  commandPalette: {
    dialogLabel: "コマンドパレット",
    inputLabel: "コマンドを検索",
    placeholder: "コマンドを入力、または検索…",
    empty: "一致するコマンドはありません。",
    resultCount: (n) => `${n} 件のコマンドがあります`,
    copied: "メールアドレスをコピーしました",
    copyFailed: "コピーできませんでした。メールアプリを開きます",
    triggerText: "検索",
    footer: { navigate: "移動", select: "選択", close: "閉じる" },
  },
  commandLabels: {
    home: "トップへ戻る",
    goTo: (title) => `「${title}」へ移動`,
    hireMe: "採用のご相談",
    prefs: "アクセシビリティ設定",
    install: "アプリとしてインストール",
    copyEmail: "メールアドレスをコピー",
    emailMe: "メールを送る",
    downloadResume: "履歴書をダウンロード",
    printResume: "印刷 / PDF として保存",
    openProject: (title) => title,
    openSocial: (label) => `${label} を開く`,
    retro: "コインを入れてください:レトロモード",
    switchLanguage: (name) => `言語を切り替え:${name}`,
    theme: (name) => `テーマ:${name}`,
    shortcuts: "キーボードショートカット",
  },
  commandHints: {
    copied: "コピーしました ✓",
    external: "↗",
    download: "pdf",
    prefs: "文字・コントラスト・動き",
    install: "オフラインでも動作",
    printResume: "常に最新",
    retro: "↑↑↓↓←→←→BA",
    themeAuto: "時間帯に合わせる",
    shortcuts: "?",
  },
  commandKeywords: {
    home: "トップ 先頭 ホーム top hero start home",
    hireMe: "採用 求職 仕事 正社員 フリーランス コンサルティング hire available work job",
    prefs:
      "a11y アクセシビリティ 設定 文字サイズ フォント ディスレクシア コントラスト 動き アニメーション カーソル 下線 リンク 色覚 accessibility settings",
    install: "インストール アプリ pwa オフライン ホーム画面 install app offline",
    copyEmail: "メール 連絡 コピー クリップボード mail contact clipboard",
    emailMe: "メール 連絡 メッセージ mail contact message mailto",
    downloadResume: "履歴書 職務経歴書 cv pdf ダウンロード resume download",
    printResume: "印刷 pdf 保存 履歴書 紙 print save resume",
    language: "言語 翻訳 日本語 英語 language translate english spanish french japanese español français",
    retro: "konami cheat secret easter egg retro arcade 8bit crt insert coin",
    theme: "テーマ 色 カラー 外観 ダーク インディゴ サンセット アークティック 自動 theme",
    shortcuts: "キーボード ショートカット キー ヘルプ shortcuts keyboard",
  },
  easterEgg: {
    toastOn: "隠しコマンド成功:レトロモード ON。もう一度入力すると元に戻ります。",
    toastOff: "レトロモード OFF。現代に戻りました。",
    consoleTitle: "👾 おや、コンソールを見つけましたね。",
    consoleHint: "ページ上で ↑ ↑ ↓ ↓ ← → ← → B A を試してみてください(または Ctrl/⌘+K で「konami」を検索)。",
  },
  a11yPrefsTrigger: "アクセシビリティ設定",
  a11yPrefsCopy: {
    title: "アクセシビリティ設定",
    intro: "サイトを見やすく調整できます。設定はこのブラウザに保存され、次回以降の訪問にも適用されます。",
    close: "アクセシビリティ設定を閉じる",
    reset: "初期設定に戻す",
    toggles: {
      highContrast: {
        label: "ハイコントラスト",
        desc: "文字をより明るく、境界線をはっきりさせ、背景を純粋な黒にします。",
      },
      readableFont: {
        label: "読みやすいフォント",
        desc: "ロービジョンの方のために設計された Atkinson Hyperlegible を使います(英数字のみ)。",
      },
      reduceMotion: {
        label: "動きを減らす",
        desc: "デバイスが許可していても、アニメーションとスムーズスクロールを停止します。",
      },
      systemCursor: {
        label: "標準のカーソル",
        desc: "カスタムカーソルの代わりに、システムのポインターを使います。",
      },
      underlineLinks: {
        label: "リンクに下線",
        desc: "色に頼らずに、すべてのリンクを見分けられるようにします。",
      },
    },
    textSize: { legend: "文字サイズ" },
    theme: {
      legend: "テーマ",
      auto: "自動",
      autoHint: (name) => `時間帯に合わせて変わります · 現在は${name}`,
      names: { indigo: "インディゴ", sunset: "サンセット", arctic: "アークティック" },
    },
    vision: {
      legend: "色覚シミュレーション",
      hint: "補正ではありません。色覚特性のある方にこのページがどう見えるかを確認するためのプレビューです。",
      options: {
        none: "オフ",
        protanopia: "1 型色覚(赤錐体なし)",
        deuteranopia: "2 型色覚(緑錐体なし)",
        tritanopia: "3 型色覚(青錐体なし)",
        achromatopsia: "1 色覚(色の区別なし)",
      },
    },
  },
  shortcutsCopy: {
    title: "キーボードショートカット",
    intro: "このサイトはすべてキーボードで操作できます。ショートカットで素早く移動できます。",
    close: "キーボードショートカットを閉じる",
    footerLink: "キーボードショートカット",
    items: {
      palette: "コマンドパレットを開く",
      search: "コマンドパレットを開く(簡易)",
      help: "このショートカット一覧を表示",
      print: "履歴書を印刷、またはPDFとして保存",
      close: "ダイアログやメニューを閉じる",
      paletteNav: "パレットの結果を移動して実行",
      secret: "秘密があります… 矢印キーから始まります",
    },
  },
  pwaCopy: {
    install: "アプリをインストール",
    installHint: "このサイトをデバイスに追加できます。一度訪問すればオフラインでも動作します",
    updateTitle: "新しいバージョンがあります",
    updateBody: "再読み込みすると最新の変更が反映されます。",
    refresh: "再読み込み",
    dismiss: "更新のお知らせを閉じる",
  },
  printResume: {
    sections: {
      summary: "概要",
      highlights: "主な実績",
      skills: "スキル",
      experience: "職歴",
      projects: "主なプロジェクト",
      openSource: "オープンソース",
      education: "学歴",
      awards: "受賞歴",
    },
    footer: (url) => `${url} から印刷しました。オンライン版は常に最新です。`,
  },
};

export default ja;
