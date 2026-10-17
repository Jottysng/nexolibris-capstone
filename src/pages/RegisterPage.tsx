import { Link, useNavigate } from 'react-router-dom';
import { useRegisterMutation, readApiError } from '../app/api';
import { useAppDispatch } from '../app/hooks';
import { sessionReceived } from '../app/authSlice';
import { AuthForm } from '../features/auth/AuthForm';

export default function RegisterPage() {
  const [register, state] = useRegisterMutation(); const dispatch = useAppDispatch(); const navigate = useNavigate();
  const error = state.error ? readApiError(state.error) : undefined;
  return <div className="auth-page"><div className="auth-panel"><h1>Crea tu cuenta</h1><p>Registra tus datos para empezar a usar la biblioteca.</p><AuthForm mode="register" loading={state.isLoading} serverError={error?.message} fieldErrors={error?.fieldErrors} onSubmit={async (values) => { try { const result = await register(values).unwrap(); dispatch(sessionReceived(result)); navigate('/dashboard', { replace: true }); } catch { /* RTK Query presenta el error del servidor en el formulario. */ } }} /><p className="auth-switch">¿Ya tienes cuenta? <Link to="/login">Iniciar sesión</Link></p></div></div>;
}
