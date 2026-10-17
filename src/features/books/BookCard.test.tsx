import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { BookCard } from './BookCard';

const book = { workId: 'OL1W', title: 'Libro de prueba', authors: ['Ana Torres'], coverId: null, firstPublishYear: 2020, subjects: ['Historia'], editions: 2 };

describe('BookCard', () => {
  it('presenta el contenido y un enlace accesible', () => {
    render(<MemoryRouter><BookCard book={{ ...book, availability: { total: 1, available: 1 } }} /></MemoryRouter>);
    expect(screen.getByRole('heading', { name: 'Libro de prueba' })).toBeVisible();
    expect(screen.getByText('Ana Torres')).toBeVisible();
    expect(screen.getByText('Disponible')).toBeVisible();
    expect(screen.getByRole('link', { name: 'Ver libro' })).toHaveAttribute('href', '/books/OL1W');
  });

  it('informa cuando no hay copias', () => {
    render(<MemoryRouter><BookCard book={{ ...book, availability: { total: 1, available: 0 } }} /></MemoryRouter>);
    expect(screen.getByText('Sin copias disponibles')).toBeVisible();
  });

  it('sustituye una portada que no puede cargarse', () => {
    render(<MemoryRouter><BookCard book={{ ...book, coverId: 123, availability: { total: 1, available: 1 } }} /></MemoryRouter>);
    fireEvent.error(screen.getByRole('img', { name: 'Portada de Libro de prueba' }));
    expect(screen.getByRole('img', { name: 'Portada no disponible para Libro de prueba' })).toBeVisible();
  });
});
