import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import authReducer from '../../../features/auth/model/authSlice';
import uiReducer from '../../../features/ui/model/uiSlice';
import { LoginPage } from '../LoginPage';
import { login } from '../../../shared/api/auth';

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...(jest.requireActual('react-router-dom') as object),
  useNavigate: () => mockNavigate,
}));

jest.mock('../../../shared/api/auth', () => ({
  login: jest.fn(),
}));

const renderWithProviders = () => {
  const store = configureStore({
    reducer: {
      auth: authReducer,
      ui: uiReducer,
    },
  });

  return {
    store,
    ...render(
      <Provider store={store}>
        <MemoryRouter>
          <LoginPage />
        </MemoryRouter>
      </Provider>,
    ),
  };
};

describe('LoginPage', () => {
  beforeEach(() => {
    localStorage.clear();
    mockNavigate.mockClear();
    (login as jest.MockedFunction<typeof login>).mockReset();
  });

  it('shows validation error when fields are empty', async () => {
    renderWithProviders();

    fireEvent.click(screen.getByRole('button', { name: 'Войти' }));

    expect(await screen.findByText('Заполните все поля')).toBeInTheDocument();
  });

  it('logs in and stores auth data', async () => {
    (login as jest.MockedFunction<typeof login>).mockResolvedValue({
      ok: true,
      token: 'token-123',
    });

    const { store } = renderWithProviders();

    fireEvent.change(screen.getByLabelText('Никнейм'), {
      target: { value: 'user1' },
    });
    fireEvent.change(screen.getByLabelText('Пароль'), {
      target: { value: 'pass1' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Войти' }));

    await waitFor(() => {
      expect(login).toHaveBeenCalledWith({ login: 'user1', password: 'pass1' });
    });

    expect(store.getState().auth.accessToken).toBe('token-123');
    expect(localStorage.getItem('accessToken')).toBe('token-123');
    expect(localStorage.getItem('nickname')).toBe('user1');
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });

  it('renders the problems link', () => {
    renderWithProviders();

    const link = screen.getByRole('link', {
      name: 'Если возникли проблемы, напишите сюда',
    });

    expect(link).toHaveAttribute(
      'href',
      'https://docs.google.com/forms/d/e/1FAIpQLSeIP1uebWz4RujMdUqtLVDX5pBTkmBfpwCqq3Sn3ZLL9h5c2A/viewform?usp=dialog',
    );
  });
});
