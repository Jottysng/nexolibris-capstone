import { Bell, LogIn, LogOut, Menu, UserRound, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
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
  const toggleRef = useRef<HTMLButtonElement>(null);
  const location = useLocation();
  const auth = useAppSelector((state) => state.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [logout] = useLogoutMutation();
  useEffect(() => { window.scrollTo({ top: 0, behavior: 'instant' }); setOpen(false); }, [location.pathname]);
  useEffect(() => {
    if (!open) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { setOpen(false); toggleRef.current?.focus(); }
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [open]);
  const close = () => setOpen(false);
  const signOut = async () => {
    try { await logout().unwrap(); }
    catch { /* La sesión local se limpia aunque el servidor no responda. */ }
    finally { dispatch(sessionCleared()); navigate('/'); close(); }
  };
  return <div className="site-shell">
    <header className="site-header">
      <div className="container header-inner">
        <Brand />
        <button ref={toggleRef} className="icon-button nav-toggle" onClick={() => setOpen((value) => !value)} aria-expanded={open} aria-controls="main-nav" aria-label={open ? 'Cerrar menú' : 'Abrir menú'}>
          {open ? <X aria-hidden="true" /> : <Menu aria-hidden="true" />}
        </button>
        <nav id="main-nav" className={open ? 'main-nav is-open' : 'main-nav'} aria-label="Navegación principal">
          {nav.map((item) => <NavLink key={item.to} to={item.to} end={item.end} onClick={close}>{item.label}</NavLink>)}
          <div className="mobile-session-actions">
            {auth.status === 'authenticated' ? <>
              <NavLink to="/notifications" onClick={close}><Bell aria-hidden="true" /> Notificaciones</NavLink>
              <NavLink to="/account" onClick={close}><UserRound aria-hidden="true" /> Mi cuenta</NavLink>
              <button className="mobile-logout" onClick={signOut}><LogOut aria-hidden="true" /> Cerrar sesión</button>
            </> : <NavLink to="/login" onClick={close}><LogIn aria-hidden="true" /> Iniciar sesión</NavLink>}
          </div>
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
