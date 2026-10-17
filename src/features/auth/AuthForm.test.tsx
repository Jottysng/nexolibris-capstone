import { fireEvent, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { AuthForm } from './AuthForm';

describe('AuthForm', () => {
  it('envía los valores visibles del inicio de sesión', async () => {
    const onSubmit = vi.fn();
    render(<AuthForm mode="login" loading={false} onSubmit={onSubmit} />);
    fireEvent.change(screen.getByRole('textbox', { name: 'Correo electrónico' }), { target: { value: 'demo@nexolibris.test' } });
    fireEvent.change(screen.getByLabelText('Contraseña'), { target: { value: 'Lectura2026!' } });
    await userEvent.click(screen.getByRole('button', { name: 'Entrar' }));
    expect(onSubmit).toHaveBeenCalledWith(expect.objectContaining({ email: 'demo@nexolibris.test', password: 'Lectura2026!' }));
  });

  it('asocia los errores con los campos y permite revelar la contraseña', async () => {
    render(<AuthForm mode="register" loading={false} onSubmit={vi.fn()} fieldErrors={{ email: ['Correo inválido'] }} serverError="Revisa los datos" />);
    const email = screen.getByLabelText(/Correo electrónico/);
    expect(email).toHaveAttribute('aria-invalid', 'true');
    expect(email).toHaveAccessibleDescription('Correo inválido');
    expect(screen.getByRole('alert')).toHaveTextContent('Revisa los datos');
    const password = screen.getByLabelText('Contraseña');
    await userEvent.click(screen.getByRole('button', { name: 'Mostrar contraseña' }));
    expect(password).toHaveAttribute('type', 'text');
  });
});
