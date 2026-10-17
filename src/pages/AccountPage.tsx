import { Mail, ShieldCheck, UserRound } from 'lucide-react';
import { useAppSelector } from '../app/hooks';

export default function AccountPage() {
  const user = useAppSelector((state) => state.auth.user);
  return <div className="container page-section narrow-page"><div className="page-heading"><div><h1>Mi cuenta</h1><p>Información asociada a tu perfil de biblioteca.</p></div></div><section className="account-card"><div><UserRound aria-hidden="true" /><span><small>Nombre</small><strong>{user?.name}</strong></span></div><div><Mail aria-hidden="true" /><span><small>Correo</small><strong>{user?.email}</strong></span></div><div><ShieldCheck aria-hidden="true" /><span><small>Sesión</small><strong>Protegida con renovación segura</strong></span></div></section></div>;
}
