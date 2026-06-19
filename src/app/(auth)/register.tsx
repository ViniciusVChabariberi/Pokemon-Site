import { useState } from 'react';
import { router } from 'expo-router';
import { useAuth } from '@/context/AuthContext';
import { StyleSheet, TouchableOpacity, View, Text } from 'react-native';

import Button from '@/components/button';
import { Input } from '@/components/input';
import { Colors } from '@/constants/colors';
import { AuthLayout } from '@/components/AuthLayout';
import { AlertBanner } from '@/components/AlertBanner';
import { PokeballLoading } from '@/components/pokeball-loading';

export default function Register() {
    const [name, setName] = useState<string>('');
    const [senha, setSenha] = useState<string>('');
    const [confirmarSenha, setConfirmarSenha] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);

    const [isAlertVisible, setIsAlertVisible] = useState(false);
    const [alertData, setAlertData] = useState({
        title: '',
        message: '',
        type: 'error' as 'success' | 'error' | 'warning' | 'info',
    });

    const { signUp } = useAuth();

    async function handleRegister() {
        if (!name.trim() || !senha.trim() || !confirmarSenha.trim()) {
            setAlertData({
                title: 'Campos obrigatórios',
                message: 'Por favor, preencha todos os campos.',
                type: 'warning',
            });
            setIsAlertVisible(true);
            return;
        }

        if (senha !== confirmarSenha) {
            setAlertData({
                title: 'Senhas divergentes',
                message: 'A confirmação de senha não confere.',
                type: 'error',
            });
            setIsAlertVisible(true);
            return;
        }

        setIsLoading(true);
        setIsAlertVisible(false);
        const result = await signUp(name, senha);

        setIsLoading(false);
        if (result.success) {
            setAlertData({
                title: 'Sucesso',
                message: 'Usuário cadastrado com sucesso! Redirecionando para login...',
                type: 'success',
            });
            setIsAlertVisible(true);
            setTimeout(() => {
                router.replace('/');
            }, 2000);
        } else {
            setAlertData({
                title: 'Erro no cadastro',
                message: result.message || 'Não foi possível cadastrar o usuário.',
                type: 'error',
            });
            setIsAlertVisible(true);
        }
    }

    if (isLoading) {
        return <PokeballLoading />;
    }

    return (
        <AuthLayout
            subtitle="Cadastre-se para iniciar a sua jornada Pokémon"
            cardTitle="Novo Cadastro"
        >
            <AlertBanner
                visible={isAlertVisible}
                message={alertData.message}
                type={alertData.type}
            />

            <View style={styles.fieldGroup}>
                <Text style={styles.label}>Nome de Usuário</Text>
                <Input
                    placeholder="Escolha seu nome de treinador"
                    onChangeText={setName}
                    value={name}
                    autoCorrect={false}
                />
            </View>

            <View style={styles.fieldGroup}>
                <Text style={styles.label}>Senha</Text>
                <Input
                    placeholder="Crie uma senha"
                    secureTextEntry
                    onChangeText={setSenha}
                    value={senha}
                />
            </View>

            <View style={styles.fieldGroup}>
                <Text style={styles.label}>Confirmar Senha</Text>
                <Input
                    placeholder="Confirme sua senha"
                    secureTextEntry
                    onChangeText={setConfirmarSenha}
                    value={confirmarSenha}
                />
            </View>

            <Button title="Cadastrar" onPress={handleRegister} style={{ marginTop: 8 }} />

            <TouchableOpacity onPress={() => router.push('/')} style={styles.loginLink}>
                <Text style={styles.loginText}>Já tem uma conta? Faça Login</Text>
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
    loginLink: {
        marginTop: 16,
        alignItems: 'center',
    },
    loginText: {
        color: Colors.whiteAlpha['40'],
        fontSize: 13,
        textDecorationLine: 'underline',
    },
});
