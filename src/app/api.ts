import { createApi, fetchBaseQuery, type BaseQueryFn, type FetchArgs, type FetchBaseQueryError } from '@reduxjs/toolkit/query/react';
import type { ApiErrorBody, BookDetail, BookSummary, Paged, PublicUser } from '../../shared/contracts';
import { sessionCleared, sessionReceived } from './authSlice';
import type { RootState } from './store';

const rawBaseQuery = fetchBaseQuery({
  baseUrl: '/api', credentials: 'include',
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.accessToken;
    if (token) headers.set('authorization', `Bearer ${token}`);
    return headers;
  },
});

const baseQueryWithRefresh: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (args, api, options) => {
  let result = await rawBaseQuery(args, api, options);
  const path = typeof args === 'string' ? args : args.url;
  if (result.error?.status === 401 && !path.startsWith('/auth/')) {
    const refreshed = await rawBaseQuery({ url: '/auth/refresh', method: 'POST' }, api, options);
    if (refreshed.data) {
      api.dispatch(sessionReceived(refreshed.data as { user: PublicUser; accessToken: string }));
      result = await rawBaseQuery(args, api, options);
    } else api.dispatch(sessionCleared());
  }
  return result;
};

export type SessionResponse = { user: PublicUser; accessToken: string };
export type BookRecord = { id: string; openLibraryKey: string; title: string; authors: string[]; coverId: number | null };
export type Loan = { id: string; borrowedAt: string; dueAt: string; returnedAt: string | null; status: string; book: BookRecord };
export type Reservation = { id: string; status: string; availableUntil: string | null; createdAt: string; book: BookRecord };
export type BookState = { id: string; readingStatus: string | null; wishlistedAt: string | null; book: BookRecord };
export type Notification = { id: string; title: string; message: string; readAt: string | null; createdAt: string; book?: BookRecord };

export const api = createApi({
  reducerPath: 'api', baseQuery: baseQueryWithRefresh,
  tagTypes: ['Loans', 'Reservations', 'Wishlist', 'Reading', 'Notifications', 'Book'],
  endpoints: (builder) => ({
    searchBooks: builder.query<Paged<BookSummary>, { q?: string; category?: string; sort?: string; page?: number }>({
      query: (params) => ({ url: '/books/search', params }),
    }),
    getBook: builder.query<BookDetail, string>({ query: (id) => `/books/${id}`, providesTags: (_r, _e, id) => [{ type: 'Book', id }] }),
    login: builder.mutation<SessionResponse, { email: string; password: string }>({ query: (body) => ({ url: '/auth/login', method: 'POST', body }) }),
    register: builder.mutation<SessionResponse, { name: string; email: string; password: string; confirmPassword: string }>({ query: (body) => ({ url: '/auth/register', method: 'POST', body }) }),
    refresh: builder.mutation<SessionResponse, void>({ query: () => ({ url: '/auth/refresh', method: 'POST' }) }),
    logout: builder.mutation<void, void>({ query: () => ({ url: '/auth/logout', method: 'POST' }), invalidatesTags: ['Loans', 'Reservations', 'Wishlist', 'Reading', 'Notifications'] }),
    borrow: builder.mutation<Loan, string>({ query: (id) => ({ url: `/books/${id}/borrow`, method: 'POST' }), invalidatesTags: ['Loans', 'Reservations', 'Book'] }),
    reserve: builder.mutation<Reservation, string>({ query: (id) => ({ url: `/books/${id}/reserve`, method: 'POST' }), invalidatesTags: ['Reservations', 'Book'] }),
    getLoans: builder.query<Loan[], void>({ query: () => '/me/loans', providesTags: ['Loans'] }),
    returnLoan: builder.mutation<Loan, string>({ query: (id) => ({ url: `/loans/${id}/return`, method: 'POST' }), invalidatesTags: ['Loans', 'Reservations', 'Notifications', 'Book'] }),
    getReservations: builder.query<Reservation[], void>({ query: () => '/me/reservations', providesTags: ['Reservations'] }),
    cancelReservation: builder.mutation<void, string>({ query: (id) => ({ url: `/me/reservations/${id}`, method: 'DELETE' }), invalidatesTags: ['Reservations'] }),
    getWishlist: builder.query<BookState[], void>({ query: () => '/me/wishlist', providesTags: ['Wishlist'] }),
    addWishlist: builder.mutation<BookState, string>({ query: (id) => ({ url: `/me/wishlist/${id}`, method: 'PUT' }), invalidatesTags: ['Wishlist'] }),
    removeWishlist: builder.mutation<void, string>({ query: (id) => ({ url: `/me/wishlist/${id}`, method: 'DELETE' }), invalidatesTags: ['Wishlist'] }),
    getReading: builder.query<BookState[], void>({ query: () => '/me/reading', providesTags: ['Reading'] }),
    setReading: builder.mutation<BookState, { id: string; status: 'TO_READ' | 'READING' | 'COMPLETED' }>({ query: ({ id, status }) => ({ url: `/me/reading/${id}`, method: 'PUT', body: { status } }), invalidatesTags: ['Reading'] }),
    getNotifications: builder.query<Notification[], void>({ query: () => '/me/notifications', providesTags: ['Notifications'] }),
    markNotification: builder.mutation<Notification, string>({ query: (id) => ({ url: `/me/notifications/${id}/read`, method: 'PUT' }), invalidatesTags: ['Notifications'] }),
  }),
});

export const {
  useSearchBooksQuery, useGetBookQuery, useLoginMutation, useRegisterMutation, useRefreshMutation, useLogoutMutation,
  useBorrowMutation, useReserveMutation, useGetLoansQuery, useReturnLoanMutation, useGetReservationsQuery,
  useCancelReservationMutation, useGetWishlistQuery, useAddWishlistMutation, useRemoveWishlistMutation,
  useGetReadingQuery, useSetReadingMutation, useGetNotificationsQuery, useMarkNotificationMutation,
} = api;

export const readApiError = (error: unknown) => {
  if (error && typeof error === 'object' && 'data' in error) return (error as { data: ApiErrorBody }).data;
  return { code: 'NETWORK_ERROR', message: 'No pudimos conectar con el servidor.' };
};
