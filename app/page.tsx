'use client';

import Image from 'next/image';
import { ChangeEvent, FormEvent, useEffect, useRef, useState } from 'react';
import AppShell from './components/app-shell';

type AuthMode = 'login' | 'register' | 'registered' | 'notifications' | 'forgot-password' | 'reset-email-sent';
type RegistrationStep = 1 | 2 | 3;
type VerificationStage = 'phone' | 'code';
type ErrorKey =
  | 'email'
  | 'confirmEmail'
  | 'password'
  | 'birthDate'
  | 'ageConfirmation'
  | 'phone'
  | 'verificationCode'
  | 'username'
  | 'sexuality'
  | 'position'
  | 'recruitment';
type FormErrors = Partial<Record<ErrorKey, string>>;

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const currentYear = new Date().getFullYear();
const years = Array.from({ length: 100 }, (_, index) => currentYear - index);
const months = Array.from({ length: 12 }, (_, index) => index + 1);
const days = Array.from({ length: 31 }, (_, index) => index + 1);
const heights = Array.from({ length: 71 }, (_, index) => index + 140);
const weights = Array.from({ length: 111 }, (_, index) => index + 40);
const ages = Array.from({ length: 82 }, (_, index) => index + 18);
const sexualityOptions = ['ゲイ', 'バイ', 'ノンケ寄り', 'トランス'];
const positionOptions = ['タチ', 'ウケ', 'リバ', 'バニラ', 'ポジション不明'];
const recruitmentOptions = ['友だち募集', '恋人募集', 'その他募集'];

function isValidAdultBirthDate(year: string, month: string, day: string) {
  if (!year || !month || !day) return false;

  const numericYear = Number(year);
  const numericMonth = Number(month);
  const numericDay = Number(day);
  const birthDate = new Date(numericYear, numericMonth - 1, numericDay);

  if (
    birthDate.getFullYear() !== numericYear ||
    birthDate.getMonth() !== numericMonth - 1 ||
    birthDate.getDate() !== numericDay
  ) {
    return false;
  }

  const today = new Date();
  const adultCutoff = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
  return birthDate <= adultCutoff;
}

export default function Home() {
  const [mode, setMode] = useState<AuthMode>('login');
  const [registrationStep, setRegistrationStep] = useState<RegistrationStep>(1);
  const [verificationStage, setVerificationStage] = useState<VerificationStage>('phone');
  const [email, setEmail] = useState('');
  const [confirmEmail, setConfirmEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [birthYear, setBirthYear] = useState('');
  const [birthMonth, setBirthMonth] = useState('');
  const [birthDay, setBirthDay] = useState('');
  const [isAdult, setIsAdult] = useState(false);
  const [inviteCode, setInviteCode] = useState('');
  const [phone, setPhone] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [photoPreview, setPhotoPreview] = useState('');
  const [username, setUsername] = useState('');
  const [height, setHeight] = useState('170');
  const [weight, setWeight] = useState('65');
  const [age, setAge] = useState('32');
  const [sexuality, setSexuality] = useState('');
  const [position, setPosition] = useState('');
  const [recruitment, setRecruitment] = useState<string[]>([]);
  const [errors, setErrors] = useState<FormErrors>({});
  const [message, setMessage] = useState('');
  const resetHeadingRef = useRef<HTMLHeadingElement>(null);
  const forgotPasswordRef = useRef<HTMLButtonElement>(null);
  const previousModeRef = useRef<AuthMode>('login');

  useEffect(() => {
    if (mode === 'forgot-password' || mode === 'reset-email-sent') {
      resetHeadingRef.current?.focus();
    } else if (
      mode === 'login' &&
      (previousModeRef.current === 'forgot-password' || previousModeRef.current === 'reset-email-sent')
    ) {
      forgotPasswordRef.current?.focus();
    }
    previousModeRef.current = mode;
  }, [mode]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const switchMode = (nextMode: AuthMode) => {
    setMode(nextMode);
    setErrors({});
    setMessage('');
    setShowPassword(false);

    if (nextMode === 'register') {
      setRegistrationStep(1);
      setVerificationStage('phone');
      setVerificationCode('');
    }

    scrollToTop();
  };

  const goToStep = (nextStep: RegistrationStep) => {
    setRegistrationStep(nextStep);
    setErrors({});
    setMessage('');
    scrollToTop();
  };

  const handleBack = () => {
    if (registrationStep === 1) switchMode('login');
    if (registrationStep === 2) goToStep(1);
    if (registrationStep === 3) goToStep(2);
  };

  const handleLogin = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors: FormErrors = {};

    if (!emailPattern.test(email)) nextErrors.email = '正しいメールアドレスを入力してください。';
    if (password.length < 8) nextErrors.password = 'パスワードは8文字以上で入力してください。';

    setErrors(nextErrors);
    setMessage('');
    if (Object.keys(nextErrors).length === 0) switchMode('notifications');
  };

  const handleResetEmail = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!emailPattern.test(email)) {
      setErrors({ email: '正しいメールアドレスを入力してください。' });
      const emailInput = event.currentTarget.elements.namedItem('resetEmail');
      if (emailInput instanceof HTMLInputElement) emailInput.focus();
      return;
    }

    // Screen preview only: no email is sent and no account data is changed.
    switchMode('reset-email-sent');
  };

  const handleAccountStep = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors: FormErrors = {};

    if (!emailPattern.test(email)) nextErrors.email = '正しいメールアドレスを入力してください。';
    if (email !== confirmEmail) nextErrors.confirmEmail = 'メールアドレスが一致していません。';
    if (password.length < 8) nextErrors.password = 'パスワードは8文字以上で入力してください。';
    if (!birthYear || !birthMonth || !birthDay) {
      nextErrors.birthDate = '生年月日をすべて選択してください。';
    } else if (!isValidAdultBirthDate(birthYear, birthMonth, birthDay)) {
      nextErrors.birthDate = '有効な生年月日を入力してください。登録は18歳以上の方に限ります。';
    }
    if (!isAdult) nextErrors.ageConfirmation = '18歳以上であることを確認してください。';

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length === 0) goToStep(2);
  };

  const handleSendCode = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors: FormErrors = {};

    if (!/^\d{10,11}$/.test(phone)) nextErrors.phone = '電話番号を10〜11桁の数字で入力してください。';

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length === 0) {
      setVerificationStage('code');
      setVerificationCode('');
    }
  };

  const handleVerifyCode = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors: FormErrors = {};

    if (verificationCode !== '123456') nextErrors.verificationCode = '認証コードが正しくありません。';

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length === 0) goToStep(3);
  };

  const handlePhoneChange = () => {
    setVerificationStage('phone');
    setVerificationCode('');
    setErrors({});
  };

  const handlePhotoChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => setPhotoPreview(typeof reader.result === 'string' ? reader.result : '');
    reader.readAsDataURL(file);
  };

  const toggleRecruitment = (value: string) => {
    setRecruitment((current) =>
      current.includes(value) ? current.filter((item) => item !== value) : [...current, value],
    );
  };

  const handleProfileStep = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors: FormErrors = {};

    if (!username.trim()) nextErrors.username = 'ユーザー名を入力してください。';
    if (!sexuality) nextErrors.sexuality = 'セクシュアリティを選択してください。';
    if (!position) nextErrors.position = 'ポジションを選択してください。';
    if (recruitment.length === 0) nextErrors.recruitment = '募集内容を1つ以上選択してください。';

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length === 0) switchMode('registered');
  };

  const registrationTitle =
    registrationStep === 1 ? 'アカウント作成' : registrationStep === 2 ? '電話番号認証' : 'プロフィール設定';

  return (
    <main className="page-shell">
      <section
        className={`phone-shell ${mode === 'notifications' ? 'app-shell' : mode !== 'login' ? 'registration-shell' : ''}`}
        aria-label="UNLEASH"
      >
        {mode === 'login' && (
          <>
            <header className="brand-header">
              <span className="brand-orb brand-orb-one" aria-hidden="true" />
              <span className="brand-orb brand-orb-two" aria-hidden="true" />
              <Image
                className="brand-icon"
                src="/assets/icons/UNLEASHアイコン.png"
                alt=""
                width={512}
                height={512}
                priority
              />
              <Image
                className="brand-logo"
                src="/assets/logos/UNLEASH-02-W.png"
                alt="UNLEASH"
                width={3000}
                height={3000}
                priority
              />
            </header>

            <section className="auth-panel">
              <form className="auth-form" aria-label="ログイン" onSubmit={handleLogin} noValidate>
                <label className="field">
                  <span className="sr-only">メールアドレス</span>
                  <input
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    placeholder="メールアドレス"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    aria-invalid={Boolean(errors.email)}
                  />
                  {errors.email && <small className="field-error">{errors.email}</small>}
                </label>

                <label className="field">
                  <span className="sr-only">パスワード</span>
                  <div className="password-field">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      placeholder="パスワード"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      aria-invalid={Boolean(errors.password)}
                    />
                    <button type="button" onClick={() => setShowPassword((visible) => !visible)}>
                      {showPassword ? '隠す' : '表示'}
                    </button>
                  </div>
                  {errors.password && <small className="field-error">{errors.password}</small>}
                </label>

                {message && <p className="form-message" role="status">{message}</p>}

                <button className="primary-button" type="submit">ログイン</button>
              </form>

              <button
                className="demo-login-button"
                type="button"
                onClick={() => {
                  setEmail('demo@unleash.app');
                  setPassword('unleash123');
                  switchMode('notifications');
                }}
              >
                デモアカウントですぐに試す
              </button>

              <div className="switch-area">
                <span>はじめての方</span>
                <button type="button" onClick={() => switchMode('register')}>新規登録</button>
              </div>
              <button
                ref={forgotPasswordRef}
                className="forgot-password-link"
                type="button"
                onClick={() => switchMode('forgot-password')}
              >
                パスワードをお忘れの方
              </button>
            </section>
          </>
        )}

        {mode === 'forgot-password' && (
          <section className="registration-panel" aria-labelledby="reset-password-title">
            <button className="back-button" type="button" onClick={() => switchMode('login')}>← 戻る</button>
            <h1 ref={resetHeadingRef} id="reset-password-title" className="registration-title reset-password-title" tabIndex={-1}>
              パスワードの再設定
            </h1>
            <p className="registration-description">
              ご登録のメールアドレスを入力してください。パスワード再設定用のリンクをお送りします。
            </p>
            <form className="registration-form" aria-label="パスワード再設定" onSubmit={handleResetEmail} noValidate>
              <label className="registration-field">
                <span>メールアドレス</span>
                <input
                  name="resetEmail"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  placeholder="example@email.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  aria-invalid={Boolean(errors.email)}
                  aria-describedby={errors.email ? 'reset-email-error' : undefined}
                />
                {errors.email && <small id="reset-email-error" className="field-error" role="alert">{errors.email}</small>}
              </label>
              <button className="primary-button" type="submit">再設定メールを送信</button>
            </form>
          </section>
        )}

        {mode === 'reset-email-sent' && (
          <section className="registration-panel completion-panel" aria-labelledby="reset-email-sent-title">
            <div className="completion">
              <div className="completion-icon" aria-hidden="true">✓</div>
              <h1 ref={resetHeadingRef} id="reset-email-sent-title" tabIndex={-1}>メールを送信しました</h1>
              <p role="status">パスワード再設定用のメールを送信しました。メール内のリンクから変更してください。</p>
              <button className="primary-button" type="button" onClick={() => switchMode('login')}>
                ログイン画面へ戻る
              </button>
            </div>
          </section>
        )}

        {mode === 'register' && (
          <section className="registration-panel">
            <button className="back-button" type="button" onClick={handleBack}>← 戻る</button>
            <p className="step-label">STEP {registrationStep} / 3</p>
            <h1 className="registration-title">{registrationTitle}</h1>
            {registrationStep === 2 && <p className="registration-description">重複登録防止のため、電話番号での認証が必要です。</p>}

            {registrationStep === 1 && (
              <form className="registration-form" onSubmit={handleAccountStep} noValidate>
                <label className="registration-field">
                  <span>メールアドレス</span>
                  <input
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    placeholder="example@email.com"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    aria-invalid={Boolean(errors.email)}
                  />
                  {errors.email && <small className="field-error">{errors.email}</small>}
                </label>

                <label className="registration-field">
                  <span>メールアドレス（確認）</span>
                  <input
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    placeholder="もう一度入力してください"
                    value={confirmEmail}
                    onChange={(event) => setConfirmEmail(event.target.value)}
                    aria-invalid={Boolean(errors.confirmEmail)}
                  />
                  {errors.confirmEmail && <small className="field-error">{errors.confirmEmail}</small>}
                </label>

                <label className="registration-field">
                  <span>パスワード</span>
                  <div className="password-field">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      placeholder="8文字以上"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      aria-invalid={Boolean(errors.password)}
                    />
                    <button type="button" onClick={() => setShowPassword((visible) => !visible)}>
                      {showPassword ? '隠す' : '表示'}
                    </button>
                  </div>
                  {errors.password && <small className="field-error">{errors.password}</small>}
                </label>

                <fieldset className="registration-field fieldset-reset">
                  <legend>生年月日</legend>
                  <div className="birth-date-grid">
                    <label>
                      <span className="sr-only">年</span>
                      <select value={birthYear} onChange={(event) => setBirthYear(event.target.value)}>
                        <option value="">年</option>
                        {years.map((year) => <option key={year} value={year}>{year}年</option>)}
                      </select>
                    </label>
                    <label>
                      <span className="sr-only">月</span>
                      <select value={birthMonth} onChange={(event) => setBirthMonth(event.target.value)}>
                        <option value="">月</option>
                        {months.map((month) => <option key={month} value={month}>{month}月</option>)}
                      </select>
                    </label>
                    <label>
                      <span className="sr-only">日</span>
                      <select value={birthDay} onChange={(event) => setBirthDay(event.target.value)}>
                        <option value="">日</option>
                        {days.map((day) => <option key={day} value={day}>{day}日</option>)}
                      </select>
                    </label>
                  </div>
                  {errors.birthDate && <small className="field-error">{errors.birthDate}</small>}
                </fieldset>

                <div className="consent-field">
                  <label className="check-row large-check">
                    <input type="checkbox" checked={isAdult} onChange={(event) => setIsAdult(event.target.checked)} />
                    <span>私は18歳以上です</span>
                  </label>
                  {errors.ageConfirmation && <small className="field-error">{errors.ageConfirmation}</small>}
                </div>

                <label className="registration-field">
                  <span>招待コード <em>（任意）</em></span>
                  <input
                    type="text"
                    autoComplete="off"
                    placeholder="招待コードをお持ちの方は入力してください"
                    value={inviteCode}
                    onChange={(event) => setInviteCode(event.target.value)}
                  />
                </label>

                <button className="primary-button" type="submit">次へ</button>
              </form>
            )}

            {registrationStep === 2 && verificationStage === 'phone' && (
              <form className="registration-form" onSubmit={handleSendCode} noValidate>
                <div className="registration-field">
                  <span>電話番号</span>
                  <div className="phone-input-row">
                    <div className="country-code" aria-label="国番号 プラス81">+81</div>
                    <input
                      type="tel"
                      inputMode="numeric"
                      autoComplete="tel-national"
                      placeholder="09012345678"
                      value={phone}
                      onChange={(event) => setPhone(event.target.value.replace(/\D/g, '').slice(0, 11))}
                      aria-invalid={Boolean(errors.phone)}
                    />
                  </div>
                  {errors.phone && <small className="field-error">{errors.phone}</small>}
                </div>

                <button className="primary-button" type="submit">認証コードを送る</button>
              </form>
            )}

            {registrationStep === 2 && verificationStage === 'code' && (
              <form className="registration-form" onSubmit={handleVerifyCode} noValidate>
                <div className="phone-summary"><span>+81</span>{phone}</div>
                <div className="demo-code" role="note">
                  <strong>デモ用</strong>
                  <span>認証コード: 123456 を入力してください</span>
                </div>

                <label className="registration-field">
                  <span>認証コード（6桁）</span>
                  <input
                    className="code-input"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    placeholder="123456"
                    value={verificationCode}
                    onChange={(event) => setVerificationCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
                    aria-invalid={Boolean(errors.verificationCode)}
                  />
                  {errors.verificationCode && <small className="field-error">{errors.verificationCode}</small>}
                </label>

                <button className="primary-button" type="submit">認証する</button>
                <button className="text-button" type="button" onClick={handlePhoneChange}>電話番号を変更する</button>
              </form>
            )}

            {registrationStep === 3 && (
              <form className="registration-form profile-form" onSubmit={handleProfileStep} noValidate>
                <label className="photo-picker">
                  <input type="file" accept="image/*" onChange={handlePhotoChange} />
                  <span
                    className={`photo-preview ${photoPreview ? 'has-photo' : ''}`}
                    style={photoPreview ? { backgroundImage: `url(${photoPreview})` } : undefined}
                    role={photoPreview ? 'img' : undefined}
                    aria-label={photoPreview ? '選択したプロフィール写真' : undefined}
                  >
                    {!photoPreview && <span className="photo-placeholder">＋</span>}
                  </span>
                  <span className="photo-label">写真を選択</span>
                </label>

                <label className="registration-field">
                  <span>ユーザー名 <b>*</b></span>
                  <input
                    type="text"
                    autoComplete="nickname"
                    placeholder="表示名を入力"
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                    aria-invalid={Boolean(errors.username)}
                  />
                  {errors.username && <small className="field-error">{errors.username}</small>}
                </label>

                <div className="profile-select-grid">
                  <label>
                    <span>身長</span>
                    <select value={height} onChange={(event) => setHeight(event.target.value)}>
                      {heights.map((value) => <option key={value} value={value}>{value} cm</option>)}
                    </select>
                  </label>
                  <label>
                    <span>体重</span>
                    <select value={weight} onChange={(event) => setWeight(event.target.value)}>
                      {weights.map((value) => <option key={value} value={value}>{value} kg</option>)}
                    </select>
                  </label>
                  <label>
                    <span>年齢</span>
                    <select value={age} onChange={(event) => setAge(event.target.value)}>
                      {ages.map((value) => <option key={value} value={value}>{value} 歳</option>)}
                    </select>
                  </label>
                </div>

                <fieldset className="choice-fieldset">
                  <legend>セクシュアリティ <b>*</b></legend>
                  <div className="pill-group">
                    {sexualityOptions.map((option) => (
                      <button
                        key={option}
                        className={sexuality === option ? 'choice-pill selected' : 'choice-pill'}
                        type="button"
                        aria-pressed={sexuality === option}
                        onClick={() => setSexuality(option)}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                  {errors.sexuality && <small className="field-error">{errors.sexuality}</small>}
                </fieldset>

                <fieldset className="choice-fieldset">
                  <legend>ポジション <b>*</b></legend>
                  <div className="pill-group">
                    {positionOptions.map((option) => (
                      <button
                        key={option}
                        className={position === option ? 'choice-pill selected' : 'choice-pill'}
                        type="button"
                        aria-pressed={position === option}
                        onClick={() => setPosition(option)}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                  {errors.position && <small className="field-error">{errors.position}</small>}
                </fieldset>

                <fieldset className="choice-fieldset">
                  <legend>募集内容 <b>*</b> <em>（複数選択可）</em></legend>
                  <div className="pill-group">
                    {recruitmentOptions.map((option) => (
                      <button
                        key={option}
                        className={recruitment.includes(option) ? 'choice-pill selected' : 'choice-pill'}
                        type="button"
                        aria-pressed={recruitment.includes(option)}
                        onClick={() => toggleRecruitment(option)}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                  {errors.recruitment && <small className="field-error">{errors.recruitment}</small>}
                </fieldset>

                <button className="primary-button" type="submit">登録完了</button>
              </form>
            )}
          </section>
        )}

        {mode === 'registered' && (
          <section className="registration-panel completion-panel">
            <div className="completion" role="status">
              <div className="completion-icon">✓</div>
              <h1>登録内容を確認しました</h1>
              <p>3ステップの入力は完了です。現在は画面確認用のため、入力した情報は保存されていません。</p>
              <button className="primary-button" type="button" onClick={() => switchMode('login')}>
                ログイン画面へ戻る
              </button>
            </div>
          </section>
        )}

        {mode === 'notifications' && (
          <AppShell
            username={username}
            photoPreview={photoPreview}
            onLogout={() => {
              setEmail('');
              setPassword('');
              switchMode('login');
            }}
          />
        )}
      </section>
    </main>
  );
}
