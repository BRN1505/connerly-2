
import { CreatorCategory, JobTemplate } from './types';

export const CREATOR_CATEGORIES: CreatorCategory[] = [
    CreatorCategory.BEAUTY,
    CreatorCategory.FASHION,
    CreatorCategory.DIY,
    CreatorCategory.LEISURE,
    CreatorCategory.SPORTS,
    CreatorCategory.FOOD,
    CreatorCategory.TRAVEL,
    CreatorCategory.GAMING,
    CreatorCategory.LIFESTYLE,
    CreatorCategory.OTHER,
];

export const JOB_TEMPLATES: JobTemplate[] = [
    {
        category: '美容 (Beauty)',
        title: '新作スキンケアラインのレビュー投稿',
        description: '当社の新しいスキンケア製品3点を1ヶ月間お試しいただき、Instagramで使用感や効果についてのフィード投稿を2回、ストーリー投稿を5回お願いします。#PR #スキンケア #新作コスメ のタグ付けが必須です。'
    },
    {
        category: 'ファッション (Fashion)',
        title: '春夏コレクションの着回しコーデ紹介',
        description: '提供する春夏コレクションのアイテム5点を使った、1週間の着回しコーディネートをYouTube動画で紹介してください。動画の長さは10分以上を希望します。'
    },
    {
        category: 'レジャー (Leisure)',
        title: '最新グランピング施設の体験レポート',
        description: '新しくオープンしたグランピング施設に1泊2日でご招待します。施設での体験をブログ記事とTikTok動画で発信してください。予約方法やおすすめアクティビティも紹介をお願いします。'
    },
    {
        category: 'スポーツ (Sports)',
        title: 'フィットネスウェアの着用モデル兼レビュー',
        description: '新しいフィットネスウェアを実際に着用してトレーニングを行い、その機能性やデザインについてレビューをお願いします。Instagramリールでの投稿を希望します。'
    },
    {
        category: 'グルメ (Food)',
        title: 'お取り寄せグルメのアレンジレシピ開発',
        description: '当社のお取り寄せグルメ商品を使った、オリジナルのアレンジレシピを2品開発し、クッキング動画として投稿してください。材料や手順も分かりやすく説明をお願いします。'
    },
    {
        category: 'DIY',
        title: 'DIYキットを使ったオリジナル作品制作',
        description: '当社のDIYキットを使って、オリジナルの作品を制作する過程をYouTube動画で紹介してください。初心者でも楽しめるような工夫やポイントも盛り込んでいただけると幸いです。'
    }
];

export const ADMIN_EMAIL = 'connerly.0811@gmail.com';
export const BRAND_MONTHLY_FEE = 20000;
export const HIGH_FOLLOWER_THRESHOLD = 50000;