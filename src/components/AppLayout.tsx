import { Bell, LogIn, Menu, UserRound, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { useLogoutMutation } from '../app/api';
import { sessionCleared } from '../app/authSlice';
import { Brand } from './Brand';
import { ThemeSwitcher } from './ThemeSwitcher';

const nav = [
  { to: '/', label: 'Inicio', end: true },
  { to: '/catalog', label: 'Catálogo' },
  { to: '/dashboard', label: 'Mi biblioteca' },
  { to: '/about', label: 'Acerca de' },
];

export function AppLayout() {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const auth = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [logout] = useLogoutMutation();
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' }); }, [location.pathname]);
  const close = () => setOpen(false);
  const signOut = async () => { await logout(); dispatch(sessionCleared()); navigate('/'); close(); };
  return <div className="site-shell">
    <header className="site-header">
      <div className="container header-inner">
        <Brand />
        <button className="icon-button nav-toggle" onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-controls="main-nav" aria-label={open ? 'Cerrar menú' : 'Abrir menú'}>
          {open ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
        </button>
        <nav id="main-nav" className={open ? 'main-nav is-open' : 'main-nav'} aria-label="Navegación principal">
          {nav.map((item) => <NavLink key={item.to} to={item.to} end={item.end} onClick={close}>{item.label}</NavLink>)}
        </nav>
        <div className="header-actions">
          <ThemeSwitcher />
          {auth.status === 'authenticated' ? <>
            <NavLink className="icon-button" to="/notifications" aria-label="Notificaciones"><Bell aria-hidden="true" /></NavLink>
            <NavLink className="account-link" to="/account"><UserRound aria-hidden="true" />{auth.user?.name.split(' ')[0]}</NavLink>
            <button className="text-button" onClick={signOut}>Salir</button>
          </> : <NavLink className="button button-outline" to="/login"><LogIn aria-hidden="true" />Iniciar sesión</NavLink>}
        </div>
      </div>
    </header>
    <main id="contenido"><Outlet /></main>
    <footer className="site-footer"><div className="container footer-inner"><Brand /><p>Catálogo, préstamos y lectura en un mismo lugar.</p><small>© 2026 NexoLibris</small></div></footer>
  </div>;
}
