import { Eye, EyeOff } from 'lucide-react';
import { useState, type FormEvent } from 'react';

type Values = { name: string; email: string; password: string; confirmPassword: string };
export function AuthForm({ mode, loading, serverError, fieldErrors, onSubmit }: { mode: 'login' | 'register'; loading: boolean; serverError?: string; fieldErrors?: Record<string, string[]>; onSubmit: (values: Values) => void }) {
  const [values, setValues] = useState<Values>({ name: '', email: '', password: '', confirmPassword: '' });
  const [show, setShow] = useState(false);
  const change = (key: keyof Values, value: string) => setValues((current) => ({ ...current, [key]: value }));
  const submit = (event: FormEvent) => { event.preventDefault(); onSubmit(values); };
  return <form className="auth-form" onSubmit={submit} noValidate>
    {mode === 'register' && <label>Nombre completo<input autoComplete="name" value={values.name} onChange={(e) => change('name', e.target.value)} required />{fieldErrors?.name && <span className="field-error">{fieldErrors.name[0]}</span>}</label>}
    <label>Correo electrónico<input type="email" autoComplete="email" value={values.email} onChange={(e) => change('email', e.target.value)} required />{fieldErrors?.email && <span className="field-error">{fieldErrors.email[0]}</span>}</label>
    <label>Contraseña<div className="password-control"><input type={show ? 'text' : 'password'} autoComplete={mode === 'login' ? 'current-password' : 'new-password'} value={values.password} onChange={(e) => change('password', e.target.value)} required /><button type="button" className="icon-button" onClick={() => setShow((value) => !value)} aria-label={show ? 'Ocultar contraseña' : 'Mostrar contraseña'}>{show ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}</button></div>{fieldErrors?.password && <span className="field-error">{fieldErrors.password[0]}</span>}</label>
    {mode === 'register' && <label>Confirmar contraseña<input type={show ? 'text' : 'password'} autoComplete="new-password" value={values.confirmPassword} onChange={(e) => change('confirmPassword', e.target.value)} required />{fieldErrors?.confirmPassword && <span className="field-error">{fieldErrors.confirmPassword[0]}</span>}</label>}
    {serverError && <p className="form-error" role="alert">{serverError}</p>}
    <button className="button button-primary button-block" disabled={loading}>{loading ? 'Procesando…' : mode === 'login' ? 'Entrar' : 'Crear cuenta'}</button>
  </form>;
}
