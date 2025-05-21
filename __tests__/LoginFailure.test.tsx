import { act, renderHook } from '@testing-library/react';
import { AuthProvider, useAuth } from '@/src/contexts/AuthContext';
import { signIn } from 'next-auth/react';

jest.mock('next-auth/react', () => ({
  ...jest.requireActual('next-auth/react'),
  signIn: jest.fn(),
  signOut: jest.fn(),
  useSession: jest.fn(() => ({ data: null, status: 'unauthenticated' })),
}));

describe('AuthProvider', () => {
  it('handles login failure', async () => {
    (signIn as jest.Mock).mockResolvedValue({ error: 'Invalid credentials' });

    const { result } = renderHook(() => useAuth(), {
      wrapper: AuthProvider,
    });

    await act(async () => {
      await expect(
        result.current.login('fail@example.com', 'wrongpassword')
      ).rejects.toThrow('Invalid credentials');
    });
  });
});
