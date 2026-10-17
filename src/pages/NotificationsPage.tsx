import { Bell, Check } from 'lucide-react';
import { useGetNotificationsQuery, useMarkNotificationMutation } from '../app/api';
import { EmptyState, LoadingState } from '../components/States';

export default function NotificationsPage() {
  const { data, isLoading } = useGetNotificationsQuery(); const [mark] = useMarkNotificationMutation();
  if (isLoading) return <LoadingState label="Consultando avisos" />;
  return <div className="container page-section"><div className="page-heading"><div><h1>Notificaciones</h1><p>Avisos sobre reservas, préstamos y actividad de tu cuenta.</p></div></div>{!data?.length ? <EmptyState title="No tienes notificaciones"><p>Los avisos nuevos aparecerán en esta sección.</p></EmptyState> : <div className="notification-list">{data.map((item) => <article key={item.id} className={item.readAt ? 'notification read' : 'notification'}><Bell aria-hidden="true" /><div><h2>{item.title}</h2><p>{item.message}</p><time dateTime={item.createdAt}>{new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(item.createdAt))}</time></div>{!item.readAt && <button className="button button-outline" onClick={() => mark(item.id)}><Check aria-hidden="true" />Marcar como leída</button>}</article>)}</div>}</div>;
}
