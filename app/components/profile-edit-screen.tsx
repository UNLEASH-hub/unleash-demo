'use client';

import Image from 'next/image';
import { Camera, ChevronLeft, X } from 'lucide-react';
import { useEffect, useRef, useState, type ChangeEvent, type FormEvent } from 'react';

export type EditableProfile = {
  name: string;
  photos: (string | null)[];
  height: number;
  weight: number;
  age: number;
  bio: string;
  sexuality: string;
  position: string;
  purposes: string[];
  tags: string[];
};

type ProfileEditScreenProps = {
  profile: EditableProfile;
  onSave: (profile: EditableProfile) => void;
  onCancel: () => void;
};

const sexualityOptions = ['ゲイ', 'バイ', 'ノンケ寄り', 'トランス'];
const positionOptions = ['タチ', 'ウケ', 'リバ', 'バニラ', 'ポジション不明'];
const purposeOptions = ['友だち募集', '恋人募集', 'その他募集'];
const tagOptions = ['ジム', 'カフェ', 'お酒', '旅行', '犬派', '音楽', 'ゲーム', 'アニメ'];

function NumberPicker({ label, unit, value, min, max, onChange }: {
  label: string; unit: string; value: number; min: number; max: number; onChange: (value: number) => void;
}) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const rowHeight = 44;

  useEffect(() => {
    const element = scrollRef.current;
    if (element && Math.round(element.scrollTop / rowHeight) + min !== value) {
      element.scrollTop = (value - min) * rowHeight;
    }
  }, [value, min]);

  return (
    <div className="profile-number-picker">
      <span>{label}</span>
      <div className="profile-number-window">
        <div ref={scrollRef} className="profile-number-scroll" role="listbox" aria-label={label}
          onScroll={(event) => {
            const next = Math.min(max, Math.max(min, Math.round(event.currentTarget.scrollTop / rowHeight) + min));
            if (next !== value) onChange(next);
          }}
          onKeyDown={(event) => {
            const steps: Record<string, number> = { ArrowUp: -1, ArrowDown: 1, PageUp: -5, PageDown: 5 };
            let next = value;
            if (event.key === 'Home') next = min;
            else if (event.key === 'End') next = max;
            else if (event.key in steps) next = Math.min(max, Math.max(min, value + steps[event.key]));
            else return;
            event.preventDefault();
            onChange(next);
            if (scrollRef.current) {
              scrollRef.current.scrollTop = (next - min) * rowHeight;
              scrollRef.current.querySelectorAll('button')[next - min]?.focus({ preventScroll: true });
            }
          }}>
          {Array.from({ length: max - min + 1 }, (_, index) => min + index).map((number) => (
            <button key={number} type="button" role="option" aria-selected={number === value} tabIndex={number === value ? 0 : -1}
              onClick={() => onChange(number)}>{number}<small>{unit}</small></button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ProfileEditScreen({ profile, onSave, onCancel }: ProfileEditScreenProps) {
  const [draft, setDraft] = useState<EditableProfile>(() => ({ ...profile, photos: [...profile.photos], purposes: [...profile.purposes], tags: profile.tags.filter((tag) => tagOptions.includes(tag)) }));
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState<number[]>([]);
  const readersRef = useRef(new Map<number, FileReader>());
  const headingRef = useRef<HTMLHeadingElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    headingRef.current?.focus();
    const readers = readersRef.current;
    return () => { readers.forEach((reader) => reader.abort()); readers.clear(); };
  }, []);

  const changePhoto = (event: ChangeEvent<HTMLInputElement>, index: number) => {
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) { setError('画像ファイルを選択してください。'); return; }
    if (file.size > 10 * 1024 * 1024) { setError('写真は1枚10MB以内で選択してください。'); return; }
    readersRef.current.get(index)?.abort();
    const reader = new FileReader();
    readersRef.current.set(index, reader);
    setError('');
    setUploading((current) => [...current.filter((item) => item !== index), index]);
    const finish = () => {
      if (readersRef.current.get(index) !== reader) return;
      readersRef.current.delete(index);
      setUploading((current) => current.filter((item) => item !== index));
    };
    reader.onload = () => {
      if (readersRef.current.get(index) !== reader || typeof reader.result !== 'string') return;
      const src = reader.result;
      setDraft((current) => ({ ...current, photos: current.photos.map((photo, slot) => slot === index ? src : photo) }));
      finish();
    };
    reader.onerror = () => { setError('写真を読み込めませんでした。別の写真を選択してください。'); finish(); };
    reader.onabort = finish;
    reader.readAsDataURL(file);
  };

  const toggleChoice = (field: 'purposes' | 'tags', value: string) => {
    setDraft((current) => ({ ...current, [field]: current[field].includes(value) ? current[field].filter((item) => item !== value) : [...current[field], value] }));
  };

  const save = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (uploading.length) return;
    if (!draft.name.trim()) { setError('アカウント名を入力してください。'); nameRef.current?.focus(); return; }
    onSave({ ...draft, name: draft.name.trim(), tags: draft.tags.filter((tag) => tagOptions.includes(tag)) });
  };

  const choices = (field: 'sexuality' | 'position' | 'purposes' | 'tags', title: string, options: string[]) => (
    <fieldset className="profile-edit-section">
      <legend>{title}</legend>
      <div className="profile-edit-choices">
        {options.map((option) => {
          const multiple = field === 'purposes' || field === 'tags';
          const selected = multiple ? draft[field].includes(option) : draft[field] === option;
          return (
            <label key={option} className={`profile-edit-chip${selected ? ' selected' : ''}`}>
              <input className="sr-only" type={multiple ? 'checkbox' : 'radio'} name={field} value={option} checked={selected}
                onChange={() => multiple ? toggleChoice(field, option) : setDraft((current) => ({ ...current, [field]: option }))} />
              <span>{option}</span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );

  return (
    <section className="profile-edit-screen" aria-labelledby="profile-edit-title">
      <header className="profile-edit-header">
        <button type="button" aria-label="設定へ戻る" onClick={onCancel}><ChevronLeft size={25} aria-hidden="true" /></button>
        <h1 ref={headingRef} id="profile-edit-title" tabIndex={-1}>プロフィール設定</h1>
      </header>
      <form className="profile-edit-form" onSubmit={save} noValidate>
        <div className="profile-edit-scroll">
          <section className="profile-edit-section" aria-labelledby="profile-photos-title">
            <h2 id="profile-photos-title">写真設定</h2>
            <div className="profile-edit-photos">
              {draft.photos.map((photo, index) => (
                <div className={`profile-edit-photo-slot${index === 0 ? ' main' : ''}`} key={index}>
                  <label className="profile-edit-photo-picker">
                    <input className="sr-only" type="file" accept="image/*" aria-label={index === 0 ? 'メイン写真を変更' : `サブ写真${index}を変更`} onChange={(event) => changePhoto(event, index)} />
                    {photo ? <Image src={photo} alt={index === 0 ? 'メイン写真' : `サブ写真${index}`} width={240} height={240} unoptimized /> : <Camera size={24} aria-hidden="true" />}
                  </label>
                  {photo && <button className="profile-edit-photo-remove" type="button" aria-label={index === 0 ? 'メイン写真を削除' : `サブ写真${index}を削除`} onClick={() => {
                    readersRef.current.get(index)?.abort();
                    setDraft((current) => ({ ...current, photos: current.photos.map((src, slot) => slot === index ? null : src) }));
                  }}><X size={14} aria-hidden="true" /></button>}
                </div>
              ))}
            </div>
            <p className="profile-edit-hint">タップして写真を変更（1枚10MB以内）</p>
            {uploading.length > 0 && <p className="profile-edit-hint" role="status">写真を読み込んでいます…</p>}
          </section>
          <section className="profile-edit-section">
            <h2><label htmlFor="profile-edit-name">アカウント名</label></h2>
            <input ref={nameRef} id="profile-edit-name" className="profile-edit-input" value={draft.name} required maxLength={50} autoComplete="nickname" onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))} />
          </section>
          <section className="profile-edit-section" aria-labelledby="profile-basics-title">
            <h2 id="profile-basics-title">基本情報</h2>
            <div className="profile-edit-numbers">
              <NumberPicker label="身長" unit="cm" value={draft.height} min={140} max={210} onChange={(height) => setDraft((current) => ({ ...current, height }))} />
              <NumberPicker label="体重" unit="kg" value={draft.weight} min={40} max={150} onChange={(weight) => setDraft((current) => ({ ...current, weight }))} />
              <NumberPicker label="年齢" unit="歳" value={draft.age} min={18} max={99} onChange={(age) => setDraft((current) => ({ ...current, age }))} />
            </div>
          </section>
          <section className="profile-edit-section">
            <h2><label htmlFor="profile-edit-bio">自己紹介文</label></h2>
            <textarea id="profile-edit-bio" className="profile-edit-input" rows={5} maxLength={200} value={draft.bio} aria-describedby="profile-edit-bio-count" onChange={(event) => setDraft((current) => ({ ...current, bio: event.target.value }))} />
            <p id="profile-edit-bio-count" className="profile-edit-counter">{draft.bio.length} / 200</p>
          </section>
          {choices('sexuality', 'セクシュアリティ', sexualityOptions)}
          {choices('position', 'ポジション', positionOptions)}
          {choices('purposes', '目的（複数選択可）', purposeOptions)}
          {choices('tags', 'タグ（複数選択可）', tagOptions)}
        </div>
        <footer className="profile-edit-footer">
          {error && <p className="profile-edit-error" role="alert">{error}</p>}
          <button className="profile-edit-save" type="submit" disabled={uploading.length > 0}>保存する</button>
        </footer>
      </form>
    </section>
  );
}
