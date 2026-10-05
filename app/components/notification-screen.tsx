'use client';

import Image from 'next/image';
import {
  Heart,
  LockKeyhole,
  MessageCircle,
  Sparkles,
} from 'lucide-react';
import { useState } from 'react';
import { profiles } from '../lib/demo-data';

type NotificationTab = 'actions' | 'footprints' | 'favorites';
type FootprintDirection = 'received' | 'sent';
type ActionType = 'message' | 'favorite' | 'meet';

type ActionItem = {
  profileId: string;
  type: ActionType;
  time: string;
  locked?: boolean;
};

const actions: ActionItem[] = [
  { profileId: 'kenji', type: 'message', time: '26分前' },
  { profileId: 'sota', type: 'favorite', time: '51分前', locked: true },
  { profileId: 'taka', type: 'meet', time: '2時間前', locked: true },
  { profileId: 'shin', type: 'message', time: '5時間前' },
  { profileId: 'dai', type: 'favorite', time: '1日前', locked: true },
];

const receivedFootprints = [
  { profileId: 'kenji', time: '24分前' },
  { profileId: 'sota', time: '1時間前' },
  { profileId: 'taka', time: '3時間前' },
  { profileId: 'dai', time: '8時間前' },
  { profileId: 'shin', time: '1日前' },
];

const sentFootprints = [
  { profileId: 'taka', time: '18分前' },
  { profileId: 'kenji', time: '2時間前' },
  { profileId: 'dai', time: '昨日' },
];

const favoriteProfileIds = ['kenji', 'taka'];

const profileById = (id: string) => profiles.find((profile) => profile.id === id)!;

const actionCopy: Record<ActionType, string> = {
  message: 'がメッセージを送りました',
  favorite: 'がお気に入りしました',
  meet: 'が「会いたい」しました',
};

const ActionBadge = ({ type }: { type: ActionType }) => {
  const Icon = type === 'message' ? MessageCircle : type === 'favorite' ? Heart : Sparkles;
  return (
    <span className={`action-badge ${type}`} aria-hidden="true">
      <Icon size={13} strokeWidth={2.6} />
    </span>
  );
};

type NotificationScreenProps = {
  isVipActive: boolean;
  onOpenProfile: (profileId: string) => void;
};

export default function NotificationScreen({ isVipActive, onOpenProfile }: NotificationScreenProps) {
  const [activeTab, setActiveTab] = useState<NotificationTab>('actions');
  const [footprintDirection, setFootprintDirection] = useState<FootprintDirection>('received');

  const footprintItems = footprintDirection === 'received' ? receivedFootprints : sentFootprints;

  return (
    <section className="notifications-screen" aria-label="通知">
      <header className="notification-header">
        <h1>通知</h1>
        <div className="notification-tabs" role="tablist" aria-label="通知の種類">
          {([
            ['actions', 'アクション'],
            ['footprints', '足あと'],
            ['favorites', 'お気に入り'],
          ] as const).map(([value, label]) => (
            <button
              key={value}
              className={activeTab === value ? 'notification-tab active' : 'notification-tab'}
              type="button"
              role="tab"
              aria-selected={activeTab === value}
              onClick={() => setActiveTab(value)}
            >
              {label}
            </button>
          ))}
        </div>
      </header>

      <div className="notification-content">
        {activeTab === 'actions' && (
          <div className="notification-list" role="tabpanel" aria-label="アクション通知">
            {actions.map((item) => {
              const profile = profileById(item.profileId);
              const isLocked = Boolean(item.locked && !isVipActive);
              return (
                <button
                  key={`${item.profileId}-${item.type}`}
                  className={isLocked ? 'notification-row locked' : 'notification-row'}
                  type="button"
                  disabled={isLocked}
                  onClick={() => onOpenProfile(profile.id)}
                >
                  <div className="avatar-wrap">
                    <Image className="profile-avatar" src={profile.image} alt={isLocked ? '' : `${profile.name}のプロフィール写真`} width={160} height={160} />
                    <ActionBadge type={item.type} />
                  </div>
                  <div className="notification-copy">
                    <p className="notification-main">
                      <strong>{isLocked ? '???' : profile.name}</strong>
                      {isLocked && <LockKeyhole size={13} aria-label="VIP限定" />}
                      <span>{actionCopy[item.type]}</span>
                    </p>
                    {isLocked ? (
                      <p className="vip-copy"><Sparkles size={13} />VIPパスで確認できます</p>
                    ) : (
                      <p className="profile-meta">{profile.height}cm · {profile.weight}kg · {profile.age}歳</p>
                    )}
                  </div>
                  <time>{item.time}</time>
                </button>
              );
            })}
          </div>
        )}

        {activeTab === 'footprints' && (
          <div role="tabpanel" aria-label="足あと">
            <div className="direction-switch" aria-label="足あとの方向">
              <button
                className={footprintDirection === 'received' ? 'active' : ''}
                type="button"
                onClick={() => setFootprintDirection('received')}
              >
                相手から
              </button>
              <button
                className={footprintDirection === 'sent' ? 'active' : ''}
                type="button"
                onClick={() => setFootprintDirection('sent')}
              >
                自分から
              </button>
            </div>
            <div className="notification-list footprint-list">
              {footprintItems.map((item) => {
                const profile = profileById(item.profileId);
                return (
                  <button key={`${footprintDirection}-${item.profileId}`} className="profile-row" type="button" onClick={() => onOpenProfile(profile.id)}>
                    <Image className="profile-avatar" src={profile.image} alt={`${profile.name}のプロフィール写真`} width={160} height={160} />
                    <div>
                      <h2>{profile.name}</h2>
                      <p>{profile.height}cm · {profile.weight}kg · {profile.age}歳</p>
                    </div>
                    <time>{item.time}</time>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === 'favorites' && (
          <div className="notification-list favorite-list" role="tabpanel" aria-label="お気に入り">
            {favoriteProfileIds.map((id) => {
              const profile = profileById(id);
              return (
                <article key={id} className="favorite-row">
                  <button className="favorite-profile-button" type="button" onClick={() => onOpenProfile(profile.id)}>
                    <Image className="profile-avatar" src={profile.image} alt={`${profile.name}のプロフィール写真`} width={160} height={160} />
                    <span>
                      <strong>{profile.name}</strong>
                      <small>{profile.age}歳 · {profile.height}cm · {profile.weight}kg</small>
                    </span>
                  </button>
                  <button type="button" disabled aria-label={`${profile.name}へのメッセージ機能は準備中です`}>
                    <MessageCircle size={20} />
                  </button>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
