import { configureStore } from '@reduxjs/toolkit';
import { render, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import authReducer, { sessionCleared, sessionReceived } from '../app/authSlice';
import { ProtectedRoute } from './ProtectedRoute';

function renderRoute(status: 'checking' | 'anonymous' | 'authenticated') {
  const store = configureStore({ reducer: { auth: authReducer } });
  if (status === 'anonymous') store.dispatch(sessionCleared());
  if (status === 'authenticated') store.dispatch(sessionReceived({ user: { id: '1', name: 'Ana', email: 'ana@test.local' }, accessToken: 'token' }));
  render(<Provider store={store}><MemoryRouter initialEntries={['/dashboard']}><Routes>
    <Route path="/login" element={<h1>Inicia sesión</h1>} />
    <Route element={<ProtectedRoute />}><Route path="/dashboard" element={<h1>Panel privado</h1>} /></Route>
  </Routes></MemoryRouter></Provider>);
}

describe('ProtectedRoute', () => {
  it('muestra una espera mientras se comprueba la sesión', () => {
    renderRoute('checking');
    expect(screen.getByRole('status')).toHaveTextContent('Comprobando tu sesión');
  });

  it('redirige al login cuando no existe sesión', () => {
    renderRoute('anonymous');
    expect(screen.getByRole('heading', { name: 'Inicia sesión' })).toBeVisible();
  });

  it('presenta el contenido a una persona autenticada', () => {
    renderRoute('authenticated');
    expect(screen.getByRole('heading', { name: 'Panel privado' })).toBeVisible();
  });
});
