'use client';

import Image from 'next/image';
import { Crosshair, MapPin, MessageCircle, Navigation, X } from 'lucide-react';
import { useState } from 'react';
import { profiles, type Profile } from '../lib/demo-data';

export default function MapScreen({ onMessage }: { onMessage: (profileId: string) => void }) {
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(profiles[0]);

  return (
    <section className="map-screen" aria-labelledby="map-title">
      <header className="map-header">
        <div>
          <p className="eyebrow">NEARBY</p>
          <h1 id="map-title">近くの人</h1>
        </div>
        <button type="button" aria-label="現在地を中心に表示"><Crosshair size={20} /></button>
      </header>

      <div className="map-canvas" aria-label="渋谷周辺のデモ地図">
        <div className="map-water" aria-hidden="true" />
        <span className="map-label label-shibuya">渋谷</span>
        <span className="map-label label-harajuku">原宿</span>
        <span className="map-label label-ebisu">恵比寿</span>
        <div className="you-marker" style={{ top: '50%', left: '49%' }} aria-label="現在地"><span /></div>
        {profiles.map((profile) => (
          <button
            key={profile.id}
            className={`profile-pin ${selectedProfile?.id === profile.id ? 'active' : ''}`}
            type="button"
            style={{ top: `${profile.mapPosition.top}%`, left: `${profile.mapPosition.left}%` }}
            aria-label={`${profile.name}、${profile.distance}`}
            onClick={() => setSelectedProfile(profile)}
          >
            <Image src={profile.image} alt="" width={96} height={96} />
            <span>{profile.distance}</span>
          </button>
        ))}
      </div>

      {selectedProfile && (
        <article className="map-profile-card" aria-live="polite">
          <button className="map-card-close" type="button" aria-label="プロフィールカードを閉じる" onClick={() => setSelectedProfile(null)}><X size={17} /></button>
          <Image src={selectedProfile.image} alt={`${selectedProfile.name}のプロフィール写真`} width={160} height={160} />
          <div className="map-profile-copy">
            <div><h2>{selectedProfile.name}</h2><span>{selectedProfile.age}歳</span></div>
            <p>{selectedProfile.height}cm · {selectedProfile.weight}kg</p>
            <p className="status-copy">{selectedProfile.status}</p>
            <span className="nearby-label"><Navigation size={12} />{selectedProfile.area} · {selectedProfile.distance}</span>
          </div>
          <button className="round-action" type="button" aria-label={`${selectedProfile.name}にメッセージ`} onClick={() => onMessage(selectedProfile.id)}><MessageCircle size={20} /></button>
        </article>
      )}
      {!selectedProfile && <p className="map-hint"><MapPin size={15} />ピンを選ぶとプロフィールを確認できます</p>}
    </section>
  );
}
