import { ArrowRight, CalendarDays } from 'lucide-react';
import { memo } from 'react';
import { Link } from 'react-router-dom';
import type { BookSummary } from '../../../shared/contracts';
import { BookCover } from './BookCover';

export const BookCard = memo(function BookCard({ book }: { book: BookSummary }) {
  const available = (book.availability?.available ?? 1) > 0;
  return <article className="book-card">
    <Link className="cover-link" to={`/books/${book.workId}`} aria-label={`Ver ${book.title}`}><BookCover coverId={book.coverId} title={book.title} /></Link>
    <div className="book-card-body">
      <h3><Link to={`/books/${book.workId}`}>{book.title}</Link></h3>
      <p className="book-author">{book.authors.join(', ')}</p>
      {book.firstPublishYear && <p className="book-year"><CalendarDays aria-hidden="true" />{book.firstPublishYear}</p>}
      <p className={available ? 'availability available' : 'availability unavailable'}>{available ? 'Disponible' : 'Sin copias disponibles'}</p>
      <Link className="button button-primary button-block" to={`/books/${book.workId}`}>Ver libro <ArrowRight aria-hidden="true" /></Link>
    </div>
  </article>;
});
