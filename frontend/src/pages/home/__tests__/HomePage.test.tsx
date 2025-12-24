import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import authReducer from '../../../features/auth/model/authSlice';
import uiReducer from '../../../features/ui/model/uiSlice';
import { HomePage } from '../HomePage';
import { getReadyCollections, searchRoom } from '../../../shared/api/home';

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...(jest.requireActual('react-router-dom') as object),
  useNavigate: () => mockNavigate,
}));

jest.mock('../../../shared/api/home', () => ({
  getReadyCollections: jest.fn(),
  searchRoom: jest.fn(),
}));

const renderWithProviders = () => {
  const store = configureStore({
    reducer: {
      auth: authReducer,
      ui: uiReducer,
    },
  });

  return render(
    <Provider store={store}>
      <MemoryRouter>
        <HomePage />
      </MemoryRouter>
    </Provider>,
  );
};

describe('HomePage', () => {
  beforeEach(() => {
    mockNavigate.mockClear();
    (getReadyCollections as jest.MockedFunction<typeof getReadyCollections>).mockResolvedValue({
      ok: true,
      collections: [
        {
          id: 1,
          url_image: null,
          type: 'UI',
          description: 'First collection',
          items: [],
        },
        {
          id: 2,
          url_image: null,
          type: 'Moodboard',
          description: 'Second collection',
          items: [{ item_id: 1, url_image: null, description: 'Item' }],
        },
      ],
    });
  });

  it('shows ready collections preview', async () => {
    renderWithProviders();

    expect(await screen.findByText('First collection')).toBeInTheDocument();
    expect(screen.getByText('Second collection')).toBeInTheDocument();
  });

  it('filters collections by type', async () => {
    renderWithProviders();

    await screen.findByText('First collection');

    fireEvent.change(screen.getByLabelText('Фильтр по типу'), {
      target: { value: 'UI' },
    });

    expect(screen.getByText('First collection')).toBeInTheDocument();
    expect(screen.queryByText('Second collection')).not.toBeInTheDocument();
  });

  it('validates room id before search', async () => {
    renderWithProviders();

    fireEvent.change(screen.getByPlaceholderText('Введите id'), {
      target: { value: '0' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Найти комнату' }));

    expect(
      await screen.findByText('Введите корректный id комнаты'),
    ).toBeInTheDocument();
  });

  it('redirects to room connect on success', async () => {
    (searchRoom as jest.MockedFunction<typeof searchRoom>).mockResolvedValue({
      ok: true,
      id_room: 12,
    });

    renderWithProviders();

    fireEvent.change(screen.getByPlaceholderText('Введите id'), {
      target: { value: '12' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Найти комнату' }));

    await waitFor(() => {
      expect(searchRoom).toHaveBeenCalledWith({ id: 12 });
    });

    expect(mockNavigate).toHaveBeenCalledWith('/rooms/connect/12');
  });
});
