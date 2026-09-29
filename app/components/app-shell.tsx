'use client';

import { useCallback, useState } from 'react';
import type { AppSection } from '../lib/demo-data';
import BottomNavigation from './bottom-navigation';
import EventsScreen from './events-screen';
import MapScreen from './map-screen';
import MessagesScreen from './messages-screen';
import NotificationScreen from './notification-screen';
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
  const handleUnreadChange = useCallback((count: number) => setUnreadCount(count), []);

  const startMessage = (profileId: string) => {
    setRequestedProfileId(profileId);
    setActiveSection('messages');
  };

  const changeSection = (section: AppSection) => {
    if (section !== 'messages') setRequestedProfileId(null);
    setActiveSection(section);
  };

  return (
    <div className="authenticated-app">
      <div className="app-view">
        <div className="app-panel" hidden={activeSection !== 'notifications'}><NotificationScreen /></div>
        <div className="app-panel" hidden={activeSection !== 'events'}><EventsScreen /></div>
        <div className="app-panel" hidden={activeSection !== 'map'}><MapScreen onMessage={startMessage} /></div>
        <div className="app-panel" hidden={activeSection !== 'messages'}>
          <MessagesScreen
            requestedProfileId={requestedProfileId}
            onUnreadChange={handleUnreadChange}
            onConsumeProfileRequest={() => setRequestedProfileId(null)}
          />
        </div>
        <div className="app-panel" hidden={activeSection !== 'settings'}><SettingsScreen initialName={username} photoPreview={photoPreview} onLogout={onLogout} /></div>
      </div>
      <BottomNavigation activeSection={activeSection} unreadCount={unreadCount} onChange={changeSection} />
    </div>
  );
}
