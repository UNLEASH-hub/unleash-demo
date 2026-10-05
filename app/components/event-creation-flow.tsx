'use client';

import { CheckCircle2, ChevronLeft, ImageIcon, LockKeyhole, PartyPopper } from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { EventCategory } from '../lib/demo-data';

type ApplicationMethod = 'open' | 'approval';
type LocationType = 'venue' | 'area';

type EventDraft = {
  category: EventCategory | '';
  title: string;
  date: string;
  startTime: string;
  endTime: string;
  description: string;
  capacity: number;
  applicationMethod: ApplicationMethod;
  locationType: LocationType;
  venueName: string;
  address: string;
  areaName: string;
  notes: string;
  coverUrl: string;
};

type EventCreationFlowProps = {
  onExit: () => void;
};

const categoryOptions: Array<{ value: EventCategory; emoji: string; background: string }> = [
  { value: '飲み会', emoji: '🍺', background: 'linear-gradient(135deg, #f3a15f, #ef6b72)' },
  { value: 'カフェ', emoji: '☕', background: 'linear-gradient(135deg, #bd8b73, #76576e)' },
  { value: '食事会', emoji: '🍴', background: 'linear-gradient(135deg, #f4b660, #ec7c62)' },
  { value: '遊び', emoji: '🎮', background: 'linear-gradient(135deg, #7c6de8, #4a8ee9)' },
  { value: 'アクティビティ', emoji: '💪', background: 'linear-gradient(135deg, #16b3b1, #6cc984)' },
  { value: 'ナイト', emoji: '🌙', background: 'linear-gradient(135deg, #313b78, #8059bc)' },
];

const initialDraft: EventDraft = {
  category: '',
  title: '',
  date: '',
  startTime: '19:00',
  endTime: '22:00',
  description: '',
  capacity: 8,
  applicationMethod: 'approval',
  locationType: 'venue',
  venueName: '',
  address: '',
  areaName: '',
  notes: '',
  coverUrl: '',
};

function formatInputDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function isSafeImageUrl(value: string) {
  if (!value.trim()) return true;
  try {
    const url = new URL(value);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

export default function EventCreationFlow({ onExit }: EventCreationFlowProps) {
  const [step, setStep] = useState(1);
  const [draft, setDraft] = useState<EventDraft>(initialDraft);
  const [touched, setTouched] = useState<Set<keyof EventDraft>>(new Set());
  const [showDiscardDialog, setShowDiscardDialog] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [imageFailed, setImageFailed] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const discardDialogRef = useRef<HTMLDialogElement>(null);
  const backButtonRef = useRef<HTMLButtonElement>(null);

  const dateLimits = useMemo(() => {
    const today = new Date();
    const latest = new Date(today);
    latest.setDate(today.getDate() + 7);
    return { min: formatInputDate(today), max: formatInputDate(latest) };
  }, []);

  const titleLength = draft.title.length;
  const descriptionLength = draft.description.length;
  const titleError = !draft.title.trim() || titleLength > 30;
  const dateError = !draft.date || draft.date < dateLimits.min || draft.date > dateLimits.max;
  const timeError = !draft.startTime || !draft.endTime || draft.endTime <= draft.startTime;
  const descriptionError = draft.description.trim().length < 10 || descriptionLength > 500;
  const capacityError = draft.capacity < 2 || draft.capacity > 50;
  const stepOneValid = Boolean(draft.category) && !titleError && !dateError && !timeError && !descriptionError && !capacityError;

  const locationError = draft.locationType === 'venue' ? !draft.venueName.trim() : !draft.areaName.trim();
  const stepTwoValid = !locationError;
  const coverUrlValid = isSafeImageUrl(draft.coverUrl);

  const chosenCategory = categoryOptions.find((option) => option.value === draft.category) ?? categoryOptions[0];
  const isDirty = JSON.stringify(draft) !== JSON.stringify(initialDraft);

  useEffect(() => {
    const dialog = discardDialogRef.current;
    if (!dialog) return;
    if (showDiscardDialog && !dialog.open) dialog.showModal();
    if (!showDiscardDialog && dialog.open) dialog.close();
  }, [showDiscardDialog]);

  const updateDraft = <Key extends keyof EventDraft>(key: Key, value: EventDraft[Key]) => {
    setDraft((current) => ({ ...current, [key]: value }));
  };

  const markTouched = (field: keyof EventDraft) => {
    setTouched((current) => new Set(current).add(field));
  };

  const goToStep = (nextStep: number) => {
    setStep(nextStep);
    requestAnimationFrame(() => scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' }));
  };

  const requestExit = () => {
    if (completed || !isDirty) {
      onExit();
      return;
    }
    setShowDiscardDialog(true);
  };

  const goBack = () => {
    if (step > 1) goToStep(step - 1);
    else requestExit();
  };

  if (completed) {
    return (
      <section className="event-completion" aria-labelledby="event-completion-title">
        <div className="event-completion-icon" aria-hidden="true"><PartyPopper size={38} /></div>
        <CheckCircle2 className="event-completion-check" size={28} aria-hidden="true" />
        <h1 id="event-completion-title">イベントを公開しました</h1>
        <p>イベントの作成が完了しました。<br />内容はデモとして確認できます。</p>
        <button type="button" onClick={onExit}>イベント一覧へ戻る</button>
      </section>
    );
  }

  return (
    <section className="event-creation-screen" aria-labelledby="event-create-title">
      <header className="event-creation-header">
        <button ref={backButtonRef} type="button" aria-label={step === 1 ? 'イベント一覧へ戻る' : '前のステップへ戻る'} onClick={goBack}>
          <ChevronLeft size={24} aria-hidden="true" />
        </button>
        <div>
          <span>STEP {step} / 3</span>
          <h1 id="event-create-title">イベント作成</h1>
        </div>
        <div className="event-progress" aria-label={`作成ステップ${step}/3`}>
          <span style={{ width: `${step / 3 * 100}%` }} />
        </div>
      </header>

      <div ref={scrollRef} className="event-creation-scroll">
        {step === 1 && (
          <div className="event-form-section">
            <h2>基本情報</h2>

            <fieldset className="event-fieldset">
              <legend>カテゴリ <span aria-hidden="true">*</span></legend>
              <div className="event-category-grid">
                {categoryOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={draft.category === option.value ? 'selected' : ''}
                    aria-pressed={draft.category === option.value}
                    onClick={() => updateDraft('category', option.value)}
                  >
                    <span aria-hidden="true">{option.emoji}</span>
                    {option.value}
                  </button>
                ))}
              </div>
            </fieldset>

            <label className="event-form-field">
              <span>タイトル * <small>({titleLength}/30)</small></span>
              <input
                type="text"
                maxLength={30}
                value={draft.title}
                placeholder="例: 金曜の二丁目飲み@AiBar"
                aria-invalid={touched.has('title') && titleError}
                onBlur={() => markTouched('title')}
                onChange={(event) => updateDraft('title', event.target.value)}
              />
              {touched.has('title') && titleError && <em>タイトルを1〜30文字で入力してください。</em>}
            </label>

            <label className="event-form-field">
              <span>開催日 *</span>
              <input
                type="date"
                min={dateLimits.min}
                max={dateLimits.max}
                value={draft.date}
                aria-invalid={touched.has('date') && dateError}
                onBlur={() => markTouched('date')}
                onChange={(event) => updateDraft('date', event.target.value)}
              />
              <small>今日から7日以内で設定してください</small>
              {touched.has('date') && dateError && <em>今日から7日以内の日付を選んでください。</em>}
            </label>

            <div className="event-form-grid">
              <label className="event-form-field">
                <span>開始時刻 *</span>
                <input
                  type="time"
                  value={draft.startTime}
                  aria-invalid={touched.has('startTime') && timeError}
                  onBlur={() => markTouched('startTime')}
                  onChange={(event) => updateDraft('startTime', event.target.value)}
                />
              </label>
              <label className="event-form-field">
                <span>終了時刻 *</span>
                <input
                  type="time"
                  value={draft.endTime}
                  aria-invalid={touched.has('endTime') && timeError}
                  onBlur={() => markTouched('endTime')}
                  onChange={(event) => updateDraft('endTime', event.target.value)}
                />
              </label>
            </div>
            {(touched.has('startTime') || touched.has('endTime')) && timeError && <p className="event-form-error">終了時刻は開始時刻より後に設定してください。</p>}

            <label className="event-form-field">
              <span>説明 * <small>({descriptionLength}/500、最低10文字)</small></span>
              <textarea
                rows={6}
                maxLength={500}
                value={draft.description}
                placeholder="イベントの雰囲気、参加者に期待すること、当日の流れなどを書いてください。"
                aria-invalid={touched.has('description') && descriptionError}
                onBlur={() => markTouched('description')}
                onChange={(event) => updateDraft('description', event.target.value)}
              />
              {touched.has('description') && descriptionError && <em>説明を10〜500文字で入力してください。</em>}
            </label>

            <label className="event-capacity-field">
              <span>定員: <strong>{draft.capacity}人</strong></span>
              <input
                type="range"
                min="2"
                max="50"
                value={draft.capacity}
                aria-valuetext={`${draft.capacity}人`}
                onBlur={() => markTouched('capacity')}
                onChange={(event) => updateDraft('capacity', Number(event.target.value))}
              />
              <small><span>2人</span><span>50人</span></small>
            </label>
          </div>
        )}

        {step === 2 && (
          <div className="event-form-section">
            <fieldset className="event-radio-fieldset">
              <legend>申請方式 *</legend>
              <label>
                <input type="radio" name="application-method" checked={draft.applicationMethod === 'open'} onChange={() => updateDraft('applicationMethod', 'open')} />
                <span>自由参加（誰でも即参加）</span>
              </label>
              <label>
                <input type="radio" name="application-method" checked={draft.applicationMethod === 'approval'} onChange={() => updateDraft('applicationMethod', 'approval')} />
                <span>承認制（主催者が判断）</span><strong>推奨</strong>
              </label>
            </fieldset>

            <fieldset className="event-radio-fieldset">
              <legend>場所の種類 *</legend>
              <label>
                <input type="radio" name="location-type" checked={draft.locationType === 'venue'} onChange={() => updateDraft('locationType', 'venue')} />
                <span>店舗・施設（住所公開）</span>
              </label>
              <label>
                <input type="radio" name="location-type" checked={draft.locationType === 'area'} onChange={() => updateDraft('locationType', 'area')} />
                <span>エリアのみ（詳細は承認後）</span>
              </label>
            </fieldset>

            {draft.locationType === 'venue' ? (
              <>
                <label className="event-form-field">
                  <span>店舗名 *</span>
                  <input
                    type="text"
                    value={draft.venueName}
                    placeholder="例: AiBar 新宿"
                    aria-invalid={touched.has('venueName') && !draft.venueName.trim()}
                    onBlur={() => markTouched('venueName')}
                    onChange={(event) => updateDraft('venueName', event.target.value)}
                  />
                  {touched.has('venueName') && !draft.venueName.trim() && <em>店舗名を入力してください。</em>}
                </label>
                <label className="event-form-field">
                  <span>住所</span>
                  <input type="text" value={draft.address} placeholder="例: 東京都渋谷区○○1-2-3" onChange={(event) => updateDraft('address', event.target.value)} />
                </label>
              </>
            ) : (
              <>
                <label className="event-form-field">
                  <span>エリア名 *</span>
                  <input
                    type="text"
                    value={draft.areaName}
                    placeholder="例: 渋谷駅周辺"
                    aria-invalid={touched.has('areaName') && !draft.areaName.trim()}
                    onBlur={() => markTouched('areaName')}
                    onChange={(event) => updateDraft('areaName', event.target.value)}
                  />
                  {touched.has('areaName') && !draft.areaName.trim() && <em>エリア名を入力してください。</em>}
                </label>
                <label className="event-form-field">
                  <span>住所</span>
                  <input type="text" value={draft.address} placeholder="例: 東京都渋谷区○○1-2-3" onChange={(event) => updateDraft('address', event.target.value)} />
                  <small>参加承認後のメンバーのみに表示されます</small>
                </label>
              </>
            )}

            <label className="event-form-field">
              <span>持ち物・注意事項・備考（任意）</span>
              <textarea rows={5} value={draft.notes} placeholder="持ち物、ドレスコード、注意事項など" onChange={(event) => updateDraft('notes', event.target.value)} />
            </label>

            {draft.applicationMethod === 'approval' && (
              <p className="event-private-note"><LockKeyhole size={16} aria-hidden="true" />参加承認後のメンバーのみに場所の詳細が表示されます</p>
            )}
          </div>
        )}

        {step === 3 && (
          <div className="event-form-section event-cover-section">
            <h2>カバー画像（任意）</h2>
            <p>イベントのカバー画像を設定できます。設定しなくてもカテゴリの画像が自動で表示されます。</p>
            <label className="event-form-field">
              <span>画像URL</span>
              <input
                type="url"
                inputMode="url"
                value={draft.coverUrl}
                placeholder="https://example.com/image.jpg"
                aria-invalid={touched.has('coverUrl') && !coverUrlValid}
                onBlur={() => markTouched('coverUrl')}
                onChange={(event) => {
                  updateDraft('coverUrl', event.target.value);
                  setImageFailed(false);
                }}
              />
              {touched.has('coverUrl') && !coverUrlValid && <em>http:// または https:// で始まるURLを入力してください。</em>}
            </label>

            <div className="event-cover-preview" style={{ background: chosenCategory.background }}>
              {draft.coverUrl.trim() && coverUrlValid && !imageFailed ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={draft.coverUrl} alt="イベントカバーのプレビュー" onError={() => setImageFailed(true)} />
              ) : (
                <span role="img" aria-label={`${chosenCategory.value}のデフォルト画像`}>{chosenCategory.emoji}</span>
              )}
              {!draft.category && <ImageIcon className="event-cover-hint-icon" size={20} aria-hidden="true" />}
            </div>
            <p className="event-cover-caption">画像がない場合のデフォルト表示</p>
          </div>
        )}
      </div>

      <footer className="event-creation-footer">
        {step === 1 && <button type="button" disabled={!stepOneValid} onClick={() => goToStep(2)}>次へ →</button>}
        {step === 2 && <button type="button" disabled={!stepTwoValid} onClick={() => goToStep(3)}>次へ →</button>}
        {step === 3 && <button type="button" disabled={!coverUrlValid} onClick={() => setCompleted(true)}>公開する 🎉</button>}
      </footer>

      <dialog
        ref={discardDialogRef}
        className="event-discard-dialog"
        aria-labelledby="event-discard-title"
        onCancel={(event) => {
          event.preventDefault();
          setShowDiscardDialog(false);
        }}
        onClose={() => backButtonRef.current?.focus({ preventScroll: true })}
        onClick={(event) => {
          if (event.target === event.currentTarget) setShowDiscardDialog(false);
        }}
      >
        <div>
          <h2 id="event-discard-title">入力内容を破棄しますか？</h2>
          <p>作成途中の内容は保存されません。</p>
          <div>
            <button type="button" autoFocus onClick={() => setShowDiscardDialog(false)}>作成を続ける</button>
            <button type="button" onClick={onExit}>破棄して戻る</button>
          </div>
        </div>
      </dialog>
    </section>
  );
}
