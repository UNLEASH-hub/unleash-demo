'use client';

import { CalendarDays, Check, MapPin, Plus, Users, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { events, type EventItem } from '../lib/demo-data';
import EventCreationFlow from './event-creation-flow';

type EventView = 'recommended' | 'joined';

type EventsScreenProps = {
  isVipActive: boolean;
  onRequireVip: () => void;
  onCreationModeChange: (active: boolean) => void;
};

export default function EventsScreen({ isVipActive, onRequireVip, onCreationModeChange }: EventsScreenProps) {
  const [view, setView] = useState<EventView>('recommended');
  const [joinedIds, setJoinedIds] = useState<string[]>(['morning-walk']);
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);
  const [showPreflight, setShowPreflight] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [mapAccepted, setMapAccepted] = useState(false);
  const createButtonRef = useRef<HTMLButtonElement>(null);
  const closePreflightRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (showPreflight) closePreflightRef.current?.focus({ preventScroll: true });
  }, [showPreflight]);

  const visibleEvents = events.filter((event) => view === 'recommended' || joinedIds.includes(event.id));
  const isSelectedEventJoined = selectedEvent !== null && joinedIds.includes(selectedEvent.id);

  const toggleJoined = (eventId: string) => {
    setJoinedIds((current) => current.includes(eventId) ? current.filter((id) => id !== eventId) : [...current, eventId]);
  };

  const closePreflight = () => {
    setShowPreflight(false);
    setTermsAccepted(false);
    setMapAccepted(false);
    requestAnimationFrame(() => createButtonRef.current?.focus({ preventScroll: true }));
  };

  const startCreating = () => {
    setShowPreflight(false);
    setIsCreating(true);
    onCreationModeChange(true);
  };

  const openCreateFlow = () => {
    if (!isVipActive) {
      onRequireVip();
      return;
    }
    setShowPreflight(true);
  };

  const exitCreating = () => {
    setIsCreating(false);
    setTermsAccepted(false);
    setMapAccepted(false);
    onCreationModeChange(false);
    requestAnimationFrame(() => createButtonRef.current?.focus({ preventScroll: true }));
  };

  if (isCreating) return <EventCreationFlow onExit={exitCreating} />;

  return (
    <section className="feature-screen" aria-labelledby="events-title">
      <header className="feature-header event-feature-header">
        <div className="event-feature-copy">
          <p className="eyebrow">DISCOVER</p>
          <h1 id="events-title">イベント</h1>
          <p>新しいきっかけを、リアルな場所から。</p>
        </div>
        <button ref={createButtonRef} className="event-create-button" type="button" aria-haspopup="dialog" onClick={openCreateFlow}>
          <Plus size={17} aria-hidden="true" />新規登録
        </button>
      </header>

      <div className="segmented-control" aria-label="イベント表示">
        <button className={view === 'recommended' ? 'active' : ''} type="button" onClick={() => setView('recommended')}>おすすめ</button>
        <button className={view === 'joined' ? 'active' : ''} type="button" onClick={() => setView('joined')}>参加予定 <span>{joinedIds.length}</span></button>
      </div>

      <div className="feature-scroll event-list">
        {visibleEvents.length === 0 ? (
          <div className="empty-state">
            <CalendarDays size={30} />
            <h2>参加予定はまだありません</h2>
            <p>おすすめから気になるイベントを見つけましょう。</p>
            <button type="button" onClick={() => setView('recommended')}>おすすめを見る</button>
          </div>
        ) : visibleEvents.map((event) => {
          const isJoined = joinedIds.includes(event.id);
          return (
            <article key={event.id} className="event-card">
              <button className="event-card-main" type="button" onClick={() => setSelectedEvent(event)} aria-label={`${event.title}の詳細を見る`}>
                <span className="event-visual" style={{ background: event.accent }}>
                  <span>{event.category}</span>
                  <strong>{event.date.replace(/（.*）/, '')}</strong>
                </span>
                <span className="event-card-copy">
                  <span className="event-date">{event.date} · {event.time}</span>
                  <strong>{event.title}</strong>
                  <span className="event-meta"><MapPin size={13} />{event.area}<Users size={13} />{event.attendees + (isJoined ? 1 : 0)}人</span>
                </span>
              </button>
              <button className={isJoined ? 'join-button joined' : 'join-button'} type="button" aria-pressed={isJoined} onClick={() => toggleJoined(event.id)}>
                {isJoined ? <><Check size={16} />参加予定</> : '参加する'}
              </button>
            </article>
          );
        })}
      </div>

      {selectedEvent && (
        <div className="sheet-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setSelectedEvent(null)}>
          <section className="detail-sheet" role="dialog" aria-modal="true" aria-labelledby="event-detail-title">
            <button className="sheet-close" type="button" aria-label="詳細を閉じる" onClick={() => setSelectedEvent(null)}><X size={20} /></button>
            <div className="detail-hero" style={{ background: selectedEvent.accent }}>
              <span>{selectedEvent.category}</span>
              <CalendarDays size={32} />
            </div>
            <p className="eyebrow">{selectedEvent.date} · {selectedEvent.time}</p>
            <h2 id="event-detail-title">{selectedEvent.title}</h2>
            <p className="detail-location"><MapPin size={15} />{selectedEvent.area}エリア</p>
            {isSelectedEventJoined ? (
              <div className="detail-address">
                <strong>住所（参加者限定）</strong>
                <p>{selectedEvent.address}</p>
              </div>
            ) : <p className="detail-address-locked">住所は参加者のみに公開されます。</p>}
            <p className="detail-description">{selectedEvent.description}</p>
            <button className={`sheet-action ${isSelectedEventJoined ? 'secondary' : ''}`} type="button" onClick={() => toggleJoined(selectedEvent.id)}>
              {isSelectedEventJoined ? '参加をキャンセル' : 'このイベントに参加する'}
            </button>
          </section>
        </div>
      )}

      {showPreflight && (
        <div
          className="sheet-backdrop event-preflight-backdrop"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closePreflight();
          }}
          onKeyDown={(event) => {
            if (event.key === 'Escape') closePreflight();
          }}
        >
          <section className="event-preflight-sheet" role="dialog" aria-modal="true" aria-labelledby="event-preflight-title">
            <header>
              <h2 id="event-preflight-title">イベントを作成する前に</h2>
              <button ref={closePreflightRef} type="button" aria-label="事前確認を閉じる" onClick={closePreflight}><X size={23} aria-hidden="true" /></button>
            </header>
            <label className="event-consent-row">
              <input type="checkbox" checked={termsAccepted} onChange={(event) => setTermsAccepted(event.target.checked)} />
              <span><strong>イベント募集の利用規約に同意します</strong><small>健全なコミュニティのためのルールを守ります</small></span>
            </label>
            <label className="event-consent-row">
              <input type="checkbox" checked={mapAccepted} onChange={(event) => setMapAccepted(event.target.checked)} />
              <span><strong>マップへの表示について理解しました</strong><small>位置情報は多少ズレる場合がありますが、現在位置のマップ上にイベントが設置・表示されます</small></span>
            </label>
            <button className="event-preflight-submit" type="button" disabled={!termsAccepted || !mapAccepted} onClick={startCreating}>作成画面へ進む</button>
          </section>
        </div>
      )}
    </section>
  );
}
