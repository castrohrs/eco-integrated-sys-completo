
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '../types';
import * as apiService from '../services/apiService';
import { supabase } from '../services/supabaseClient';

interface AuthState {
    currentUser: User | null;
    users: User[];
    login: (matricula: string) => Promise<boolean>;
    logout: () => void;
    addUser: (user: Omit<User, 'id'>) => void;
    updateUser: (user: User) => void;
    deleteUser: (userId: string) => void;
}

const AuthContext = createContext<AuthState | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [users, setUsers] = useState<User[]>([]);

    useEffect(() => {
        const initializeAuth = async () => {
            const user = await apiService.getCurrentUser();
            if (user) {
                setCurrentUser(user);
            }
            const allUsers = await apiService.getUsers();
            setUsers(allUsers);
        };
        initializeAuth();

        // Listen for Supabase Auth changes
        if (supabase) {
            const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
                if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
                    const user = await apiService.getCurrentUser();
                    setCurrentUser(user);
                } else if (event === 'SIGNED_OUT') {
                    setCurrentUser(null);
                }
            });
            return () => subscription.unsubscribe();
        }
    }, []);

    const login = async (matricula: string): Promise<boolean> => {
        const user = await apiService.loginUser(matricula);
        if (user) {
            // Note: In a real Supabase production app, you would use supabase.auth.signInWithPassword.
            // For this phase, we keep matricula logic and sync to profile.
            setCurrentUser(user);
            localStorage.setItem('ecolog-lastLogin', JSON.stringify({ user: user.name, timestamp: Date.now() }));
            return true;
        }
        return false;
    };

    const logout = async () => {
        await apiService.logoutUser();
        setCurrentUser(null);
        window.location.reload();
    };
    
    const addUser = async (userData: Omit<User, 'id'>) => {
        const updatedUsers = await apiService.addUser(userData);
        setUsers(updatedUsers);
    };

    const updateUser = async (updatedUser: User) => {
        const updatedUsers = await apiService.updateUser(updatedUser);
        setUsers(updatedUsers);
        if (currentUser?.id === updatedUser.id) setCurrentUser(updatedUser);
    };

    const deleteUser = async (userId: string) => {
        const updatedUsers = await apiService.deleteUser(userId);
        setUsers(updatedUsers);
    };

    const value = { currentUser, users, login, logout, addUser, updateUser, deleteUser };
    return React.createElement(AuthContext.Provider, { value }, children);
};

export const useAuth = (): AuthState => {
    const context = useContext(AuthContext);
    if (context === undefined) throw new Error('useAuth must be used within an AuthProvider');
    return context;
};
