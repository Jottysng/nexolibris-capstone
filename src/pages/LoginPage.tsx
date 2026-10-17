import { GraduationCap } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useLoginMutation, readApiError } from '../app/api';
import { useAppDispatch } from '../app/hooks';
import { sessionReceived } from '../app/authSlice';
import { AuthForm } from '../features/auth/AuthForm';

export default function LoginPage() {
  const [login, state] = useLoginMutation(); const dispatch = useAppDispatch(); const navigate = useNavigate(); const location = useLocation();
  const error = state.error ? readApiError(state.error) : undefined;
  return <div className="auth-page"><div className="auth-panel"><h1>Inicia sesión</h1><p>Accede a tus préstamos, reservas y listas de lectura.</p><AuthForm mode="login" loading={state.isLoading} serverError={error?.message} fieldErrors={error?.fieldErrors} onSubmit={async ({ email, password }) => { try { const result = await login({ email, password }).unwrap(); dispatch(sessionReceived(result)); navigate((location.state as { from?: string } | null)?.from ?? '/dashboard', { replace: true }); } catch { /* RTK Query presenta el error del servidor en el formulario. */ } }} />
    <p className="auth-switch">¿Todavía no tienes cuenta? <Link to="/register">Crear una cuenta</Link></p>
    <aside className="demo-box"><GraduationCap aria-hidden="true" /><div><strong>Accesos de demostración</strong><p>Estudiante: demo@nexolibris.test<br />Lector: lector@nexolibris.test<br />Contraseña para ambos: Lectura2026!</p></div></aside></div></div>;
}
