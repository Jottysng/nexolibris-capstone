import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { ThemeProvider } from '../app/ThemeContext';
import { ThemeSwitcher } from './ThemeSwitcher';

describe('ThemeSwitcher', () => {
  it('cambia el tema y lo conserva', async () => {
    render(<ThemeProvider><ThemeSwitcher /></ThemeProvider>);
    const button = screen.getByRole('button', { name: 'Usar tema oscuro' });
    await userEvent.click(button);
    expect(document.documentElement).toHaveAttribute('data-theme', 'dark');
    expect(localStorage.getItem('nexolibris-theme')).toBe('dark');
    expect(button).toHaveAttribute('aria-pressed', 'true');
  });
});
