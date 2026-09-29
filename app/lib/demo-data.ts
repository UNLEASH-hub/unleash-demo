export type AppSection = 'notifications' | 'events' | 'map' | 'messages' | 'settings';

export type Profile = {
  id: string;
  name: string;
  age: number;
  height: number;
  weight: number;
  image: string;
  area: string;
  distance: string;
  status: string;
  mapPosition: { top: number; left: number };
};

export type EventCategory = '交流' | 'アウトドア' | 'カルチャー';

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
    status: '仕事終わりに軽く飲みたいです', mapPosition: { top: 22, left: 24 },
  },
  {
    id: 'sota', name: 'Sota', age: 27, height: 172, weight: 65,
    image: '/assets/profiles/sota.png', area: '新宿', distance: '1.2km',
    status: 'カフェ巡りと映画が好き', mapPosition: { top: 42, left: 67 },
  },
  {
    id: 'taka', name: 'Taka', age: 25, height: 170, weight: 60,
    image: '/assets/profiles/taka.png', area: '代々木', distance: '1.8km',
    status: '週末はよく散歩しています', mapPosition: { top: 64, left: 32 },
  },
  {
    id: 'dai', name: 'Dai', age: 34, height: 183, weight: 79,
    image: '/assets/profiles/dai.png', area: '恵比寿', distance: '2.3km',
    status: '気軽に話せる友だち募集中', mapPosition: { top: 72, left: 74 },
  },
  {
    id: 'shin', name: 'Shin', age: 26, height: 165, weight: 55,
    image: '/assets/profiles/shin.png', area: '原宿', distance: '2.8km',
    status: '音楽とアートの話をしたいです', mapPosition: { top: 30, left: 78 },
  },
];

export const events: EventItem[] = [
  {
    id: 'rooftop-social', title: 'ルーフトップ交流会', date: '10月4日（土）', time: '19:00',
    area: '渋谷', category: '交流', attendees: 28,
    description: '夜景を眺めながら、少人数のテーブルでゆっくり話せる交流会です。初参加の方も歓迎します。',
    accent: 'linear-gradient(135deg, #0868ed, #2dd6dd)',
  },
  {
    id: 'morning-walk', title: '朝の代々木公園ウォーク', date: '10月12日（日）', time: '09:30',
    area: '代々木', category: 'アウトドア', attendees: 16,
    description: 'コーヒーを片手に、公園をのんびり一周します。歩きやすい服装で気軽にどうぞ。',
    accent: 'linear-gradient(135deg, #09a8ac, #6fdb8c)',
  },
  {
    id: 'film-night', title: '短編映画ナイト', date: '10月18日（土）', time: '18:30',
    area: '新宿', category: 'カルチャー', attendees: 34,
    description: '話題の短編作品を観たあと、ドリンクを楽しみながら感想をシェアする夜です。',
    accent: 'linear-gradient(135deg, #6752dc, #318df4)',
  },
  {
    id: 'coffee-meetup', title: 'はじめましてのコーヒー会', date: '10月26日（日）', time: '14:00',
    area: '恵比寿', category: '交流', attendees: 12,
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
