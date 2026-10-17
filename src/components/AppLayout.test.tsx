import { configureStore } from '@reduxjs/toolkit';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import authReducer, { sessionReceived } from '../app/authSlice';
import { ThemeProvider } from '../app/ThemeContext';
import { AppLayout } from './AppLayout';

const logout = vi.fn(() => ({ unwrap: () => Promise.resolve() }));
vi.mock('../app/api', () => ({ useLogoutMutation: () => [logout] }));

function renderLayout(authenticated = false) {
  const store = configureStore({ reducer: { auth: authReducer } });
  if (authenticated) store.dispatch(sessionReceived({ user: { id: '1', name: 'Santiago Cardenas', email: 'demo@nexolibris.test' }, accessToken: 'token' }));
  return render(<Provider store={store}><ThemeProvider><MemoryRouter><Routes><Route element={<AppLayout />}><Route index element={<h1>Inicio</h1>} /></Route></Routes></MemoryRouter></ThemeProvider></Provider>);
}

beforeEach(() => {
  vi.stubGlobal('scrollTo', vi.fn());
  logout.mockClear();
});

describe('AppLayout', () => {
  it('ofrece inicio de sesión dentro del menú móvil', async () => {
    renderLayout();
    await userEvent.click(screen.getByRole('button', { name: 'Abrir menú' }));
    expect(screen.getAllByRole('link', { name: /Iniciar sesión/ })).toHaveLength(2);
  });

  it('cierra la sesión aunque el servidor no pueda responder', async () => {
    logout.mockReturnValueOnce({ unwrap: () => Promise.reject(new Error('sin red')) });
    renderLayout(true);
    await userEvent.click(screen.getByRole('button', { name: 'Salir' }));
    expect(logout).toHaveBeenCalledOnce();
    expect(screen.getAllByRole('link', { name: /Iniciar sesión/ })).toHaveLength(2);
  });
});
