import axios, { AxiosInstance } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

let onUnauthorizedCallback: (() => void) | null = null;

export function setUnauthorizedCallback(callback: () => void) {
    onUnauthorizedCallback = callback;
}

export const createApi = (baseURL: string): AxiosInstance => {
    const instance = axios.create({
        baseURL,
        headers: {
            'Content-Type': 'application/json',
        },
    });

    instance.interceptors.request.use(
        async (config) => {
            try {
                const token = await AsyncStorage.getItem('@Auth:token');
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                }
            } catch (error) {
                console.error('Erro ao buscar token no AsyncStorage:', error);
            }
            return config;
        },
        (error) => Promise.reject(error)
    );

    instance.interceptors.response.use(
        (response) => response,
        (error) => {
            if (error.response && error.response.status === 401) {
                console.warn('Acesso não autorizado (401). Executando logout...');
                if (onUnauthorizedCallback) {
                    onUnauthorizedCallback();
                }
            }
            return Promise.reject(error);
        }
    );

    return instance;
};

export default createApi;
