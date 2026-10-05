'use client';

import Image from 'next/image';
import {
  ArrowLeft,
  Ban,
  BookOpen,
  Camera,
  CheckCircle2,
  Coffee,
  Dumbbell,
  Flag,
  Gamepad2,
  Heart,
  Luggage,
  MapPin,
  MessageCircle,
  MoreHorizontal,
  Music,
  PawPrint,
  ShieldCheck,
  Tag,
  Wine,
} from 'lucide-react';
import { FormEvent, useMemo, useState } from 'react';
import { getProfile, type ProfileReview } from '../lib/demo-data';

type ProfileScreenProps = {
  profileId: string;
  isVipActive: boolean;
  isFavorite: boolean;
  onBack: () => void;
  onMessage: (profileId: string) => void;
  onToggleFavorite: (profileId: string) => void;
  onShowLocation: (profileId: string) => void;
  onBlock: (profileId: string) => void;
  onReport: (profileId: string) => void;
};

const tagIcons = [Dumbbell, Coffee, Wine, Luggage, PawPrint, Music, Gamepad2, BookOpen];

export default function ProfileScreen({
  profileId,
  isVipActive,
  isFavorite,
  onBack,
  onMessage,
  onToggleFavorite,
  onShowLocation,
  onBlock,
  onReport,
}: ProfileScreenProps) {
  const profile = getProfile(profileId);
  const [menuOpen, setMenuOpen] = useState(false);
  const [notice, setNotice] = useState('');
  const [reviewDraft, setReviewDraft] = useState('');
  const [reviews, setReviews] = useState<ProfileReview[]>(profile.reviews);
  const displayTags = useMemo(() => {
    const defaults = ['ジム', 'カフェ', 'お酒', '旅行', '犬派', '音楽', 'ゲーム', 'アニメ'];
    const merged = [...profile.badges, ...defaults].slice(0, 8);
    return merged.map((label, index) => ({ label, Icon: tagIcons[index % tagIcons.length] }));
  }, [profile.badges]);

  const submitReview = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const body = reviewDraft.trim();
    if (!body) return;
    setReviews((current) => [
      { id: `${profile.id}-review-${Date.now()}`, author: 'You', body, date: '今' },
      ...current,
    ]);
    setReviewDraft('');
    setNotice('レビューを投稿しました');
  };

  const completeMenuAction = (action: 'block' | 'report') => {
    setMenuOpen(false);
    if (action === 'block') {
      onBlock(profile.id);
      setNotice(`${profile.name}さんをブロックしました`);
      return;
    }
    onReport(profile.id);
    setNotice(`${profile.name}さんを通報しました`);
  };

  return (
    <section className="user-profile-screen" aria-labelledby="user-profile-title">
      <header className="user-profile-header">
        <button type="button" aria-label="前の画面へ戻る" onClick={onBack}><ArrowLeft size={22} /></button>
      </header>

      <div className="user-profile-scroll">
        <section className="profile-hero-card">
          <div className="profile-hero-top">
            <Image className="profile-main-photo" src={profile.image} alt={`${profile.name}のメイン写真`} width={220} height={220} priority />
            <div className="profile-quick-actions" aria-label="プロフィール操作">
              <button className="profile-round-action message" type="button" onClick={() => onMessage(profile.id)}>
                <MessageCircle size={30} />
                <span>メッセージ</span>
              </button>
              <button className={isFavorite ? 'profile-round-action favorite active' : 'profile-round-action favorite'} type="button" aria-pressed={isFavorite} onClick={() => onToggleFavorite(profile.id)}>
                <Heart size={31} fill={isFavorite ? 'currentColor' : 'none'} />
                <span>お気に入り</span>
              </button>
              <div className="profile-menu-wrap">
                <button className="profile-round-action more" type="button" aria-label="その他メニュー" aria-expanded={menuOpen} onClick={() => setMenuOpen((current) => !current)}>
                  <MoreHorizontal size={34} />
                  <span>その他</span>
                </button>
                {menuOpen && (
                  <div className="profile-menu" role="menu">
                    <button type="button" role="menuitem" onClick={() => { setMenuOpen(false); onShowLocation(profile.id); }}><MapPin size={16} />位置を確認</button>
                    <button type="button" role="menuitem" onClick={() => completeMenuAction('block')}><Ban size={16} />ブロック</button>
                    <button type="button" role="menuitem" onClick={() => completeMenuAction('report')}><Flag size={16} />通報</button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="profile-hero-copy">
            <div className="profile-name-line">
              <h1 id="user-profile-title">{profile.name}</h1>
              <span className="online-dot" aria-label={`最終ログイン: ${profile.lastLoginLabel}`} />
            </div>
            {profile.ageVerified && <span className="verified-badge"><ShieldCheck size={15} />年齢確認済み</span>}
            <p className="profile-stats">{profile.height}cm / {profile.weight}kg / {profile.age}歳</p>
            <p className="profile-bio hero-bio">{profile.bio}</p>
          </div>
        </section>

        <section className="profile-section">
          <h2><Tag size={25} />タグ</h2>
          <div className="profile-tag-grid">
            {displayTags.map(({ label, Icon }) => (
              <span key={label}><Icon size={21} />{label}</span>
            ))}
          </div>
        </section>

        <section className="profile-section">
          <div className="profile-section-heading">
            <h2><Camera size={27} />写真</h2>
            <button type="button">すべて見る</button>
          </div>
          <div className="profile-photo-row" aria-label="プロフィール写真">
            {profile.subPhotos.map((photo, index) => (
              <Image key={`${photo}-${index}`} src={photo} alt={`${profile.name}のサブ写真${index + 1}`} width={220} height={220} />
            ))}
          </div>
        </section>

        {isVipActive && (
          <section className="profile-section profile-review-card">
            <h2>レビュー</h2>
            <form className="profile-review-form" onSubmit={submitReview}>
              <label htmlFor="profile-review">レビューを書く</label>
              <textarea id="profile-review" rows={3} value={reviewDraft} onChange={(event) => setReviewDraft(event.target.value)} placeholder="会った印象や安心できた点を書いてください" />
              <button type="submit" disabled={!reviewDraft.trim()}>投稿する</button>
            </form>
            <div className="profile-review-list">
              {reviews.map((review) => (
                <article key={review.id} className="profile-review">
                  <div><strong>{review.author}</strong><span>{review.date}</span></div>
                  <p>{review.body}</p>
                </article>
              ))}
            </div>
          </section>
        )}

        {notice && <p className="profile-notice" role="status"><CheckCircle2 size={16} />{notice}</p>}
      </div>
    </section>
  );
}
