import { ArrowRight, BookMarked, Clock3, SearchCheck } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useSearchBooksQuery } from '../app/api';
import { BookCard } from '../features/books/BookCard';
import { SearchForm } from '../features/books/SearchForm';

export default function HomePage() {
  const navigate = useNavigate();
  const { data } = useSearchBooksQuery({ q: 'literatura latinoamericana', page: 1 });
  return <>
    <section className="hero">
      <div className="container hero-grid">
        <div><h1>Encuentra tu próxima lectura</h1><p>Explora obras de Open Library y gestiona préstamos, reservas y avances de lectura desde tu biblioteca universitaria.</p><SearchForm onSearch={(q) => navigate(`/catalog?q=${encodeURIComponent(q)}`)} /></div>
        <div className="library-illustration" aria-hidden="true"><span className="shelf shelf-one" /><span className="shelf shelf-two" /><span className="table-shape" /></div>
      </div>
    </section>
    <section className="home-benefits container" aria-label="Servicios de la biblioteca">
      <article><SearchCheck aria-hidden="true" /><h2>Catálogo abierto</h2><p>Busca por autor, título o tema sin necesidad de iniciar sesión.</p></article>
      <article><BookMarked aria-hidden="true" /><h2>Biblioteca personal</h2><p>Guarda deseos y organiza cada libro según tu avance.</p></article>
      <article><Clock3 aria-hidden="true" /><h2>Reservas claras</h2><p>Consulta fechas de devolución y recibe avisos cuando haya una copia.</p></article>
    </section>
    <section className="container featured-section"><div className="section-heading"><div><h2>Lecturas destacadas</h2><p>Una selección para empezar a recorrer el catálogo.</p></div><Link className="text-link" to="/catalog">Ver catálogo <ArrowRight aria-hidden="true" /></Link></div>
      <div className="book-grid">{data?.items.slice(0, 4).map((book) => <BookCard key={book.workId} book={book} />)}</div>
    </section>
  </>;
}
