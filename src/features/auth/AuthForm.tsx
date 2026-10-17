import { Eye, EyeOff } from 'lucide-react';
import { useState, type FormEvent } from 'react';

type Values = { name: string; email: string; password: string; confirmPassword: string };
export function AuthForm({ mode, loading, serverError, fieldErrors, onSubmit }: { mode: 'login' | 'register'; loading: boolean; serverError?: string; fieldErrors?: Record<string, string[]>; onSubmit: (values: Values) => void }) {
  const [values, setValues] = useState<Values>({ name: '', email: '', password: '', confirmPassword: '' });
  const [show, setShow] = useState(false);
  const change = (key: keyof Values, value: string) => setValues((current) => ({ ...current, [key]: value }));
  const submit = (event: FormEvent) => { event.preventDefault(); onSubmit(values); };
  const describedBy = (field: keyof Values) => fieldErrors?.[field] ? `${field}-error` : undefined;
  return <form className="auth-form" onSubmit={submit} noValidate aria-busy={loading}>
    {mode === 'register' && <label htmlFor="name">Nombre completo<input id="name" autoComplete="name" value={values.name} onChange={(e) => change('name', e.target.value)} aria-invalid={Boolean(fieldErrors?.name)} aria-describedby={describedBy('name')} required />{fieldErrors?.name && <span id="name-error" className="field-error">{fieldErrors.name[0]}</span>}</label>}
    <label htmlFor="email">Correo electrónico<input id="email" type="email" autoComplete="email" value={values.email} onChange={(e) => change('email', e.target.value)} aria-invalid={Boolean(fieldErrors?.email)} aria-describedby={describedBy('email')} required />{fieldErrors?.email && <span id="email-error" className="field-error">{fieldErrors.email[0]}</span>}</label>
    <label htmlFor="password">Contraseña<div className="password-control"><input id="password" type={show ? 'text' : 'password'} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} value={values.password} onChange={(e) => change('password', e.target.value)} aria-invalid={Boolean(fieldErrors?.password)} aria-describedby={describedBy('password')} required /><button type="button" className="icon-button" onClick={() => setShow((value) => !value)} aria-label={show ? 'Ocultar contraseña' : 'Mostrar contraseña'} aria-pressed={show}>{show ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}</button></div>{fieldErrors?.password && <span id="password-error" className="field-error">{fieldErrors.password[0]}</span>}</label>
    {mode === 'register' && <label htmlFor="confirmPassword">Confirmar contraseña<input id="confirmPassword" type={show ? 'text' : 'password'} autoComplete="new-password" value={values.confirmPassword} onChange={(e) => change('confirmPassword', e.target.value)} aria-invalid={Boolean(fieldErrors?.confirmPassword)} aria-describedby={describedBy('confirmPassword')} required />{fieldErrors?.confirmPassword && <span id="confirmPassword-error" className="field-error">{fieldErrors.confirmPassword[0]}</span>}</label>}
    {serverError && <p className="form-error" role="alert" aria-live="assertive">{serverError}</p>}
    <button className="button button-primary button-block" disabled={loading}>{loading ? 'Procesando…' : mode === 'login' ? 'Entrar' : 'Crear cuenta'}</button>
  </form>;
}
