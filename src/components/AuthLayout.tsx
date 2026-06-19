import React from 'react';
import {
    View,
    Text,
    StyleSheet,
    Platform,
    KeyboardAvoidingView,
    ScrollView,
} from 'react-native';
import { Pokeball } from '@/components/pokeball';
import { Colors } from '@/constants/colors';

interface AuthLayoutProps {
    subtitle: string;
    cardTitle: string;
    children: React.ReactNode;
}

export function AuthLayout({ subtitle, cardTitle, children }: AuthLayoutProps) {
    return (
        <KeyboardAvoidingView
            style={styles.flex}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <ScrollView
                contentContainerStyle={styles.container}
                keyboardShouldPersistTaps="handled">
                {Platform.OS === 'web' && (
                    <>
                        <View style={styles.orbBlue} />
                        <View style={styles.orbOrange} />
                    </>
                )}

                <View style={styles.header}>
                    <View style={styles.logoRow}>
                        <Pokeball size={Platform.OS === 'web' ? 28 : 22} />
                        <Text style={styles.logoText}>PokeBattle</Text>
                    </View>
                    <Text style={styles.subtitle}>{subtitle}</Text>
                </View>

                <View style={styles.card}>
                    <Text style={styles.cardTitle}>{cardTitle}</Text>
                    {children}
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const isWeb = Platform.OS === 'web';

const styles = StyleSheet.create({
    flex: { flex: 1, backgroundColor: Colors.background },
    container: {
        flexGrow: 1,
        backgroundColor: Colors.background,
        justifyContent: 'center',
        alignItems: 'center',
        padding: isWeb ? 32 : 24,
        minHeight: '100%' as any,
        gap: 24,
        position: 'relative',
    },
    orbBlue: {
        position: 'absolute',
        width: 500,
        height: 500,
        borderRadius: 250,
        backgroundColor: Colors.semantic.info.border,
        top: -200,
        left: -200,
        opacity: 0.06,
        ...Platform.select({ web: { filter: 'blur(80px)' } as any }),
    },
    orbOrange: {
        position: 'absolute',
        width: 400,
        height: 400,
        borderRadius: 200,
        backgroundColor: Colors.btnPrimary,
        bottom: -100,
        right: -150,
        opacity: 0.06,
        ...Platform.select({ web: { filter: 'blur(80px)' } as any }),
    },
    header: {
        alignItems: 'center',
        gap: 8,
        width: '100%',
        maxWidth: isWeb ? 440 : undefined,
    },
    logoRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 4,
    },
    logoText: {
        color: Colors.white,
        fontSize: isWeb ? 22 : 18,
        fontWeight: '900',
        letterSpacing: 2,
        fontFamily: Platform.OS === 'web' ? "'Press Start 2P', monospace" : undefined,
    },
    subtitle: {
        color: Colors.whiteAlpha['40'],
        fontSize: isWeb ? 13 : 12,
        textAlign: 'center',
        lineHeight: 20,
        maxWidth: 300,
    },
    card: {
        width: '100%',
        maxWidth: isWeb ? 440 : undefined,
        backgroundColor: Colors.surface,
        borderRadius: isWeb ? 20 : 16,
        borderWidth: 1.5,
        borderColor: Colors.primaryAlpha['30'],
        padding: isWeb ? 28 : 20,
        gap: 16,
        ...Platform.select({
            web: { boxShadow: '0 0 40px rgba(255,107,53,0.15), 0 0 80px rgba(0,0,0,0.6)' } as any,
            default: {
                shadowColor: Colors.btnPrimary,
                shadowOffset: { width: 0, height: 4 },
                shadowOpacity: 0.2,
                shadowRadius: 12,
                elevation: 8,
            },
        }),
    },
    cardTitle: {
        color: Colors.btnPrimary,
        fontSize: isWeb ? 11 : 10,
        fontWeight: '800',
        letterSpacing: 3,
        textTransform: 'uppercase',
        marginBottom: 4,
        fontFamily: Platform.OS === 'web' ? "'Press Start 2P', monospace" : undefined,
    },
});
