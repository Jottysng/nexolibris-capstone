import { BookOpen } from 'lucide-react';
import { useState } from 'react';
import { coverUrl } from '../../../shared/contracts';

export function BookCover({ coverId, title, size = 'M' }: { coverId: number | null; title: string; size?: 'M' | 'L' }) {
  const [failed, setFailed] = useState(false);
  const src = coverUrl(coverId, size);
  if (!src || failed) return <div className="cover-fallback" role="img" aria-label={`Portada no disponible para ${title}`}><BookOpen aria-hidden="true" /><span>{title}</span></div>;
  return <img className="book-cover" src={src} alt={`Portada de ${title}`} loading="lazy" onError={() => setFailed(true)} />;
}
