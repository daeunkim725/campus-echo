import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setToken, clearToken } from './apiClient';

describe('apiClient', () => {
    beforeEach(() => {
        // Clear localStorage before each test
        localStorage.clear();

        // Spy on localStorage methods to ensure they are called correctly
        vi.spyOn(Storage.prototype, 'setItem');
        vi.spyOn(Storage.prototype, 'removeItem');
    });

    describe('setToken', () => {
        it('should set the campus_echo_token in localStorage', () => {
            const testToken = 'test-token-123';

            setToken(testToken);

            expect(localStorage.setItem).toHaveBeenCalledWith('campus_echo_token', testToken);
            expect(localStorage.getItem('campus_echo_token')).toBe(testToken);
        });
    });

    describe('clearToken', () => {
        it('should remove the campus_echo_token from localStorage', () => {
            // First set a token
            const testToken = 'test-token-123';
            localStorage.setItem('campus_echo_token', testToken);
            expect(localStorage.getItem('campus_echo_token')).toBe(testToken);

            // Then clear it
            clearToken();

            expect(localStorage.removeItem).toHaveBeenCalledWith('campus_echo_token');
            expect(localStorage.getItem('campus_echo_token')).toBeNull();
        });
    });
});
