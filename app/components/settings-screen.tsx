'use client';

import Image from 'next/image';
import { Bell, ChevronRight, CircleHelp, Crown, LogOut, Pencil, ShieldCheck, Sparkles, X } from 'lucide-react';
import { FormEvent, useState } from 'react';

type SettingsScreenProps = {
  initialName: string;
  photoPreview: string;
  isVipActive: boolean;
  onToggleVip: () => void;
  onLogout: () => void;
};

export default function SettingsScreen({ initialName, photoPreview, isVipActive, onToggleVip, onLogout }: SettingsScreenProps) {
  const [name, setName] = useState(initialName || 'You');
  const [editing, setEditing] = useState(false);
  const [draftName, setDraftName] = useState(name);
  const [age, setAge] = useState('32');
  const [height, setHeight] = useState('170');
  const [weight, setWeight] = useState('65');
  const [pushNotifications, setPushNotifications] = useState(true);

  const togglePushNotifications = () => setPushNotifications((current) => !current);

  const saveProfile = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextName = draftName.trim();
    if (!nextName) return;
    setName(nextName);
    setEditing(false);
  };

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
            <small>{isVipActive ? 'タップでOFFにできます（デモ）' : '目隠し・任意位置・通知解除・イベント作成が使えます'}</small>
          </span>
          <span className="vip-pass-state">{isVipActive ? 'ON' : 'OFF'}</span>
        </button>

        <article className="settings-profile">
          {photoPreview ? <span className="settings-photo" style={{ backgroundImage: `url(${photoPreview})` }} /> : <Image src="/assets/profiles/kenji.png" alt="プロフィール写真" width={160} height={160} />}
          <div><h2>{name}</h2><p>{age}歳 · {height}cm · {weight}kg</p>{isVipActive && <span>VIPパス利用中</span>}</div>
          <button type="button" aria-label="プロフィールを編集" onClick={() => { setDraftName(name); setEditing(true); }}><Pencil size={17} /></button>
        </article>

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

      {editing && (
        <div className="sheet-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setEditing(false)}>
          <form className="detail-sheet edit-profile-sheet" role="dialog" aria-modal="true" aria-labelledby="profile-edit-title" onSubmit={saveProfile}>
            <button className="sheet-close" type="button" aria-label="編集を閉じる" onClick={() => setEditing(false)}><X size={20} /></button>
            <p className="eyebrow">PROFILE</p>
            <h2 id="profile-edit-title">プロフィール編集</h2>
            <label><span>ユーザー名</span><input value={draftName} onChange={(event) => setDraftName(event.target.value)} required /></label>
            <div className="edit-profile-grid">
              <label><span>年齢</span><input type="number" min="18" max="99" value={age} onChange={(event) => setAge(event.target.value)} /></label>
              <label><span>身長</span><input type="number" min="140" max="210" value={height} onChange={(event) => setHeight(event.target.value)} /></label>
              <label><span>体重</span><input type="number" min="40" max="150" value={weight} onChange={(event) => setWeight(event.target.value)} /></label>
            </div>
            <button className="sheet-action" type="submit">変更を保存</button>
          </form>
        </div>
      )}
    </section>
  );
}
