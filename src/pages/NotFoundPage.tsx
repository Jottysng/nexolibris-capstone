import { Compass } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return <div className="not-found"><Compass aria-hidden="true" /><p className="error-code">404</p><h1>Esta página no está en el catálogo</h1><p>Revisa la dirección o vuelve al inicio.</p><Link className="button button-primary" to="/">Volver al inicio</Link></div>;
}
