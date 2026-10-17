import { Search } from 'lucide-react';
import { useState, type FormEvent } from 'react';

export function SearchForm({ initialValue = '', onSearch, compact = false }: { initialValue?: string; onSearch: (value: string) => void; compact?: boolean }) {
  const [value, setValue] = useState(initialValue);
  const [error, setError] = useState('');
  const submit = (event: FormEvent) => {
    event.preventDefault();
    const query = value.trim();
    if (!query) { setError('Escribe un título, autor o palabra clave.'); return; }
    setError(''); onSearch(query);
  };
  return <form className={compact ? 'search-form compact' : 'search-form'} onSubmit={submit} role="search" noValidate>
    <label htmlFor={compact ? 'catalog-search' : 'home-search'}>Buscar por título, autor o palabra clave</label>
    <div className="search-control"><Search aria-hidden="true" /><input id={compact ? 'catalog-search' : 'home-search'} value={value} onChange={(e) => setValue(e.target.value)} placeholder="Ej. García Márquez, astronomía…" aria-describedby={error ? 'search-error' : undefined} /><button className="button button-primary" type="submit">Buscar</button></div>
    {error && <p id="search-error" className="field-error" role="alert">{error}</p>}
  </form>;
}
