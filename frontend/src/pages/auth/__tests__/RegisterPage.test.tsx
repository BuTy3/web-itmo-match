import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import authReducer from '../../../features/auth/model/authSlice';
import uiReducer from '../../../features/ui/model/uiSlice';
import { RegisterPage } from '../RegisterPage';
import { register } from '../../../shared/api/auth';

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
  ...(jest.requireActual('react-router-dom') as object),
  useNavigate: () => mockNavigate,
}));

jest.mock('../../../shared/api/auth', () => ({
  register: jest.fn(),
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
          <RegisterPage />
        </MemoryRouter>
      </Provider>,
    ),
  };
};

describe('RegisterPage', () => {
  beforeEach(() => {
    localStorage.clear();
    mockNavigate.mockClear();
    (register as jest.MockedFunction<typeof register>).mockReset();
  });

  it('shows validation error when passwords do not match', async () => {
    renderWithProviders();

    fireEvent.change(screen.getByLabelText('Никнейм'), {
      target: { value: 'user1' },
    });
    fireEvent.change(screen.getByLabelText('Пароль'), {
      target: { value: 'pass1' },
    });
    fireEvent.change(screen.getByLabelText('Повторите пароль'), {
      target: { value: 'pass2' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Зарегистрироваться' }));

    expect(await screen.findByText('Пароли не совпадают')).toBeInTheDocument();
  });

  it('registers and stores auth data', async () => {
    (register as jest.MockedFunction<typeof register>).mockResolvedValue({
      ok: true,
      token: 'token-456',
    });

    const { store } = renderWithProviders();

    fireEvent.change(screen.getByLabelText('Никнейм'), {
      target: { value: 'user2' },
    });
    fireEvent.change(screen.getByLabelText('Пароль'), {
      target: { value: 'pass2' },
    });
    fireEvent.change(screen.getByLabelText('Повторите пароль'), {
      target: { value: 'pass2' },
    });

    fireEvent.click(screen.getByRole('button', { name: 'Зарегистрироваться' }));

    await waitFor(() => {
      expect(register).toHaveBeenCalledWith({ login: 'user2', password: 'pass2' });
    });

    expect(store.getState().auth.accessToken).toBe('token-456');
    expect(localStorage.getItem('accessToken')).toBe('token-456');
    expect(localStorage.getItem('nickname')).toBe('user2');
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
