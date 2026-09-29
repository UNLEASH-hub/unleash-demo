'use client';

import { Bell, CalendarDays, MapPin, MessageCircle, Settings } from 'lucide-react';
import type { AppSection } from '../lib/demo-data';

type BottomNavigationProps = {
  activeSection: AppSection;
  unreadCount: number;
  onChange: (section: AppSection) => void;
};

const navigationItems = [
  { value: 'notifications', label: '通知', icon: Bell },
  { value: 'events', label: 'イベント', icon: CalendarDays },
  { value: 'map', label: '地図', icon: MapPin },
  { value: 'messages', label: 'メッセージ', icon: MessageCircle },
  { value: 'settings', label: '設定', icon: Settings },
] as const;

export default function BottomNavigation({ activeSection, unreadCount, onChange }: BottomNavigationProps) {
  return (
    <nav className="bottom-nav" aria-label="メインメニュー">
      {navigationItems.map(({ value, label, icon: Icon }) => {
        const isActive = activeSection === value;
        return (
          <button
            key={value}
            className={`${isActive ? 'active' : ''} ${value === 'messages' && unreadCount > 0 ? 'has-badge' : ''}`}
            type="button"
            aria-current={isActive ? 'page' : undefined}
            aria-label={value === 'messages' && unreadCount > 0 ? `${label}、未読${unreadCount}件` : label}
            onClick={() => onChange(value)}
          >
            <Icon size={24} />
            <span>{label}</span>
          </button>
        );
      })}
    </nav>
  );
}
