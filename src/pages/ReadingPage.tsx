import { useGetReadingQuery, useSetReadingMutation } from '../app/api';
import { EmptyState, LoadingState } from '../components/States';
import { LibraryBookRow } from '../features/library/LibraryBookRow';

const labels: Record<string, string> = { TO_READ: 'Quiero leer', READING: 'Leyendo', COMPLETED: 'Completado' };
export default function ReadingPage() {
  const { data, isLoading } = useGetReadingQuery(); const [setReading] = useSetReadingMutation();
  if (isLoading) return <LoadingState label="Consultando tu progreso" />;
  return <div className="container page-section"><div className="page-heading"><div><h1>Seguimiento de lectura</h1><p>Actualiza tu avance cuando cambie tu relación con un libro.</p></div></div>{!data?.length ? <EmptyState title="No hay lecturas registradas"><p>Elige un estado desde el detalle de cualquier libro.</p></EmptyState> : <div className="library-list">{data.map((item) => <div key={item.id} className="reading-row"><LibraryBookRow book={item.book} meta={labels[item.readingStatus!] ?? ''} /><label>Actualizar estado<select value={item.readingStatus ?? ''} onChange={(e) => setReading({ id: item.book.openLibraryKey, status: e.target.value as 'TO_READ' | 'READING' | 'COMPLETED' })}><option value="TO_READ">Quiero leer</option><option value="READING">Leyendo</option><option value="COMPLETED">Completado</option></select></label></div>)}</div>}</div>;
}
