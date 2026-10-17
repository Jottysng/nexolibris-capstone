import { Bell, BookCheck, Bookmark, Heart, LibraryBig } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useGetLoansQuery, useGetNotificationsQuery, useGetReservationsQuery, useGetWishlistQuery } from '../app/api';
import { useAppSelector } from '../app/hooks';

export default function DashboardPage() {
  const user = useAppSelector((state) => state.auth.user);
  const { data: loans } = useGetLoansQuery(); const { data: reservations } = useGetReservationsQuery();
  const { data: wishlist } = useGetWishlistQuery(); const { data: notifications } = useGetNotificationsQuery();
  const cards = [
    { to: '/loans', icon: BookCheck, value: loans?.filter((item) => item.status === 'ACTIVE').length ?? 0, label: 'Préstamos activos' },
    { to: '/reservations', icon: Bookmark, value: reservations?.filter((item) => ['WAITING', 'AVAILABLE'].includes(item.status)).length ?? 0, label: 'Reservas abiertas' },
    { to: '/wishlist', icon: Heart, value: wishlist?.length ?? 0, label: 'Lista de deseos' },
    { to: '/notifications', icon: Bell, value: notifications?.filter((item) => !item.readAt).length ?? 0, label: 'Avisos nuevos' },
  ];
  return <div className="container page-section dashboard"><div className="page-heading"><div><h1>Hola, {user?.name.split(' ')[0]}</h1><p>Este es el estado actual de tu biblioteca.</p></div><Link className="button button-primary" to="/catalog"><LibraryBig aria-hidden="true" />Explorar catálogo</Link></div>
    <div className="stat-grid">{cards.map(({ to, icon: Icon, value, label }) => <Link to={to} key={to} className="stat-card"><Icon aria-hidden="true" /><strong>{value}</strong><span>{label}</span></Link>)}</div>
    <section className="dashboard-links"><h2>Organiza tus lecturas</h2><div><Link to="/reading">Seguimiento de lectura</Link><Link to="/loans">Historial de préstamos</Link><Link to="/account">Datos de la cuenta</Link></div></section>
  </div>;
}
