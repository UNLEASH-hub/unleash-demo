'use client';

import Image from 'next/image';
import { ArrowLeft, CheckCheck, MoreHorizontal, Send } from 'lucide-react';
import { FormEvent, useEffect, useRef, useState } from 'react';
import { getProfile, initialConversations, type Conversation } from '../lib/demo-data';

type MessagesScreenProps = {
  requestedProfileId: string | null;
  onOpenProfile: (profileId: string) => void;
  onUnreadChange: (count: number) => void;
  onConsumeProfileRequest: () => void;
};

export default function MessagesScreen({ requestedProfileId, onOpenProfile, onUnreadChange, onConsumeProfileRequest }: MessagesScreenProps) {
  const [conversations, setConversations] = useState<Conversation[]>(initialConversations);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const endRef = useRef<HTMLDivElement>(null);

  const requestedConversationId = requestedProfileId
    ? conversations.find((conversation) => conversation.profileId === requestedProfileId)?.id ?? null
    : null;
  const effectiveActiveId = requestedConversationId ?? activeId;
  const unreadCount = conversations.reduce(
    (sum, conversation) => sum + (conversation.id === effectiveActiveId ? 0 : conversation.unread),
    0,
  );

  useEffect(() => onUnreadChange(unreadCount), [onUnreadChange, unreadCount]);

  useEffect(() => {
    if (effectiveActiveId) endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [effectiveActiveId, conversations]);

  const openConversation = (conversationId: string) => {
    setActiveId(conversationId);
    setConversations((current) => current.map((conversation) => conversation.id === conversationId ? { ...conversation, unread: 0 } : conversation));
  };

  const sendMessage = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const body = draft.trim();
    if (!body || !effectiveActiveId) return;
    const now = new Intl.DateTimeFormat('ja-JP', { hour: '2-digit', minute: '2-digit' }).format(new Date());
    setConversations((current) => current.map((conversation) => conversation.id === effectiveActiveId ? {
      ...conversation,
      unread: 0,
      messages: [...conversation.messages, { id: `${effectiveActiveId}-${Date.now()}`, sender: 'me', body, time: now }],
    } : conversation));
    setDraft('');
  };

  const activeConversation = conversations.find((conversation) => conversation.id === effectiveActiveId);

  const closeConversation = () => {
    if (effectiveActiveId) {
      setConversations((current) => current.map((conversation) => conversation.id === effectiveActiveId ? { ...conversation, unread: 0 } : conversation));
    }
    setActiveId(null);
    onConsumeProfileRequest();
  };

  if (activeConversation) {
    const profile = getProfile(activeConversation.profileId);
    return (
      <section className="chat-screen" aria-labelledby="chat-title">
        <header className="chat-header">
          <button type="button" aria-label="会話一覧へ戻る" onClick={closeConversation}><ArrowLeft size={22} /></button>
          <button className="chat-profile-button" type="button" onClick={() => onOpenProfile(profile.id)}>
            <Image src={profile.image} alt="" width={96} height={96} />
            <span><strong id="chat-title">{profile.name}</strong><small><i />オンライン</small></span>
          </button>
          <button type="button" aria-label="会話メニュー"><MoreHorizontal size={22} /></button>
        </header>
        <div className="chat-messages" aria-live="polite">
          <p className="chat-day">今日</p>
          {activeConversation.messages.map((message) => (
            <div key={message.id} className={`message-row ${message.sender}`}>
              <div className="message-bubble">{message.body}</div>
              <span>{message.time}{message.sender === 'me' && <CheckCheck size={13} />}</span>
            </div>
          ))}
          <div ref={endRef} />
        </div>
        <form className="message-composer" onSubmit={sendMessage}>
          <label className="sr-only" htmlFor="message-draft">メッセージ</label>
          <input id="message-draft" value={draft} onChange={(event) => setDraft(event.target.value)} placeholder="メッセージを入力" autoComplete="off" />
          <button type="submit" aria-label="メッセージを送信" disabled={!draft.trim()}><Send size={19} /></button>
        </form>
      </section>
    );
  }

  return (
    <section className="feature-screen" aria-labelledby="messages-title">
      <header className="feature-header compact-header">
        <p className="eyebrow">CONNECT</p>
        <h1 id="messages-title">メッセージ</h1>
        <p>{unreadCount > 0 ? `${unreadCount}件の新しいメッセージがあります` : '気になる相手と会話を続けましょう。'}</p>
      </header>
      <div className="feature-scroll conversation-list">
        {conversations.map((conversation) => {
          const profile = getProfile(conversation.profileId);
          const latest = conversation.messages.at(-1)!;
          return (
            <button key={conversation.id} className="conversation-row" type="button" onClick={() => openConversation(conversation.id)}>
              <span className="conversation-avatar"><Image src={profile.image} alt="" width={128} height={128} /><i /></span>
              <span className="conversation-copy"><strong>{profile.name}</strong><span>{latest.body}</span></span>
              <span className="conversation-meta">
                <time>{latest.time}</time>
                {conversation.unread > 0 && (
                  <>
                    <b className="conversation-unread-badge" aria-hidden="true">{conversation.unread}</b>
                    <span className="sr-only">未読{conversation.unread}件</span>
                  </>
                )}
              </span>
            </button>
          );
        })}
      </div>
    </section>
  );
}
