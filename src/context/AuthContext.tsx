"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";

interface User {
    name: string;
    email: string;
    phone?: string;
    _id?: string;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    error: string | null;
    login: (email: string, password?: string, name?: string) => Promise<boolean>;
    register: (email: string, name: string, password?: string, phone?: string) => Promise<boolean>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const router = useRouter();

    useEffect(() => {
        // Check local storage on mount
        const savedUser = localStorage.getItem("user");
        if (savedUser) {
            try {
                // eslint-disable-next-line react-hooks/set-state-in-effect
                setUser(JSON.parse(savedUser));
            } catch (e) {
                console.error("Failed to parse user", e);
            }
        }
        setLoading(false);
    }, []);

    const login = async (email: string, password?: string, name?: string) => {
        setError(null);
        try {
            // If it's a social login (no password provided, but name is), we might need a different flow
            // For now, if name is provided, we assume it's Google login simulation from frontend
            if (name && !password) {
                // Simulate Google Login or simple login without password for demo
                // Ideally, Google Login should token exchange with backend
                // For this specific 'data not stored' request, we focus on the form submission
                const newUser = { email, name };
                setUser(newUser);
                localStorage.setItem("user", JSON.stringify(newUser));
                router.push("/");
                return true;
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
            localStorage.setItem("user", JSON.stringify(data.data));
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
            // For Google Login via register (if reused) or simple bypass
            if (!password) {
                return login(email, undefined, name);
            }

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

            // Auto login after register
            setUser(data.data);
            localStorage.setItem("user", JSON.stringify(data.data));
            router.push("/");
            return true;

        } catch (err: unknown) {
            const error = err as Error;
            setError(error.message || 'An error occurred');
            return false;
        }
    };

    const logout = () => {
        setUser(null);
        localStorage.removeItem("user");
        router.push("/login"); // Fixed redirection to login page
    };

    return (
        <AuthContext.Provider value={{ user, loading, error, login, register, logout }}>
            {children}
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
