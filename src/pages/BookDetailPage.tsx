import { Bookmark, BookOpenCheck, CalendarDays, Heart, Library, Users } from 'lucide-react';
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useAddWishlistMutation, useBorrowMutation, useGetBookQuery, useReserveMutation, useSetReadingMutation, readApiError } from '../app/api';
import { useAppSelector } from '../app/hooks';
import { BookCover } from '../features/books/BookCover';
import { ErrorState, LoadingState } from '../components/States';

export default function BookDetailPage() {
  const { workId = '' } = useParams();
  const auth = useAppSelector((state) => state.auth);
  const { data, isLoading, error, refetch } = useGetBookQuery(workId);
  const [borrow, borrowState] = useBorrowMutation();
  const [reserve, reserveState] = useReserveMutation();
  const [addWishlist, wishlistState] = useAddWishlistMutation();
  const [setReading, readingState] = useSetReadingMutation();
  const [notice, setNotice] = useState('');
  const [actionError, setActionError] = useState('');
  const availability = (data as (typeof data & { availability?: { total: number; available: number } }))?.availability;
  const run = async (action: () => Promise<unknown>, success: string) => {
    setActionError(''); setNotice('');
    try { await action(); setNotice(success); refetch(); }
    catch (reason) { setActionError(readApiError(reason).message); }
  };
  if (isLoading) return <LoadingState label="Abriendo el libro" />;
  if (error || !data) return <ErrorState message="No encontramos esta obra en el catálogo." />;
  const available = (availability?.available ?? 1) > 0;
  return <div className="container page-section book-detail">
    <nav className="breadcrumbs" aria-label="Migas de pan"><Link to="/catalog">Catálogo</Link><span aria-hidden="true">/</span><span>{data.title}</span></nav>
    <div className="detail-grid"><div className="detail-cover"><BookCover coverId={data.coverId} title={data.title} size="L" /></div>
      <article className="detail-copy"><p className={available ? 'availability available' : 'availability unavailable'}>{available ? `${availability?.available ?? 1} copia disponible` : 'Sin copias disponibles'}</p><h1>{data.title}</h1><p className="detail-authors">{data.authors.join(', ')}</p>
        <div className="book-facts">{data.firstPublishYear && <span><CalendarDays aria-hidden="true" />Primera publicación: {data.firstPublishYear}</span>}<span><Users aria-hidden="true" />{data.editions || 'Varias'} ediciones</span><span><Library aria-hidden="true" />Fuente: Open Library</span></div>
        <p className="description">{data.description}</p>
        {data.subjects.length > 0 && <div className="subject-list" aria-label="Temas">{data.subjects.slice(0, 6).map((subject) => <span key={subject}>{subject}</span>)}</div>}
        {auth.status !== 'authenticated' ? <div className="signin-callout"><h2>¿Quieres pedirlo prestado?</h2><p>Inicia sesión o crea una cuenta para usar las funciones de la biblioteca.</p><Link className="button button-primary" to="/login" state={{ from: `/books/${workId}` }}>Iniciar sesión</Link><Link className="button button-outline" to="/register">Crear cuenta</Link></div> : <div className="book-actions">
          {available ? <button className="button button-primary" disabled={borrowState.isLoading} onClick={() => run(() => borrow(workId).unwrap(), 'Préstamo registrado. Tienes 14 días para disfrutar la lectura.')}><BookOpenCheck aria-hidden="true" />Solicitar préstamo</button> : <button className="button button-primary" disabled={reserveState.isLoading} onClick={() => run(() => reserve(workId).unwrap(), 'Reserva registrada. Te avisaremos cuando haya una copia.')}><Bookmark aria-hidden="true" />Reservar</button>}
          <button className="button button-outline" disabled={wishlistState.isLoading} onClick={() => run(() => addWishlist(workId).unwrap(), 'Libro guardado en tu lista de deseos.')}><Heart aria-hidden="true" />Guardar</button>
          <label className="reading-select">Estado de lectura<select disabled={readingState.isLoading} defaultValue="" onChange={(e) => e.target.value && run(() => setReading({ id: workId, status: e.target.value as 'TO_READ' | 'READING' | 'COMPLETED' }).unwrap(), 'Estado de lectura actualizado.')}><option value="" disabled>Seleccionar</option><option value="TO_READ">Quiero leer</option><option value="READING">Leyendo</option><option value="COMPLETED">Completado</option></select></label>
        </div>}
        <div className="action-feedback" aria-live="polite">{notice && <p className="success-message">{notice}</p>}{actionError && <p className="field-error">{actionError}</p>}</div>
      </article></div>
  </div>;
}
