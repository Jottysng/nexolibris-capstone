import { LRUCache } from 'lru-cache';
import type { BookDetail, BookSummary, Paged } from '../../shared/contracts.js';
import { config } from '../config.js';
import { AppError } from '../errors.js';
import { cleanWorkId } from '../utils.js';

const cache = new LRUCache<string, object>({ max: 250, ttl: 10 * 60 * 1000 });
const headers = { 'User-Agent': `NexoLibris/1.0 (${config.OPEN_LIBRARY_CONTACT_EMAIL})`, Accept: 'application/json' };

async function getJson<T>(url: URL): Promise<T> {
  const key = url.toString();
  const cached = cache.get(key) as T | undefined;
  if (cached) return cached;
  let response: Response;
  try { response = await fetch(url, { headers, signal: AbortSignal.timeout(8000) }); }
  catch { throw new AppError(503, 'CATALOG_UNAVAILABLE', 'El catálogo externo no está disponible en este momento.'); }
  if (!response.ok) throw new AppError(response.status === 404 ? 404 : 502, 'CATALOG_ERROR', 'No pudimos consultar el catálogo.');
  const data = await response.json() as T;
  cache.set(key, data as object);
  return data;
}

type SearchDoc = {
  key?: string; title?: string; author_name?: string[]; cover_i?: number; first_publish_year?: number;
  subject?: string[]; edition_count?: number; isbn?: string[];
};
type SearchResponse = { numFound: number; docs: SearchDoc[] };

const sortMap: Record<string, string | undefined> = {
  relevance: undefined,
  popularity: 'readinglog',
  newest: 'new',
  oldest: 'old',
};

export async function searchBooks(input: { q: string; category?: string; sort: string; page: number; pageSize: number }): Promise<Paged<BookSummary>> {
  const url = new URL('https://openlibrary.org/search.json');
  url.searchParams.set('q', input.q || 'literatura');
  if (input.category) url.searchParams.set('subject', input.category);
  url.searchParams.set('page', String(input.page));
  url.searchParams.set('limit', String(input.pageSize));
  url.searchParams.set('fields', 'key,title,author_name,cover_i,first_publish_year,subject,edition_count,isbn');
  const sort = sortMap[input.sort];
  if (sort) url.searchParams.set('sort', sort);
  const data = await getJson<SearchResponse>(url);
  let items = data.docs.filter((doc) => doc.key?.startsWith('/works/') && doc.key.endsWith('W') && doc.title).map((doc) => ({
    workId: cleanWorkId(doc.key!), title: doc.title!, authors: doc.author_name?.slice(0, 3) ?? ['Autor desconocido'],
    coverId: doc.cover_i ?? null, firstPublishYear: doc.first_publish_year ?? null,
    subjects: doc.subject?.slice(0, 5) ?? [], editions: doc.edition_count ?? 0,
  }));
  if (input.sort === 'author') items = items.toSorted((a, b) => a.authors[0].localeCompare(b.authors[0], 'es'));
  const total = data.numFound;
  return { items, page: input.page, pageSize: input.pageSize, total, totalPages: Math.max(1, Math.ceil(total / input.pageSize)) };
}

type WorkResponse = {
  key?: string; title?: string; description?: string | { value?: string }; covers?: number[];
  subjects?: string[]; first_publish_date?: string; authors?: Array<{ author?: { key?: string } }>;
  links?: Array<{ title?: string; url?: string }>;
};
type AuthorResponse = { name?: string };

export async function getBook(workId: string): Promise<BookDetail> {
  const id = cleanWorkId(workId);
  if (!id) throw new AppError(400, 'INVALID_WORK_ID', 'El identificador del libro no es válido.');
  const data = await getJson<WorkResponse>(new URL(`https://openlibrary.org/works/${id}.json`));
  const authorKeys = data.authors?.map((item) => item.author?.key).filter(Boolean).slice(0, 4) as string[] ?? [];
  const authors = await Promise.all(authorKeys.map(async (key) => {
    try { return (await getJson<AuthorResponse>(new URL(`https://openlibrary.org${key}.json`))).name ?? 'Autor desconocido'; }
    catch { return 'Autor desconocido'; }
  }));
  const rawDescription = data.description;
  const description = typeof rawDescription === 'string' ? rawDescription : rawDescription?.value ?? 'Open Library no tiene una descripción para esta obra.';
  return {
    workId: id, title: data.title ?? 'Título sin registrar', authors: authors.length ? authors : ['Autor desconocido'],
    coverId: data.covers?.find((cover) => cover > 0) ?? null,
    firstPublishYear: data.first_publish_date ? Number.parseInt(data.first_publish_date, 10) || null : null,
    subjects: data.subjects?.slice(0, 10) ?? [], editions: 0, description, isbn: null,
    links: data.links?.filter((link) => link.title && link.url).slice(0, 5).map((link) => ({ title: link.title!, url: link.url! })) ?? [],
  };
}
