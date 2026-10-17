import { configureStore } from '@reduxjs/toolkit';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import authReducer, { sessionReceived } from '../app/authSlice';

vi.mock('../app/api', () => ({
  useSearchBooksQuery: vi.fn(),
  useGetBookQuery: vi.fn(),
  useBorrowMutation: vi.fn(() => [vi.fn(), { isLoading: false }]),
  useReserveMutation: vi.fn(() => [vi.fn(), { isLoading: false }]),
  useAddWishlistMutation: vi.fn(() => [vi.fn(), { isLoading: false }]),
  useSetReadingMutation: vi.fn(() => [vi.fn(), { isLoading: false }]),
  useGetLoansQuery: vi.fn(),
  useReturnLoanMutation: vi.fn(() => [vi.fn()]),
  useGetReservationsQuery: vi.fn(),
  useCancelReservationMutation: vi.fn(() => [vi.fn()]),
  useGetWishlistQuery: vi.fn(),
  useRemoveWishlistMutation: vi.fn(() => [vi.fn()]),
  useGetReadingQuery: vi.fn(),
  useGetNotificationsQuery: vi.fn(),
  useMarkNotificationMutation: vi.fn(() => [vi.fn()]),
  readApiError: vi.fn(() => ({ message: 'No se pudo completar la acción' })),
}));

import {
  useGetBookQuery,
  useGetLoansQuery,
  useGetNotificationsQuery,
  useGetReadingQuery,
  useGetReservationsQuery,
  useGetWishlistQuery,
  useSearchBooksQuery,
} from '../app/api';
import AboutPage from './AboutPage';
import AccountPage from './AccountPage';
import BookDetailPage from './BookDetailPage';
import CatalogPage from './CatalogPage';
import DashboardPage from './DashboardPage';
import HomePage from './HomePage';
import LoansPage from './LoansPage';
import NotFoundPage from './NotFoundPage';
import NotificationsPage from './NotificationsPage';
import ReadingPage from './ReadingPage';
import ReservationsPage from './ReservationsPage';
import WishlistPage from './WishlistPage';

const book = {
  id: 'book-1', openLibraryKey: 'OL1W', workId: 'OL1W', title: 'Cien años de soledad',
  authors: ['Gabriel García Márquez'], coverId: null, firstPublishYear: 1967,
  subjects: ['Literatura'], editions: 12, description: 'Una historia de la familia Buendía.',
  availability: { total: 2, available: 1 }, isbn: null, links: [],
};
const loan = { id: 'loan-1', borrowedAt: '2026-10-01T00:00:00.000Z', dueAt: '2026-10-31T00:00:00.000Z', returnedAt: null, status: 'ACTIVE', book };
const reservation = { id: 'reservation-1', status: 'WAITING', availableUntil: null, createdAt: '2026-10-17T00:00:00.000Z', book };
const reading = { id: 'reading-1', readingStatus: 'READING', wishlistedAt: null, book };
const notification = { id: 'notification-1', title: 'Tu reserva está disponible', message: 'Tienes 48 horas para pedirla.', readAt: null, createdAt: '2026-10-17T12:00:00.000Z', book };

function renderPage(element: React.ReactNode, initial = '/') {
  const store = configureStore({ reducer: { auth: authReducer } });
  store.dispatch(sessionReceived({ user: { id: 'user-1', name: 'Santiago Cardenas', email: 'demo@nexolibris.test' }, accessToken: 'token' }));
  return render(<Provider store={store}><MemoryRouter initialEntries={[initial]}>{element}</MemoryRouter></Provider>);
}

beforeEach(() => {
  vi.mocked(useSearchBooksQuery).mockReturnValue({ data: { items: [book], page: 1, pageSize: 24, total: 1, totalPages: 1 }, isLoading: false, isFetching: false, error: undefined, refetch: vi.fn() } as never);
  vi.mocked(useGetBookQuery).mockReturnValue({ data: book, isLoading: false, error: undefined, refetch: vi.fn() } as never);
  vi.mocked(useGetLoansQuery).mockReturnValue({ data: [loan], isLoading: false } as never);
  vi.mocked(useGetReservationsQuery).mockReturnValue({ data: [reservation], isLoading: false } as never);
  vi.mocked(useGetWishlistQuery).mockReturnValue({ data: [reading], isLoading: false } as never);
  vi.mocked(useGetReadingQuery).mockReturnValue({ data: [reading], isLoading: false } as never);
  vi.mocked(useGetNotificationsQuery).mockReturnValue({ data: [notification], isLoading: false } as never);
});

describe('páginas públicas', () => {
  it('muestra la portada y una lectura destacada', () => {
    renderPage(<HomePage />);
    expect(screen.getByRole('heading', { name: 'Encuentra tu próxima lectura' })).toBeVisible();
    expect(screen.getByRole('heading', { name: book.title })).toBeVisible();
  });

  it('normaliza una página inválida del catálogo', () => {
    renderPage(<CatalogPage />, '/catalog?q=soledad&page=-4&sort=inventado');
    expect(useSearchBooksQuery).toHaveBeenCalledWith(expect.objectContaining({ page: 1, sort: 'relevance' }));
    expect(screen.getByText('Página 1 de 1')).toBeVisible();
  });

  it('presenta detalle, información institucional y la ruta 404', () => {
    const { rerender } = renderPage(<Routes><Route path="/books/:workId" element={<BookDetailPage />} /></Routes>, '/books/OL1W');
    expect(screen.getByRole('heading', { name: book.title })).toBeVisible();
    rerender(<MemoryRouter><AboutPage /></MemoryRouter>);
    expect(screen.getByRole('heading', { name: 'Acerca de NexoLibris' })).toBeVisible();
    rerender(<MemoryRouter><NotFoundPage /></MemoryRouter>);
    expect(screen.getByText('404')).toBeVisible();
  });
});

describe('biblioteca personal', () => {
  it('resume el estado de la cuenta y muestra sus datos', () => {
    const { rerender } = renderPage(<DashboardPage />);
    expect(screen.getByRole('heading', { name: 'Hola, Santiago' })).toBeVisible();
    expect(screen.getByText('Préstamos activos')).toBeVisible();
    rerender(<Provider store={configureStore({ reducer: { auth: authReducer }, preloadedState: { auth: { user: { id: '1', name: 'Santiago', email: 'demo@nexolibris.test' }, accessToken: 'token', status: 'authenticated' as const } } })}><MemoryRouter><AccountPage /></MemoryRouter></Provider>);
    expect(screen.getByText('demo@nexolibris.test')).toBeVisible();
  });

  it.each([
    [<LoansPage key="loans" />, 'Préstamos', 'Vence el'],
    [<ReservationsPage key="reservations" />, 'Reservas', 'En cola'],
    [<WishlistPage key="wishlist" />, 'Lista de deseos', 'Guardado en tu lista'],
    [<ReadingPage key="reading" />, 'Seguimiento de lectura', 'Actualizar estado'],
    [<NotificationsPage key="notifications" />, 'Notificaciones', 'Tu reserva está disponible'],
  ])('presenta %s con información disponible', (element, heading, visibleText) => {
    renderPage(element);
    expect(screen.getByRole('heading', { name: heading })).toBeVisible();
    expect(screen.getByText(new RegExp(visibleText))).toBeVisible();
  });

  it('muestra estados vacíos sin dejar una página en blanco', () => {
    vi.mocked(useGetLoansQuery).mockReturnValue({ data: [], isLoading: false } as never);
    renderPage(<LoansPage />);
    expect(screen.getByRole('status')).toHaveTextContent('Aún no tienes préstamos');
  });
});
