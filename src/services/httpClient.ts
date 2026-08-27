import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE = process.env.EXPO_PUBLIC_API_URL || 'https://lnh1dhp1mj.execute-api.us-east-1.amazonaws.com/api-pokemon';

export const httpClient = axios.create({
    baseURL: API_BASE,
    headers: {
        'Content-Type': 'application/json',
    },
});

let onUnauthorizedCallback: (() => void) | null = null;

/**
 * Registra um callback para ser executado quando a API retornar 401 Unauthorized (ex: token expirado ou acesso revogado).
 */
export function setUnauthorizedCallback(callback: () => void) {
    onUnauthorizedCallback = callback;
}

// Request Interceptor: Anexa o Bearer token armazenado em todas as requisições
httpClient.interceptors.request.use(
    async (config) => {
        try {
            const token = await AsyncStorage.getItem('@Auth:token');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        } catch (error) {
            console.error('Erro ao recuperar token do AsyncStorage:', error);
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response Interceptor: Trata 401 Unauthorized (token expirado ou mensalidade revogada)
httpClient.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            console.warn('Acesso não autorizado (401). Revogando sessão do usuário...');
            if (onUnauthorizedCallback) {
                onUnauthorizedCallback();
            }
        }
        return Promise.reject(error);
    }
);

export default httpClient;
