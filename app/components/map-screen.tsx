'use client';

import Image from 'next/image';
import { Crosshair, EyeOff, Heart, MapPin, Megaphone, RefreshCw, X } from 'lucide-react';
import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { getProfile, profiles, shouts, type Profile } from '../lib/demo-data';

type NearbyTab = 'map' | 'shouts';
type MapPosition = { top: number; left: number };
type LocationSource = 'current' | 'custom';

type MapScreenProps = {
  initialFocusProfileId: string | null;
  isVipActive: boolean;
  sentProfileIds: string[];
  visibleOnMap: boolean;
  onOpenProfile: (profileId: string) => void;
  onRequireVip: () => void;
  onSentProfileIdsChange: (profileIds: string[]) => void;
  onVisibleOnMapChange: (visible: boolean) => void;
};

const demoLocation = { top: 50, left: 49 };
const clampMapCoordinate = (value: number) => Math.min(98, Math.max(2, value));

const nearbyTabs = [
  { id: 'map', label: '地図' },
  { id: 'shouts', label: 'シャウト' },
] as const;

const recentShouts = [...shouts].sort((a, b) => a.elapsedMinutes - b.elapsedMinutes);

const getInitialMapCenter = (profileId: string | null) => profileId ? getProfile(profileId).mapPosition : { top: 50, left: 50 };

function elapsedLabel(minutes: number) {
  return minutes < 60 ? `${minutes}分前` : `${Math.floor(minutes / 60)}時間前`;
}

export default function MapScreen({ initialFocusProfileId, isVipActive, sentProfileIds, visibleOnMap, onOpenProfile, onRequireVip, onSentProfileIdsChange, onVisibleOnMapChange }: MapScreenProps) {
  const [activeTab, setActiveTab] = useState<NearbyTab>('map');
  const [pendingProfile, setPendingProfile] = useState<Profile | null>(null);
  const [notice, setNotice] = useState('');
  const dialogRef = useRef<HTMLDialogElement>(null);
  const cancelRef = useRef<HTMLButtonElement>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [mapCenter, setMapCenter] = useState(() => getInitialMapCenter(initialFocusProfileId));
  const [publishedLocation, setPublishedLocation] = useState<{ position: MapPosition; source: LocationSource }>({ position: demoLocation, source: 'current' });
  const [locationStep, setLocationStep] = useState<'closed' | 'choose' | 'custom'>('closed');
  const locationDialogRef = useRef<HTMLDialogElement>(null);
  const locationTriggerRef = useRef<HTMLButtonElement>(null);
  const currentLocationChoiceRef = useRef<HTMLButtonElement>(null);
  const locationPickerRef = useRef<HTMLButtonElement>(null);
  const [draftLocation, setDraftLocation] = useState<MapPosition | null>(null);
  const [composing, setComposing] = useState(false);
  const [shoutDraft, setShoutDraft] = useState('');
  const composerRef = useRef<HTMLDialogElement>(null);
  const composerInputRef = useRef<HTMLTextAreaElement>(null);
  const composerTriggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const dialog = locationDialogRef.current;
    if (!dialog) return;
    if (locationStep !== 'closed' && !dialog.open) {
      dialog.showModal();
      currentLocationChoiceRef.current?.focus();
    } else if (locationStep === 'closed' && dialog.open) {
      dialog.close();
    }
    if (locationStep === 'custom') locationPickerRef.current?.focus();
    else if (locationStep === 'choose') currentLocationChoiceRef.current?.focus();
  }, [locationStep]);

  const updateLocation = (position: MapPosition, source: LocationSource) => {
    // Demo coordinates only: this does not request or publish real GPS data.
    setPublishedLocation({ position, source });
    setMapCenter(position);
    setLocationStep('closed');
  };

  const handleLocationKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    const step = event.shiftKey ? 10 : 2;
    const directions: Record<string, MapPosition> = {
      ArrowUp: { top: -step, left: 0 },
      ArrowDown: { top: step, left: 0 },
      ArrowLeft: { top: 0, left: -step },
      ArrowRight: { top: 0, left: step },
    };
    const direction = directions[event.key];
    if (!direction) return;
    event.preventDefault();
    setDraftLocation((previous) => {
      const position = previous ?? publishedLocation.position;
      return {
        top: clampMapCoordinate(position.top + direction.top),
        left: clampMapCoordinate(position.left + direction.left),
      };
    });
  };

  useEffect(() => {
    const dialog = composerRef.current;
    if (!dialog) return;
    if (composing && !dialog.open) {
      dialog.showModal();
      composerInputRef.current?.focus();
    } else if (!composing && dialog.open) {
      dialog.close();
    }
  }, [composing]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (pendingProfile && !dialog.open) {
      dialog.showModal();
      cancelRef.current?.focus();
    } else if (!pendingProfile && dialog.open) {
      dialog.close();
    }
  }, [pendingProfile]);

  const handleTabKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    let nextIndex: number;
    if (event.key === 'ArrowRight') nextIndex = (index + 1) % nearbyTabs.length;
    else if (event.key === 'ArrowLeft') nextIndex = (index + nearbyTabs.length - 1) % nearbyTabs.length;
    else if (event.key === 'Home') nextIndex = 0;
    else if (event.key === 'End') nextIndex = nearbyTabs.length - 1;
    else return;
    event.preventDefault();
    setActiveTab(nearbyTabs[nextIndex].id);
    tabRefs.current[nextIndex]?.focus();
  };

  const confirmMeet = () => {
    if (!pendingProfile || sentProfileIds.includes(pendingProfile.id)) return;
    // Demo interaction only: no notification is sent to another user.
    onSentProfileIdsChange([...sentProfileIds, pendingProfile.id]);
    setNotice(`${pendingProfile.name}さんに「会いたい」を送信しました`);
    setPendingProfile(null);
  };

  const toggleMaskMode = () => {
    if (!isVipActive) {
      onRequireVip();
      return;
    }
    onVisibleOnMapChange(!visibleOnMap);
  };

  const requestCustomLocation = () => {
    if (!isVipActive) {
      setLocationStep('closed');
      onRequireVip();
      return;
    }
    setDraftLocation(null);
    setLocationStep('custom');
  };

  return (
    <section className="nearby-screen" aria-label="近くの人">
      <div className="nearby-tabs" role="tablist" aria-label="近くの人の表示">
        {nearbyTabs.map((tab, index) => (
          <button
            key={tab.id}
            ref={(element) => { tabRefs.current[index] = element; }}
            id={`nearby-tab-${tab.id}`}
            type="button"
            role="tab"
            aria-selected={activeTab === tab.id}
            aria-controls={`nearby-panel-${tab.id}`}
            tabIndex={activeTab === tab.id ? 0 : -1}
            onClick={() => setActiveTab(tab.id)}
            onKeyDown={(event) => handleTabKeyDown(event, index)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="map-screen nearby-panel" id="nearby-panel-map" role="tabpanel" aria-labelledby="nearby-tab-map" hidden={activeTab !== 'map'}>
        <header className="map-header">
          <div>
            <p className="eyebrow">NEARBY</p>
            <h1 id="map-title">近くの人</h1>
          </div>
        </header>

        <div className="map-canvas" aria-label="渋谷周辺のデモ地図">
          <div className="map-scene" style={{ transform: `translate(${50 - mapCenter.left}%, ${50 - mapCenter.top}%)` }}>
            <div className="map-water" aria-hidden="true" />
            <span className="map-label label-shibuya">渋谷</span>
            <span className="map-label label-harajuku">原宿</span>
            <span className="map-label label-ebisu">恵比寿</span>
            {visibleOnMap && <div className="you-marker" style={{ top: `${publishedLocation.position.top}%`, left: `${publishedLocation.position.left}%` }} role="img" aria-label={publishedLocation.source === 'current' ? '現在地' : '自分で設定した位置'}><span /></div>}
            {profiles.map((profile) => (
              <button
                key={profile.id}
                className="profile-pin"
                type="button"
                style={{ top: `${profile.mapPosition.top}%`, left: `${profile.mapPosition.left}%` }}
                aria-label={`${profile.name}、${profile.distance}`}
                onClick={() => onOpenProfile(profile.id)}
              >
                <Image src={profile.image} alt="" width={96} height={96} />
                <span>{profile.distance}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="map-controls">
          <div className="map-action-bar" role="group" aria-label="地図の操作">
            <button
              type="button"
              aria-label={visibleOnMap ? '目隠し：自分を地図から隠す' : '目隠しを解除：自分を地図に表示する'}
              aria-pressed={!visibleOnMap}
              onClick={toggleMaskMode}
            >
              <EyeOff size={23} aria-hidden="true" />
              <span>{visibleOnMap ? '目隠し' : '非公開中'}</span>
            </button>
            <button type="button" aria-label="現在位置に戻る" onClick={() => setMapCenter(demoLocation)}>
              <Crosshair size={23} aria-hidden="true" />
              <span>現在位置</span>
            </button>
            <button ref={locationTriggerRef} type="button" aria-label="位置情報を更新する" aria-haspopup="dialog" onClick={() => setLocationStep('choose')}>
              <RefreshCw size={23} aria-hidden="true" />
              <span>位置更新</span>
            </button>
            <button ref={composerTriggerRef} type="button" className="map-shout-action" aria-label="シャウトする" aria-haspopup="dialog" onClick={() => setComposing(true)}>
              <Megaphone size={23} aria-hidden="true" />
              <span>シャウト</span>
            </button>
          </div>
        </div>
      </div>

      <div className="shout-panel nearby-panel" id="nearby-panel-shouts" role="tabpanel" aria-labelledby="nearby-tab-shouts" hidden={activeTab !== 'shouts'}>
        <h1 className="shout-title">シャウト</h1>
        <div className="shout-notice" role="status" aria-atomic="true">{notice}</div>
        <div className="shout-scroll" tabIndex={0} role="region" aria-label="近くのシャウト一覧">
          {recentShouts.map((shout) => {
            const profile = getProfile(shout.profileId);
            const isSent = sentProfileIds.includes(profile.id);
            return (
              <article className="shout-row" key={shout.id} aria-label={`${profile.name}のシャウト`}>
                <button className="shout-profile-button" type="button" onClick={() => onOpenProfile(profile.id)}>
                  <Image className="shout-avatar" src={profile.image} alt={`${profile.name}のプロフィール写真`} width={112} height={112} />
                  <span className="shout-copy">
                    <span className="shout-body">{shout.body}</span>
                    <span className="shout-meta">
                      <span>{profile.name} · {profile.height}cm · {profile.weight}kg · {profile.age}歳</span>
                      <span>{elapsedLabel(shout.elapsedMinutes)}</span>
                    </span>
                  </span>
                </button>
                <div className="shout-action">
                  <button
                    className={`meet-button${isSent ? ' sent' : ''}`}
                    type="button"
                    aria-label={isSent ? `${profile.name}に「会いたい」送信済み` : `${profile.name}に「会いたい」を送る`}
                    aria-disabled={isSent}
                    aria-haspopup="dialog"
                    onClick={(event) => {
                      if (isSent) return;
                      if (!isVipActive && sentProfileIds.length >= 1) {
                        onRequireVip();
                        return;
                      }
                      triggerRef.current = event.currentTarget;
                      setPendingProfile(profile);
                    }}
                  >
                    <Heart size={24} fill={isSent ? 'currentColor' : 'none'} aria-hidden="true" />
                  </button>
                  {isSent && <span className="meet-sent-label">送信済み</span>}
                </div>
              </article>
            );
          })}
        </div>
      </div>

      <dialog
        ref={locationDialogRef}
        className="meet-dialog location-dialog"
        aria-labelledby="location-dialog-title"
        onCancel={(event) => {
          event.preventDefault();
          setLocationStep('closed');
        }}
        onClose={() => locationTriggerRef.current?.focus({ preventScroll: true })}
        onClick={(event) => {
          if (event.target === event.currentTarget) setLocationStep('closed');
        }}
      >
        <div className="location-dialog-content">
          <header>
            <h2 id="location-dialog-title">{locationStep === 'custom' ? '任意の位置を選ぶ' : '位置情報の更新'}</h2>
            <button type="button" className="shout-composer-close" aria-label="位置情報の更新を閉じる" onClick={() => setLocationStep('closed')}><X size={21} aria-hidden="true" /></button>
          </header>
          {locationStep === 'choose' && (
            <>
              <p className="location-description">更新する位置を選んでください。</p>
              <div className="location-choices">
                <button ref={currentLocationChoiceRef} type="button" onClick={() => updateLocation(demoLocation, 'current')}>
                  <Crosshair size={23} aria-hidden="true" />
                  <span><strong>現在位置</strong><small>今いる場所で更新する</small></span>
                </button>
                <button className={!isVipActive ? 'vip-locked-choice' : undefined} type="button" onClick={requestCustomLocation}>
                  <MapPin size={23} aria-hidden="true" />
                  <span><strong>任意の位置</strong><small>好きな場所を選んで更新する</small></span>
                </button>
              </div>
            </>
          )}
          {locationStep === 'custom' && (
            <>
              <p id="location-picker-help" className="location-description">地図をタップして位置を選んでください。矢印キーでも調整できます。</p>
              <button
                ref={locationPickerRef}
                className="map-canvas location-picker"
                type="button"
                aria-label="任意の位置を選ぶ地図"
                aria-describedby="location-picker-help location-picker-status"
                onKeyDown={handleLocationKeyDown}
                onClick={(event) => {
                  // Keyboard activation selects the saved point; arrows can then adjust it.
                  if (event.detail === 0) {
                    setDraftLocation((previous) => previous ?? publishedLocation.position);
                    return;
                  }
                  const bounds = event.currentTarget.getBoundingClientRect();
                  if (!bounds.width || !bounds.height) return;
                  setDraftLocation({
                    top: clampMapCoordinate((event.clientY - bounds.top) / bounds.height * 100),
                    left: clampMapCoordinate((event.clientX - bounds.left) / bounds.width * 100),
                  });
                }}
              >
                <span className="map-water" aria-hidden="true" />
                <span className="map-label label-shibuya" aria-hidden="true">渋谷</span>
                <span className="map-label label-harajuku" aria-hidden="true">原宿</span>
                <span className="map-label label-ebisu" aria-hidden="true">恵比寿</span>
                {draftLocation && (
                  <span className="location-choice-marker" style={{ top: `${draftLocation.top}%`, left: `${draftLocation.left}%` }} aria-hidden="true">
                    <MapPin size={30} fill="currentColor" />
                  </span>
                )}
              </button>
              <p id="location-picker-status" className="location-picker-status" role="status">
                {draftLocation ? '選択した位置にピンを置きました。' : '更新する場所を選択してください。'}
                {draftLocation && <span className="sr-only">上から{Math.round(draftLocation.top)}%、左から{Math.round(draftLocation.left)}%の位置。</span>}
              </p>
              <div className="location-picker-actions">
                <button className="meet-cancel" type="button" onClick={() => setLocationStep('choose')}>戻る</button>
                <button className="meet-confirm" type="button" disabled={!draftLocation} onClick={() => {
                  if (draftLocation) updateLocation(draftLocation, 'custom');
                }}>この位置で更新</button>
              </div>
            </>
          )}
        </div>
      </dialog>

      <dialog
        ref={composerRef}
        className="meet-dialog shout-composer-dialog"
        aria-labelledby="shout-composer-title"
        onCancel={(event) => {
          event.preventDefault();
          setComposing(false);
        }}
        onClose={() => composerTriggerRef.current?.focus({ preventScroll: true })}
        onClick={(event) => {
          if (event.target === event.currentTarget) setComposing(false);
        }}
      >
        <div className="shout-composer-content">
          <header>
            <h2 id="shout-composer-title">シャウトする</h2>
            <button type="button" className="shout-composer-close" aria-label="シャウト入力を閉じる" onClick={() => setComposing(false)}><X size={21} aria-hidden="true" /></button>
          </header>
          <label htmlFor="shout-draft">近くの人に伝えたいこと</label>
          <textarea
            ref={composerInputRef}
            id="shout-draft"
            rows={5}
            placeholder="今からカフェに行きませんか？"
            value={shoutDraft}
            onChange={(event) => setShoutDraft(event.target.value)}
          />
          <button className="shout-submit" type="button" disabled>投稿する</button>
        </div>
      </dialog>

      <dialog
        ref={dialogRef}
        className="meet-dialog"
        aria-labelledby="meet-dialog-title"
        aria-describedby="meet-dialog-profile"
        onCancel={(event) => {
          event.preventDefault();
          setPendingProfile(null);
        }}
        onClose={() => triggerRef.current?.focus({ preventScroll: true })}
        onClick={(event) => {
          if (event.target === event.currentTarget) setPendingProfile(null);
        }}
      >
        <div className="meet-dialog-content">
          {pendingProfile && (
            <>
              <Image className="meet-dialog-avatar" src={pendingProfile.image} alt="" width={144} height={144} />
              <p id="meet-dialog-profile" className="meet-dialog-name">{pendingProfile.name}さん</p>
            </>
          )}
          <h2 id="meet-dialog-title">「会いたい」を送信しますか？</h2>
          <div className="meet-dialog-actions">
            <button ref={cancelRef} type="button" className="meet-cancel" onClick={() => setPendingProfile(null)}>いいえ</button>
            <button type="button" className="meet-confirm" onClick={confirmMeet}>はい</button>
          </div>
        </div>
      </dialog>
    </section>
  );
}
