import axios from 'axios';
import { createApi } from './httpClient';

const AUTH_API_BASE = process.env.EXPO_PUBLIC_AUTH_API_URL || 'http://localhost:8080';
const AWS_API_BASE = process.env.EXPO_PUBLIC_API_URL || 'https://lnh1dhp1mj.execute-api.us-east-1.amazonaws.com';

// Cliente HTTP para a API de Autenticação Local (Gera Token via Gateway)
const authApi = createApi(`${AUTH_API_BASE}/api`);

// Cliente HTTP para a API da AWS (Dados e Estatísticas do Pokémon)
const api = axios.create({
    baseURL: `${AWS_API_BASE}/api-pokemon/auth/v1`,
});

export type TokenResponse = {
    token: string;
    userId?: string;
};

export type RegistroRequest = {
    username: string;
    password: string;
    email?: string;
    cep?: string;
    roles?: string[];
};

export type AuthRequest = {
    username: string;
    password: string;
};

export type AuthResponse = {
    token: string;
    userId: string;
};

export type StatsResponse = {
    userId: string;
    username: string;
    level: number;
    vitorias: number;
    derrotas: number;
};

export const register = async (data: RegistroRequest): Promise<void> => {
    try {
        await authApi.post('/usuario', {
            ...data,
            roles: data.roles || ['USER']
        });
    } catch (error) {
        await api.post('/register', data);
    }
};

export const login = async (data: AuthRequest): Promise<TokenResponse> => {
    try {
        const response = await authApi.post('/login', data);
        return response.data;
    } catch (error) {
        const response = await api.post('/login', data);
        return response.data;
    }
};

export const getStats = async (userId: string): Promise<StatsResponse> => {
    const response = await api.get<StatsResponse>(`/stats/${userId}`);
    return response.data;
};

export const updateStats = async (
    userId: string,
    data: { username: string; level: number; vitorias: number; derrotas: number }
): Promise<any> => {
    const response = await api.put(`/stats/${userId}`, data);
    return response.data;
};
