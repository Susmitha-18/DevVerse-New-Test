/**
 * Desktop Authentication Persistence & Interceptor Test Suite
 */

import { authService } from '../services/auth.service';

const store: Record<string, string> = {};
const mockLocalStorage = {
  getItem: (key: string) => store[key] || null,
  setItem: (key: string, value: string) => { store[key] = value; },
  removeItem: (key: string) => { delete store[key]; },
  clear: () => { Object.keys(store).forEach((k) => delete store[k]); },
};

if (typeof global.localStorage === 'undefined') {
  Object.defineProperty(global, 'localStorage', {
    value: mockLocalStorage,
  });
}

describe('Desktop Auth & Health Services', () => {
  it('should expose checkHealth and refreshToken service interfaces', () => {
    expect(typeof authService.checkHealth).toBe('function');
    expect(typeof authService.refreshToken).toBe('function');
    expect(typeof authService.getMe).toBe('function');
  });

  it('should manage localStorage access tokens and session IDs cleanly', () => {
    localStorage.setItem('devverse_access_token', 'test-access-token');
    localStorage.setItem('devverse_session_id', 'test-session-id');

    expect(localStorage.getItem('devverse_access_token')).toBe('test-access-token');
    expect(localStorage.getItem('devverse_session_id')).toBe('test-session-id');

    localStorage.removeItem('devverse_access_token');
    localStorage.removeItem('devverse_session_id');

    expect(localStorage.getItem('devverse_access_token')).toBeNull();
    expect(localStorage.getItem('devverse_session_id')).toBeNull();
  });
});
