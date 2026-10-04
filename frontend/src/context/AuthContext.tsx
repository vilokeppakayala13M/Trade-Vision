"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface User {
    name: string;
    email: string;
    phone?: string;
    _id?: string;
    accessToken?: string;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    error: string | null;
    csrfToken: string | null;
    login: (email: string, password?: string, name?: string) => Promise<boolean>;
    register: (email: string, name: string, password?: string, phone?: string) => Promise<boolean>;
    logout: () => void;
    refreshToken: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [csrfToken, setCsrfToken] = useState<string | null>(null);
    const router = useRouter();

    const fetchCsrfToken = async () => {
        try {
            const res = await fetch('/api/auth/csrf');
            if (res.ok) {
                const data = await res.json();
                setCsrfToken(data.csrfToken);
                return data.csrfToken;
            }
        } catch (e) {
            console.error('Failed to fetch CSRF token:', e);
        }
        return null;
    };

    useEffect(() => {
        // Global fetch interceptor to automatically attach CSRF token to mutating relative API requests
        if (typeof window !== 'undefined') {
            const originalFetch = window.fetch;
            window.fetch = async (input, init) => {
                const method = init?.method?.toUpperCase() || 'GET';
                const isMutating = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method);
                
                let url = '';
                if (typeof input === 'string') {
                    url = input;
                } else if (input instanceof URL) {
                    url = input.pathname;
                } else if (input && typeof input === 'object' && 'url' in input) {
                    url = (input as Request).url;
                }

                const isLocalApi = url.startsWith('/api/') || url.startsWith('api/');
                const isCsrfExempt = url.includes('/api/auth/csrf') || url.includes('/api/quotes');

                if (isMutating && isLocalApi && !isCsrfExempt) {
                    let currentToken = csrfToken;
                    if (!currentToken) {
                        try {
                            const res = await originalFetch('/api/auth/csrf');
                            if (res.ok) {
                                const data = await res.json();
                                currentToken = data.csrfToken;
                                setCsrfToken(currentToken);
                            }
                        } catch (err) {
                            console.error('Failed to fetch CSRF token in fetch interceptor:', err);
                        }
                    }

                    if (currentToken) {
                        const newHeaders = new Headers(init?.headers);
                        newHeaders.set('X-CSRF-Token', currentToken);
                        init = { ...init, headers: newHeaders };
                    }
                }

                return originalFetch(input, init);
            };
        }
    }, [csrfToken]);

    const refreshToken = async (tokenOverride?: string | null) => {
        try {
            const token = tokenOverride || csrfToken;
            const headers: Record<string, string> = {};
            if (token) {
                headers['X-CSRF-Token'] = token;
            }
            const res = await fetch('/api/auth/refresh', { 
                method: 'POST',
                headers
            });
            if (res.ok) {
                const data = await res.json();
                if (data.success) {
                    setUser(data.data);
                    return true;
                }
            }
            setUser(null);
            return false;
        } catch (e) {
            setUser(null);
            return false;
        }
    };

    useEffect(() => {
        const initAuth = async () => {
            const token = await fetchCsrfToken();
            await refreshToken(token);
            setLoading(false);
        };
        initAuth();
    }, []);

    const login = async (email: string, password?: string, name?: string) => {
        setError(null);
        try {
            if (name && !password) {
                // If standard login bypassed, ignore for now in new secure system
                return false;
            }

            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || 'Login failed');
                return false;
            }

            setUser(data.data);
            router.push("/");
            return true;
        } catch (err: unknown) {
            const error = err as Error;
            setError(error.message || 'An error occurred');
            return false;
        }
    };

    const register = async (email: string, name: string, password?: string, phone?: string) => {
        setError(null);
        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, name, password, phone }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || 'Registration failed');
                return false;
            }

            // Do not auto-login, require email verification
            router.push("/login?registered=true");
            return true;
        } catch (err: unknown) {
            const error = err as Error;
            setError(error.message || 'An error occurred');
            return false;
        }
    };

    const logout = async () => {
        // Optional: call a logout API to clear the httpOnly cookie if implemented
        // For now, we clear the client state
        setUser(null);
        router.push("/login");
    };

    return (
        <AuthContext.Provider value={{ user, loading, error, csrfToken, login, register, logout, refreshToken }}>
            {!loading && children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
