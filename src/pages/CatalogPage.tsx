import { SlidersHorizontal } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { useSearchBooksQuery } from '../app/api';
import { BookCard } from '../features/books/BookCard';
import { SearchForm } from '../features/books/SearchForm';
import { EmptyState, ErrorState, LoadingState } from '../components/States';

const categories = ['', 'Literatura', 'Historia', 'Ciencia', 'Tecnología', 'Arte', 'Filosofía'];
const sorts = [
  ['relevance', 'Relevancia'], ['popularity', 'Popularidad'], ['author', 'Autor'], ['newest', 'Más recientes'], ['oldest', 'Más antiguos'],
];

export default function CatalogPage() {
  const [params, setParams] = useSearchParams();
  const q = params.get('q') ?? '';
  const category = params.get('category') ?? '';
  const sort = params.get('sort') ?? 'relevance';
  const page = Number(params.get('page') ?? 1);
  const update = (key: string, value: string) => setParams((current) => { const next = new URLSearchParams(current); if (value) next.set(key, value); else next.delete(key); if (key !== 'page') next.set('page', '1'); return next; });
  const { data, isLoading, isFetching, error, refetch } = useSearchBooksQuery({ q, category, sort, page });
  return <div className="container page-section">
    <div className="catalog-heading"><div><h1>Catálogo</h1><p>Consulta millones de obras y encuentra una copia en NexoLibris.</p></div><SearchForm key={q} compact initialValue={q} onSearch={(value) => update('q', value)} /></div>
    <div className="catalog-toolbar"><div className="filter-title"><SlidersHorizontal aria-hidden="true" /><strong>Filtrar resultados</strong></div>
      <label>Tema<select value={category} onChange={(e) => update('category', e.target.value)}>{categories.map((item) => <option key={item} value={item}>{item || 'Todos los temas'}</option>)}</select></label>
      <label>Ordenar por<select value={sort} onChange={(e) => update('sort', e.target.value)}>{sorts.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
    </div>
    <div className="results-meta" aria-live="polite"><strong>{data?.total.toLocaleString('es-CO') ?? 0} resultados</strong>{isFetching && !isLoading && <span>Actualizando…</span>}</div>
    {isLoading ? <LoadingState label="Consultando el catálogo" /> : error ? <ErrorState message="Open Library no respondió. Intenta de nuevo." action={<button className="button button-primary" onClick={refetch}>Reintentar</button>} /> : !data?.items.length ? <EmptyState title="No encontramos libros"><p>Prueba otra palabra o elimina algún filtro.</p></EmptyState> : <>
      <div className="book-grid">{data.items.map((book) => <BookCard key={book.workId} book={book} />)}</div>
      <nav className="pagination" aria-label="Paginación"><button className="button button-outline" disabled={page <= 1} onClick={() => update('page', String(page - 1))}>Anterior</button><span>Página {data.page} de {data.totalPages}</span><button className="button button-outline" disabled={page >= data.totalPages} onClick={() => update('page', String(page + 1))}>Siguiente</button></nav>
    </>}
  </div>;
}
