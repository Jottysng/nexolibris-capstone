import { configureStore } from '@reduxjs/toolkit';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import authReducer from '../app/authSlice';

const login = vi.fn();
const register = vi.fn();
const loginState: { isLoading: boolean; error?: unknown } = { isLoading: false };
const registerState: { isLoading: boolean; error?: unknown } = { isLoading: false };

vi.mock('../app/api', () => ({
  useLoginMutation: () => [login, loginState],
  useRegisterMutation: () => [register, registerState],
  readApiError: () => ({ message: 'Credenciales incorrectas', fieldErrors: { email: ['Revisa el correo'] } }),
}));

import LoginPage from './LoginPage';
import RegisterPage from './RegisterPage';

const session = { user: { id: 'user-1', name: 'Santiago', email: 'demo@nexolibris.test' }, accessToken: 'token' };

function renderAuth(path: '/login' | '/register') {
  const store = configureStore({ reducer: { auth: authReducer } });
  render(<Provider store={store}><MemoryRouter initialEntries={[path]}><Routes>
    <Route path="/login" element={<LoginPage />} />
    <Route path="/register" element={<RegisterPage />} />
    <Route path="/dashboard" element={<h1>Biblioteca personal</h1>} />
  </Routes></MemoryRouter></Provider>);
  return store;
}

beforeEach(() => {
  login.mockReset();
  register.mockReset();
  loginState.error = undefined;
  registerState.error = undefined;
});

describe('páginas de autenticación', () => {
  it('inicia sesión y redirige al panel', async () => {
    login.mockReturnValue({ unwrap: () => Promise.resolve(session) });
    renderAuth('/login');
    fireEvent.change(screen.getByRole('textbox', { name: 'Correo electrónico' }), { target: { value: session.user.email } });
    fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: 'Lectura2026!' } });
    await userEvent.click(screen.getByRole('button', { name: 'Entrar' }));
    expect(await screen.findByRole('heading', { name: 'Biblioteca personal' })).toBeVisible();
  });

  it('registra una cuenta y guarda la sesión', async () => {
    register.mockReturnValue({ unwrap: () => Promise.resolve(session) });
    const store = renderAuth('/register');
    fireEvent.change(screen.getByRole('textbox', { name: 'Nombre completo' }), { target: { value: 'Santiago Cardenas' } });
    fireEvent.change(screen.getByRole('textbox', { name: 'Correo electrónico' }), { target: { value: session.user.email } });
    fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: 'Lectura2026!' } });
    fireEvent.change(screen.getByLabelText('Confirmar contraseña'), { target: { value: 'Lectura2026!' } });
    await userEvent.click(screen.getByRole('button', { name: 'Crear cuenta' }));
    await waitFor(() => expect(store.getState().auth.status).toBe('authenticated'));
    expect(screen.getByRole('heading', { name: 'Biblioteca personal' })).toBeVisible();
  });

  it('presenta errores del servidor sin perder los campos accesibles', () => {
    loginState.error = { status: 401 };
    renderAuth('/login');
    expect(screen.getByRole('alert')).toHaveTextContent('Credenciales incorrectas');
    expect(screen.getByLabelText(/Correo electrónico/)).toHaveAttribute('aria-invalid', 'true');
  });
});
