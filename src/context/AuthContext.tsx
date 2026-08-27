import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { isTokenExpired } from '@/utils/jwt';
import { setUnauthorizedCallback } from '@/integration/httpClient';
import { login, register, getStats, updateStats as updateStatsApi } from '@/integration/authIntegration';

export interface UserData {
    userId: string;
    username: string;
    level: number;
    vitorias: number;
    derrotas: number;
}

type AuthContextData = {
    isAuthenticated: boolean;
    token: string | null;
    user: string | null;
    userData: UserData | null;
    isLoading: boolean;
    signIn: (username: string, password: string) => Promise<boolean>;
    signUp: (username: string, password: string) => Promise<{ success: boolean; message?: string }>;
    signOut: () => Promise<void>;
    updateStats: (vitorias: number, derrotas: number, level: number) => Promise<boolean>;
};

const AuthContext = createContext<AuthContextData>({} as AuthContextData);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [token, setToken] = useState<string | null>(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [user, setUser] = useState<string | null>(null);
    const [userData, setUserData] = useState<UserData | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const signOut = useCallback(async () => {
        setToken(null);
        setUser(null);
        setUserData(null);
        setIsAuthenticated(false);
        try {
            await AsyncStorage.multiRemove(['@Auth:token', '@Auth:user_data']);
        } catch (error) {
            console.error('Erro ao remover dados de autenticação:', error);
        }
    }, []);

    useEffect(() => {
        setUnauthorizedCallback(signOut);
    }, [signOut]);

    useEffect(() => {
        async function loadStorageData() {
            try {
                const storedToken = await AsyncStorage.getItem('@Auth:token');
                const storedUserData = await AsyncStorage.getItem('@Auth:user_data');

                if (storedToken) {
                    if (isTokenExpired(storedToken)) {
                        console.warn('Token JWT expirado no carregamento local. Efetuando logout...');
                        await signOut();
                    } else if (storedUserData) {
                        const parsed = JSON.parse(storedUserData) as UserData;
                        setToken(storedToken);
                        setUserData(parsed);
                        setUser(parsed.username);
                        setIsAuthenticated(true);
                    }
                } else if (storedUserData) {
                    const parsed = JSON.parse(storedUserData) as UserData;
                    setUserData(parsed);
                    setUser(parsed.username);
                    setIsAuthenticated(true);
                }
            } catch (error) {
                console.error('Erro ao carregar dados de autenticação do storage:', error);
            } finally {
                setIsLoading(false);
            }
        }
        loadStorageData();
    }, [signOut]);

    async function signIn(username: string, password: string): Promise<boolean> {
        try {
            const tokenRes = await login({ username: username.trim(), password: password.trim() });

            const authToken = tokenRes.token || '';
            const userId = tokenRes.userId;

            if (authToken || userId) {
                if (authToken) {
                    setToken(authToken);
                    await AsyncStorage.setItem('@Auth:token', authToken);
                }

                const effectiveUserId = userId || username.trim();
                let fullUserData: UserData;

                try {
                    const statsData = await getStats(effectiveUserId);
                    fullUserData = {
                        userId: statsData.userId || effectiveUserId,
                        username: statsData.username || username.trim(),
                        level: statsData.level ?? 1,
                        vitorias: statsData.vitorias ?? 0,
                        derrotas: statsData.derrotas ?? 0,
                    };
                } catch (err) {
                    fullUserData = {
                        userId: effectiveUserId,
                        username: username.trim(),
                        level: 1,
                        vitorias: 0,
                        derrotas: 0,
                    };
                }

                setUserData(fullUserData);
                setUser(fullUserData.username);
                setIsAuthenticated(true);

                await AsyncStorage.setItem('@Auth:user_data', JSON.stringify(fullUserData));
                return true;
            }
            return false;
        } catch (error) {
            console.error('Erro ao fazer login:', error);
            return false;
        }
    }

    async function signUp(username: string, password: string): Promise<{ success: boolean; message?: string }> {
        try {
            await register({ username: username.trim(), password: password.trim() });
            return { success: true };
        } catch (error: any) {
            console.error('Erro ao cadastrar:', error);
            const errMsg = error.response?.data?.message || 'Erro de conexão com o servidor.';
            return { success: false, message: errMsg };
        }
    }

    async function updateStats(vitorias: number, derrotas: number, level: number): Promise<boolean> {
        if (!userData) return false;
        try {
            await updateStatsApi(userData.userId, {
                username: userData.username,
                level,
                vitorias,
                derrotas,
            });

            const updatedData: UserData = {
                ...userData,
                level,
                vitorias,
                derrotas,
            };
            setUserData(updatedData);
            await AsyncStorage.setItem('@Auth:user_data', JSON.stringify(updatedData));
            return true;
        } catch (error) {
            console.error('Erro ao atualizar estatísticas:', error);
            return false;
        }
    }

    return (
        <AuthContext.Provider
            value={{
                isAuthenticated,
                token,
                user,
                userData,
                signIn,
                signUp,
                signOut,
                updateStats,
                isLoading,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);