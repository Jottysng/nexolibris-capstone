import { useGetWishlistQuery, useRemoveWishlistMutation } from '../app/api';
import { EmptyState, LoadingState } from '../components/States';
import { LibraryBookRow } from '../features/library/LibraryBookRow';

export default function WishlistPage() {
  const { data, isLoading } = useGetWishlistQuery(); const [remove] = useRemoveWishlistMutation();
  if (isLoading) return <LoadingState label="Abriendo tu lista" />;
  return <div className="container page-section"><div className="page-heading"><div><h1>Lista de deseos</h1><p>Libros que quieres tener a mano para más adelante.</p></div></div>{!data?.length ? <EmptyState title="Tu lista está vacía"><p>Guarda un libro desde su página de detalle.</p></EmptyState> : <div className="library-list">{data.map((item) => <LibraryBookRow key={item.id} book={item.book} meta="Guardado en tu lista" actionLabel="Quitar" destructive onAction={() => remove(item.book.openLibraryKey)} />)}</div>}</div>;
}
