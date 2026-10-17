import { BookOpen, RotateCcw, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { BookRecord } from '../../app/api';
import { BookCover } from '../books/BookCover';

export function LibraryBookRow({ book, meta, actionLabel, onAction, destructive = false }: { book: BookRecord; meta: string; actionLabel?: string; onAction?: () => void; destructive?: boolean }) {
  return <article className="library-row"><BookCover coverId={book.coverId} title={book.title} /><div><h2><Link to={`/books/${book.openLibraryKey}`}>{book.title}</Link></h2><p>{book.authors.join(', ')}</p><p className="row-meta">{meta}</p></div><div className="row-actions"><Link className="button button-outline" to={`/books/${book.openLibraryKey}`}><BookOpen aria-hidden="true" />Ver</Link>{actionLabel && <button className={destructive ? 'button button-danger' : 'button button-primary'} onClick={onAction}>{destructive ? <Trash2 aria-hidden="true" /> : <RotateCcw aria-hidden="true" />}{actionLabel}</button>}</div></article>;
}
