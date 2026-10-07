'use client';

import { useCallback, useState } from 'react';
import { Sparkles, X } from 'lucide-react';
import type { AppSection } from '../lib/demo-data';
import BottomNavigation from './bottom-navigation';
import EventsScreen from './events-screen';
import MapScreen from './map-screen';
import MessagesScreen from './messages-screen';
import NotificationScreen from './notification-screen';
import ProfileScreen from './profile-screen';
import SettingsScreen from './settings-screen';

type AppShellProps = {
  username: string;
  photoPreview: string;
  onLogout: () => void;
};

export default function AppShell({ username, photoPreview, onLogout }: AppShellProps) {
  const [activeSection, setActiveSection] = useState<AppSection>('notifications');
  const [unreadCount, setUnreadCount] = useState(2);
  const [requestedProfileId, setRequestedProfileId] = useState<string | null>(null);
  const [visibleOnMap, setVisibleOnMap] = useState(true);
  const [eventCreationActive, setEventCreationActive] = useState(false);
  const [profileEditingActive, setProfileEditingActive] = useState(false);
  const [isVipActive, setIsVipActive] = useState(false);
  const [vipPromptOpen, setVipPromptOpen] = useState(false);
  const [mapVipResetKey, setMapVipResetKey] = useState(0);
  const [mapFocusProfileId, setMapFocusProfileId] = useState<string | null>(null);
  const [sentMeetProfileIds, setSentMeetProfileIds] = useState<string[]>([]);
  const [viewingProfileId, setViewingProfileId] = useState<string | null>(null);
  const [favoriteProfileIds, setFavoriteProfileIds] = useState<string[]>(['kenji', 'taka']);
  const handleUnreadChange = useCallback((count: number) => setUnreadCount(count), []);

  const changeSection = (section: AppSection) => {
    if (section !== 'messages') setRequestedProfileId(null);
    setActiveSection(section);
  };

  const requireVip = () => setVipPromptOpen(true);

  const toggleVip = () => {
    setIsVipActive((current) => {
      const next = !current;
      if (!next) {
        setMapFocusProfileId(null);
        setMapVipResetKey((key) => key + 1);
      }
      return next;
    });
  };

  const goToVipSettings = () => {
    setVipPromptOpen(false);
    changeSection('settings');
  };

  const openProfile = (profileId: string) => setViewingProfileId(profileId);

  const openProfileMessage = (profileId: string) => {
    setViewingProfileId(null);
    setRequestedProfileId(profileId);
    setActiveSection('messages');
  };

  const showProfileLocation = (profileId: string) => {
    setViewingProfileId(null);
    setMapFocusProfileId(profileId);
    setMapVipResetKey((key) => key + 1);
    setActiveSection('map');
  };

  const toggleFavoriteProfile = (profileId: string) => {
    setFavoriteProfileIds((current) => current.includes(profileId) ? current.filter((id) => id !== profileId) : [...current, profileId]);
  };

  return (
    <div className="authenticated-app">
      <div className="app-view">
        <div className="app-panel" hidden={activeSection !== 'notifications'}>
          <NotificationScreen isVipActive={isVipActive} onOpenProfile={openProfile} />
        </div>
        <div className="app-panel" hidden={activeSection !== 'events'}>
          <EventsScreen isVipActive={isVipActive} onRequireVip={requireVip} onCreationModeChange={setEventCreationActive} />
        </div>
        <div className="app-panel" hidden={activeSection !== 'map'}>
          <MapScreen
            key={`${mapVipResetKey}-${mapFocusProfileId ?? 'map'}`}
            initialFocusProfileId={mapFocusProfileId}
            isVipActive={isVipActive}
            sentProfileIds={sentMeetProfileIds}
            visibleOnMap={visibleOnMap}
            onOpenProfile={openProfile}
            onRequireVip={requireVip}
            onSentProfileIdsChange={setSentMeetProfileIds}
            onVisibleOnMapChange={setVisibleOnMap}
          />
        </div>
        <div className="app-panel" hidden={activeSection !== 'messages'}>
          <MessagesScreen
            requestedProfileId={requestedProfileId}
            onOpenProfile={openProfile}
            onUnreadChange={handleUnreadChange}
            onConsumeProfileRequest={() => setRequestedProfileId(null)}
          />
        </div>
        <div className="app-panel" hidden={activeSection !== 'settings'}>
          <SettingsScreen
            initialName={username}
            photoPreview={photoPreview}
            isVipActive={isVipActive}
            onToggleVip={toggleVip}
            onLogout={onLogout}
            onEditingChange={setProfileEditingActive}
          />
        </div>
        {viewingProfileId && (
          <div className="app-panel profile-overlay-panel">
            <ProfileScreen
              profileId={viewingProfileId}
              isVipActive={isVipActive}
              isFavorite={favoriteProfileIds.includes(viewingProfileId)}
              onBack={() => setViewingProfileId(null)}
              onMessage={openProfileMessage}
              onToggleFavorite={toggleFavoriteProfile}
              onShowLocation={showProfileLocation}
              onBlock={() => undefined}
              onReport={() => undefined}
            />
          </div>
        )}
      </div>
      {vipPromptOpen && (
        <div className="vip-modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setVipPromptOpen(false)}>
          <section className="vip-modal" role="dialog" aria-modal="true" aria-labelledby="vip-modal-title">
            <button className="vip-modal-close" type="button" aria-label="VIPパス案内を閉じる" onClick={() => setVipPromptOpen(false)}><X size={20} /></button>
            <span className="vip-modal-icon"><Sparkles size={25} aria-hidden="true" /></span>
            <p className="eyebrow">VIP PASS</p>
            <h2 id="vip-modal-title">VIPパスで解放できます</h2>
            <p>目隠し中も周囲のユーザーを閲覧できるほか、任意位置、イベント作成、通知のぼかし解除、「会いたい」無制限が使えるようになります。</p>
            <button className="sheet-action" type="button" onClick={goToVipSettings}>VIPパスを確認</button>
          </section>
        </div>
      )}
      {!viewingProfileId && !(activeSection === 'events' && eventCreationActive) && !(activeSection === 'settings' && profileEditingActive) && (
        <BottomNavigation activeSection={activeSection} unreadCount={unreadCount} onChange={changeSection} />
      )}
    </div>
  );
}
