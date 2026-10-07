'use client';

import Image from 'next/image';
import { Bell, CheckCircle2, ChevronRight, CircleHelp, CircleUserRound, Crown, LogOut, Pencil, ShieldCheck, Sparkles } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import ProfileEditScreen, { type EditableProfile } from './profile-edit-screen';

type SettingsScreenProps = {
  initialName: string;
  photoPreview: string;
  isVipActive: boolean;
  onToggleVip: () => void;
  onLogout: () => void;
  onEditingChange: (editing: boolean) => void;
};

export default function SettingsScreen({ initialName, photoPreview, isVipActive, onToggleVip, onLogout, onEditingChange }: SettingsScreenProps) {
  const [profile, setProfile] = useState<EditableProfile>(() => ({
    name: initialName || 'You',
    photos: [photoPreview || '/assets/profiles/kenji.png', null, null, null],
    age: 32, height: 170, weight: 65,
    bio: 'UNLEASHユーザー', sexuality: 'ゲイ', position: 'リバ', purposes: [], tags: [],
  }));
  const [editing, setEditing] = useState(false);
  const [notice, setNotice] = useState('');
  const [pushNotifications, setPushNotifications] = useState(true);
  const editButtonRef = useRef<HTMLButtonElement>(null);
  const wasEditingRef = useRef(false);

  useEffect(() => {
    if (wasEditingRef.current && !editing) editButtonRef.current?.focus({ preventScroll: true });
    wasEditingRef.current = editing;
  }, [editing]);

  const togglePushNotifications = () => setPushNotifications((current) => !current);

  const closeEditor = () => {
    setEditing(false);
    onEditingChange(false);
  };

  if (editing) {
    return <ProfileEditScreen profile={profile} onCancel={closeEditor} onSave={(nextProfile) => {
      setProfile(nextProfile);
      setNotice('プロフィールを保存しました');
      closeEditor();
    }} />;
  }

  return (
    <section className="feature-screen settings-screen" aria-labelledby="settings-title">
      <header className="feature-header compact-header">
        <p className="eyebrow">MY UNLEASH</p>
        <h1 id="settings-title">設定</h1>
      </header>
      <div className="feature-scroll settings-scroll">
        <button className={isVipActive ? 'vip-pass-banner active' : 'vip-pass-banner'} type="button" aria-pressed={isVipActive} onClick={onToggleVip}>
          <span className="vip-pass-icon">{isVipActive ? <Crown size={24} aria-hidden="true" /> : <Sparkles size={24} aria-hidden="true" />}</span>
          <span className="vip-pass-copy">
            <strong>{isVipActive ? 'VIPパス利用中' : 'VIPパスで機能を解放'}</strong>
            <small>{isVipActive ? 'タップでOFFにできます（デモ）' : '目隠し中も周囲を閲覧・任意位置・通知解除・イベント作成'}</small>
          </span>
          <span className="vip-pass-state">{isVipActive ? 'ON' : 'OFF'}</span>
        </button>

        <article className="settings-profile">
          {profile.photos[0] ? <Image src={profile.photos[0]} alt="プロフィール写真" width={160} height={160} unoptimized /> : <span className="settings-photo settings-photo-empty"><CircleUserRound size={36} aria-hidden="true" /></span>}
          <div><h2>{profile.name}</h2><p>{profile.age}歳 · {profile.height}cm · {profile.weight}kg</p>{isVipActive && <span>VIPパス利用中</span>}</div>
          <button ref={editButtonRef} type="button" aria-label="プロフィールを編集" onClick={() => { setNotice(''); setEditing(true); onEditingChange(true); }}><Pencil size={17} /></button>
        </article>
        {notice && <p className="settings-save-notice" role="status"><CheckCircle2 size={16} aria-hidden="true" />{notice}</p>}

        <section className="settings-group" aria-labelledby="privacy-settings">
          <h2 id="privacy-settings">通知とプライバシー</h2>
          <label className="settings-toggle"><span><Bell size={18} /><i><strong>プッシュ通知</strong><small>新しい反応をお知らせ</small></i></span><input type="checkbox" checked={pushNotifications} onChange={togglePushNotifications} /></label>
        </section>

        <section className="settings-group settings-links" aria-label="サポート">
          <button type="button"><span><ShieldCheck size={18} />安心・安全ガイド</span><ChevronRight size={18} /></button>
          <button type="button"><span><CircleHelp size={18} />ヘルプセンター</span><ChevronRight size={18} /></button>
        </section>

        <button className="logout-button" type="button" onClick={onLogout}><LogOut size={18} />ログアウト</button>
        <p className="app-version">UNLEASH prototype · v0.2</p>
      </div>

    </section>
  );
}
