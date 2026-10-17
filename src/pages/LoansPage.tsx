import { useGetLoansQuery, useReturnLoanMutation } from '../app/api';
import { EmptyState, LoadingState } from '../components/States';
import { LibraryBookRow } from '../features/library/LibraryBookRow';

const date = (value: string) => new Intl.DateTimeFormat('es-CO', { dateStyle: 'long' }).format(new Date(value));
export default function LoansPage() {
  const { data, isLoading } = useGetLoansQuery(); const [returnLoan] = useReturnLoanMutation();
  if (isLoading) return <LoadingState label="Consultando préstamos" />;
  return <div className="container page-section"><div className="page-heading"><div><h1>Préstamos</h1><p>Consulta fechas de vencimiento y devuelve tus ejemplares.</p></div></div>{!data?.length ? <EmptyState title="Aún no tienes préstamos"><p>Explora el catálogo y solicita tu primera lectura.</p></EmptyState> : <div className="library-list">{data.map((loan) => <LibraryBookRow key={loan.id} book={loan.book} meta={loan.status === 'ACTIVE' ? `Vence el ${date(loan.dueAt)}` : `Devuelto el ${date(loan.returnedAt!)}`} actionLabel={loan.status === 'ACTIVE' ? 'Devolver' : undefined} onAction={() => returnLoan(loan.id)} />)}</div>}</div>;
}
