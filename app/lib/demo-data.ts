export type AppSection = 'notifications' | 'events' | 'map' | 'messages' | 'settings';

export type Profile = {
  id: string;
  name: string;
  age: number;
  height: number;
  weight: number;
  image: string;
  subPhotos: string[];
  secretImage: string;
  ageVerified: boolean;
  badges: string[];
  bio: string;
  lastLoginLabel: string;
  reviews: ProfileReview[];
  secretApproved: boolean;
  area: string;
  distance: string;
  status: string;
  mapPosition: { top: number; left: number };
};

export type ProfileReview = {
  id: string;
  author: string;
  body: string;
  date: string;
};

export type EventCategory = '飲み会' | 'カフェ' | '食事会' | '遊び' | 'アクティビティ' | 'ナイト';

export type Shout = {
  id: string;
  profileId: string;
  body: string;
  elapsedMinutes: number;
};

export type EventItem = {
  id: string;
  title: string;
  date: string;
  time: string;
  area: string;
  category: EventCategory;
  attendees: number;
  description: string;
  accent: string;
};

export type Message = {
  id: string;
  sender: 'me' | 'them';
  body: string;
  time: string;
};

export type Conversation = {
  id: string;
  profileId: string;
  unread: number;
  messages: Message[];
};

export type AppPreferences = {
  pushNotifications: boolean;
  showDistance: boolean;
  visibleOnMap: boolean;
};

export const profiles: Profile[] = [
  {
    id: 'kenji', name: 'Kenji', age: 28, height: 175, weight: 68,
    image: '/assets/profiles/kenji.png', area: '渋谷', distance: '850m',
    subPhotos: ['/assets/profiles/kenji.png', '/assets/profiles/taka.png', '/assets/profiles/shin.png'],
    secretImage: '/assets/profiles/kenji.png',
    ageVerified: true,
    badges: ['ゲイ', 'タチ', 'アウトドア', '都内在住'],
    bio: '仕事帰りに気軽に話せる人と出会えたら嬉しいです。カフェと散歩が好きです。',
    lastLoginLabel: '10分前',
    reviews: [
      { id: 'kenji-r1', author: 'Sota', body: '落ち着いていて話しやすい方でした。時間もきちんと守ってくれました。', date: '9月28日' },
      { id: 'kenji-r2', author: 'Shin', body: '初対面でも自然に会話できました。', date: '9月12日' },
    ],
    secretApproved: false,
    status: '仕事終わりに軽く飲みたいです', mapPosition: { top: 22, left: 24 },
  },
  {
    id: 'sota', name: 'Sota', age: 27, height: 172, weight: 65,
    image: '/assets/profiles/sota.png', area: '新宿', distance: '1.2km',
    subPhotos: ['/assets/profiles/sota.png', '/assets/profiles/dai.png', '/assets/profiles/kenji.png'],
    secretImage: '/assets/profiles/sota.png',
    ageVerified: true,
    badges: ['ゲイ', 'ウケ', 'カフェ好き', '映画'],
    bio: '休日は映画館か喫茶店にいます。ゆっくり仲良くなれる人が好きです。',
    lastLoginLabel: '18分前',
    reviews: [
      { id: 'sota-r1', author: 'Kenji', body: '穏やかで返信も丁寧でした。', date: '10月1日' },
    ],
    secretApproved: false,
    status: 'カフェ巡りと映画が好き', mapPosition: { top: 42, left: 67 },
  },
  {
    id: 'taka', name: 'Taka', age: 25, height: 170, weight: 60,
    image: '/assets/profiles/taka.png', area: '代々木', distance: '1.8km',
    subPhotos: ['/assets/profiles/taka.png', '/assets/profiles/sota.png', '/assets/profiles/dai.png'],
    secretImage: '/assets/profiles/taka.png',
    ageVerified: true,
    badges: ['ゲイ', 'リバ', 'スポーツ', 'お酒好き'],
    bio: '散歩と軽い飲みが好きです。まずは近場で気軽に会えたら。',
    lastLoginLabel: '1時間前',
    reviews: [
      { id: 'taka-r1', author: 'Dai', body: '明るくて話題が豊富でした。', date: '9月20日' },
      { id: 'taka-r2', author: 'Kenji', body: '短い時間でも楽しく過ごせました。', date: '8月30日' },
    ],
    secretApproved: false,
    status: '週末はよく散歩しています', mapPosition: { top: 64, left: 32 },
  },
  {
    id: 'dai', name: 'Dai', age: 34, height: 183, weight: 79,
    image: '/assets/profiles/dai.png', area: '恵比寿', distance: '2.3km',
    subPhotos: ['/assets/profiles/dai.png', '/assets/profiles/shin.png', '/assets/profiles/sota.png'],
    secretImage: '/assets/profiles/dai.png',
    ageVerified: true,
    badges: ['ゲイ', 'タチ', 'グルメ', '年上好き'],
    bio: '美味しいお店を探すのが好きです。気軽に話しかけてください。',
    lastLoginLabel: '3時間前',
    reviews: [
      { id: 'dai-r1', author: 'Taka', body: 'お店選びが上手で安心感がありました。', date: '9月14日' },
    ],
    secretApproved: false,
    status: '気軽に話せる友だち募集中', mapPosition: { top: 72, left: 74 },
  },
  {
    id: 'shin', name: 'Shin', age: 26, height: 165, weight: 55,
    image: '/assets/profiles/shin.png', area: '原宿', distance: '2.8km',
    subPhotos: ['/assets/profiles/shin.png', '/assets/profiles/kenji.png', '/assets/profiles/taka.png'],
    secretImage: '/assets/profiles/shin.png',
    ageVerified: true,
    badges: ['ゲイ', 'ウケ', '音楽', 'アート'],
    bio: '音楽と展示が好きです。趣味の話から仲良くなれたら嬉しいです。',
    lastLoginLabel: '昨日',
    reviews: [
      { id: 'shin-r1', author: 'Kenji', body: '共通の趣味が多くて会話が弾みました。', date: '10月2日' },
    ],
    secretApproved: false,
    status: '音楽とアートの話をしたいです', mapPosition: { top: 30, left: 78 },
  },
];

export const shouts: Shout[] = [
  {
    id: 'kenji-coffee', profileId: 'kenji', elapsedMinutes: 59,
    body: '近くにいる人、一緒にカフェ行かない？☕ 渋谷か恵比寿あたりで話せる人いたら連絡ください！',
  },
  {
    id: 'taka-drinks', profileId: 'taka', elapsedMinutes: 65,
    body: '今夜暇な人いませんか？代々木あたりで軽く飲みながら話せる人を探してます🍻',
  },
  {
    id: 'sota-cafe', profileId: 'sota', elapsedMinutes: 95,
    body: 'ジムの帰りに寄れるカフェ知ってる人いない？新宿あたりで、おすすめ教えてください。',
  },
  {
    id: 'dai-weekend', profileId: 'dai', elapsedMinutes: 180,
    body: '週末ヒマです。映画か美術館、一緒に行ける人いたらいいな🎨',
  },
  {
    id: 'shin-music', profileId: 'shin', elapsedMinutes: 360,
    body: '音楽好きな人と原宿でレコードを探したい。共通の趣味で仲良くなれたら嬉しいです🎧',
  },
];

export const events: EventItem[] = [
  {
    id: 'rooftop-social', title: 'ルーフトップ交流会', date: '10月4日（土）', time: '19:00',
    area: '渋谷', category: '飲み会', attendees: 28,
    description: '夜景を眺めながら、少人数のテーブルでゆっくり話せる交流会です。初参加の方も歓迎します。',
    accent: 'linear-gradient(135deg, #0868ed, #2dd6dd)',
  },
  {
    id: 'morning-walk', title: '朝の代々木公園ウォーク', date: '10月12日（日）', time: '09:30',
    area: '代々木', category: 'アクティビティ', attendees: 16,
    description: 'コーヒーを片手に、公園をのんびり一周します。歩きやすい服装で気軽にどうぞ。',
    accent: 'linear-gradient(135deg, #09a8ac, #6fdb8c)',
  },
  {
    id: 'film-night', title: '短編映画ナイト', date: '10月18日（土）', time: '18:30',
    area: '新宿', category: 'ナイト', attendees: 34,
    description: '話題の短編作品を観たあと、ドリンクを楽しみながら感想をシェアする夜です。',
    accent: 'linear-gradient(135deg, #6752dc, #318df4)',
  },
  {
    id: 'coffee-meetup', title: 'はじめましてのコーヒー会', date: '10月26日（日）', time: '14:00',
    area: '恵比寿', category: 'カフェ', attendees: 12,
    description: '8〜12名ほどの小さな会です。プロフィールカードをきっかけに自然に会話できます。',
    accent: 'linear-gradient(135deg, #eb8e55, #f6c56e)',
  },
];

export const initialConversations: Conversation[] = [
  {
    id: 'kenji-chat', profileId: 'kenji', unread: 2,
    messages: [
      { id: 'k1', sender: 'them', body: 'はじめまして！プロフィール見ました。', time: '18:42' },
      { id: 'k2', sender: 'them', body: '今度の交流会、参加しますか？', time: '18:44' },
    ],
  },
  {
    id: 'shin-chat', profileId: 'shin', unread: 0,
    messages: [
      { id: 's1', sender: 'me', body: 'おすすめの展示、教えてくれてありがとう！', time: '昨日' },
      { id: 's2', sender: 'them', body: 'どういたしまして。また感想聞かせてね。', time: '昨日' },
    ],
  },
  {
    id: 'taka-chat', profileId: 'taka', unread: 0,
    messages: [
      { id: 't1', sender: 'them', body: '今日はありがとう！また散歩しましょう。', time: '月曜' },
    ],
  },
  {
    id: 'sota-chat', profileId: 'sota', unread: 0,
    messages: [{ id: 'so1', sender: 'them', body: 'プロフィールを見てくれてありがとう！', time: '日曜' }],
  },
  {
    id: 'dai-chat', profileId: 'dai', unread: 0,
    messages: [{ id: 'd1', sender: 'them', body: '気軽に話しかけてください。', time: '土曜' }],
  },
];

export const getProfile = (id: string) => profiles.find((profile) => profile.id === id)!;
