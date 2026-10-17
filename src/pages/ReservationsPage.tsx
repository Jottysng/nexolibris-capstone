import { useCancelReservationMutation, useGetReservationsQuery } from '../app/api';
import { EmptyState, LoadingState } from '../components/States';
import { LibraryBookRow } from '../features/library/LibraryBookRow';

const status: Record<string, string> = { WAITING: 'En cola', AVAILABLE: 'Disponible por 48 horas', FULFILLED: 'Completada', CANCELLED: 'Cancelada', EXPIRED: 'Vencida' };
export default function ReservationsPage() {
  const { data, isLoading } = useGetReservationsQuery(); const [cancel] = useCancelReservationMutation();
  if (isLoading) return <LoadingState label="Consultando reservas" />;
  return <div className="container page-section"><div className="page-heading"><div><h1>Reservas</h1><p>Las reservas se atienden en el orden en que fueron solicitadas.</p></div></div>{!data?.length ? <EmptyState title="No tienes reservas"><p>Cuando un libro no tenga copias, puedes entrar en la lista de espera.</p></EmptyState> : <div className="library-list">{data.map((item) => <LibraryBookRow key={item.id} book={item.book} meta={status[item.status] ?? item.status} actionLabel={['WAITING', 'AVAILABLE'].includes(item.status) ? 'Cancelar' : undefined} destructive onAction={() => cancel(item.id)} />)}</div>}</div>;
}
