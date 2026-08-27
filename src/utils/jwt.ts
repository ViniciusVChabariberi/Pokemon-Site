export interface JwtPayload {
    sub?: string;
    userId?: string;
    username?: string;
    exp?: number;
    iat?: number;
    [key: string]: any;
}

/**
 * Decodifica o payload de um JWT em formato Base64.
 */
export function decodeJwtPayload(token: string): JwtPayload | null {
    try {
        if (!token || typeof token !== 'string') return null;

        const parts = token.split('.');
        if (parts.length !== 3) return null;

        let base64Url = parts[1];
        if (!base64Url) return null;

        // Converter Base64Url para formato Base64 padrão
        let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');

        // Adicionar padding '=' se necessário
        const pad = base64.length % 4;
        if (pad) {
            base64 += '='.repeat(4 - pad);
        }

        // Decodificar Base64 para UTF-8 string usando atob fallback seguro
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        );

        return JSON.parse(jsonPayload);
    } catch (error) {
        console.error('Erro ao decodificar token JWT:', error);
        return null;
    }
}

/**
 * Verifica se um token JWT expirou em relação ao tempo atual.
 * Retorna true se expirado ou se não contiver a propriedade 'exp'.
 */
export function isTokenExpired(token: string): boolean {
    const payload = decodeJwtPayload(token);
    if (!payload || !payload.exp) {
        // Se o token for inválido ou não possuir campo exp, consideramos inválido/expirado
        return false;
    }

    const currentTimeInSeconds = Math.floor(Date.now() / 1000);
    return payload.exp < currentTimeInSeconds;
}
