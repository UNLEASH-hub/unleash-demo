'use client';

import { CalendarDays, Check, MapPin, Users, X } from 'lucide-react';
import { useState } from 'react';
import { events, type EventCategory, type EventItem } from '../lib/demo-data';

type EventView = 'recommended' | 'joined';
type EventFilter = 'すべて' | EventCategory;

export default function EventsScreen() {
  const [view, setView] = useState<EventView>('recommended');
  const [filter, setFilter] = useState<EventFilter>('すべて');
  const [joinedIds, setJoinedIds] = useState<string[]>(['morning-walk']);
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);

  const filteredEvents = events.filter((event) => {
    const matchesView = view === 'recommended' || joinedIds.includes(event.id);
    const matchesFilter = filter === 'すべて' || event.category === filter;
    return matchesView && matchesFilter;
  });

  const toggleJoined = (eventId: string) => {
    setJoinedIds((current) => current.includes(eventId) ? current.filter((id) => id !== eventId) : [...current, eventId]);
  };

  return (
    <section className="feature-screen" aria-labelledby="events-title">
      <header className="feature-header">
        <p className="eyebrow">DISCOVER</p>
        <h1 id="events-title">イベント</h1>
        <p>新しいきっかけを、リアルな場所から。</p>
      </header>

      <div className="segmented-control" aria-label="イベント表示">
        <button className={view === 'recommended' ? 'active' : ''} type="button" onClick={() => setView('recommended')}>おすすめ</button>
        <button className={view === 'joined' ? 'active' : ''} type="button" onClick={() => setView('joined')}>参加予定 <span>{joinedIds.length}</span></button>
      </div>

      <div className="filter-scroll" aria-label="イベントカテゴリ">
        {(['すべて', '交流', 'アウトドア', 'カルチャー'] as EventFilter[]).map((category) => (
          <button key={category} className={filter === category ? 'active' : ''} type="button" aria-pressed={filter === category} onClick={() => setFilter(category)}>
            {category}
          </button>
        ))}
      </div>

      <div className="feature-scroll event-list">
        {filteredEvents.length === 0 ? (
          <div className="empty-state">
            <CalendarDays size={30} />
            <h2>参加予定はまだありません</h2>
            <p>おすすめから気になるイベントを見つけましょう。</p>
            <button type="button" onClick={() => setView('recommended')}>おすすめを見る</button>
          </div>
        ) : filteredEvents.map((event) => {
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
            <p className="detail-description">{selectedEvent.description}</p>
            <button className={`sheet-action ${joinedIds.includes(selectedEvent.id) ? 'secondary' : ''}`} type="button" onClick={() => toggleJoined(selectedEvent.id)}>
              {joinedIds.includes(selectedEvent.id) ? '参加をキャンセル' : 'このイベントに参加する'}
            </button>
          </section>
        </div>
      )}
    </section>
  );
}
