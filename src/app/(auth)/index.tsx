import { useState } from 'react';
import { router } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { StyleSheet, TouchableOpacity, View, Text } from 'react-native';

import Button from '@/components/button';
import { Input } from '@/components/input';
import { Colors } from '@/constants/colors';
import { AuthLayout } from '@/components/auth-layout';
import { AlertBanner } from '@/components/alert-banner';
import { PokeballLoading } from '@/components/pokeball-loading';

export default function Index() {
    const [name, setName] = useState<string>('');
    const [senha, setSenha] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);

    const [isAlertVisible, setIsAlertVisible] = useState(false);
    const [alertData, setAlertData] = useState({
        title: '',
        message: '',
        type: 'error' as 'success' | 'error' | 'warning' | 'info',
    });

    const { signIn, signOut } = useAuth();

    async function validateCredentials() {
        if (!name.trim() || !senha.trim()) {
            setAlertData({
                title: 'Campos obrigatórios',
                message: 'Por favor, preencha o nome e a senha.',
                type: 'warning',
            });
            setIsAlertVisible(true);
            return;
        }

        setIsLoading(true);
        setIsAlertVisible(false);
        const success = await signIn(name, senha);

        if (success) {
            router.push('/pokedex');
        } else {
            setIsLoading(false);
            setAlertData({
                title: 'Acesso negado',
                message: 'Nome ou senha incorretos. Tente novamente.',
                type: 'error',
            });
            setIsAlertVisible(true);
            await signOut();
        }
    }

    if (isLoading) {
        return <PokeballLoading />;
    }

    return (
        <AuthLayout
            subtitle="Participe de batalhas épicas entre pokémons"
            cardTitle="Autenticação"
        >
            <AlertBanner
                visible={isAlertVisible}
                message={alertData.message}
                type={alertData.type}
            />

            <View style={styles.fieldGroup}>
                <Text style={styles.label}>Nome</Text>
                <Input
                    placeholder="Insira seu nome de usuário"
                    onChangeText={setName}
                    value={name}
                    autoCorrect={false}
                />
            </View>

            <View style={styles.fieldGroup}>
                <Text style={styles.label}>Senha</Text>
                <Input
                    placeholder="Insira sua senha"
                    secureTextEntry
                    onChangeText={setSenha}
                    value={senha}
                />
            </View>

            <Button title="Entrar" onPress={validateCredentials} style={{ marginTop: 8 }} />

            <TouchableOpacity onPress={() => router.push('/register')} style={styles.registerLink}>
                <Text style={styles.registerText}>Não tem uma conta? Cadastre-se</Text>
            </TouchableOpacity>
        </AuthLayout>
    );
}

const styles = StyleSheet.create({
    fieldGroup: { gap: 6 },
    label: {
        color: Colors.whiteAlpha['50'],
        fontSize: 12,
        fontWeight: '700',
        letterSpacing: 1,
        textTransform: 'uppercase',
    },
    registerLink: {
        marginTop: 16,
        alignItems: 'center',
    },
    registerText: {
        color: Colors.whiteAlpha['40'],
        fontSize: 13,
        textDecorationLine: 'underline',
    },
});