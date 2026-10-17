import { BookOpen } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Brand() {
  return <Link className="brand" to="/" aria-label="NexoLibris, inicio">
    <BookOpen aria-hidden="true" />
    <span>Nexo<span>Libris</span><small>Biblioteca universitaria</small></span>
  </Link>;
}
