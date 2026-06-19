import React from 'react';
import {
    View,
    Text,
    Platform,
    KeyboardAvoidingView,
    ScrollView,
} from 'react-native';
import { Pokeball } from '@/components/pokeball';
import { Styles } from './style';

interface AuthLayoutProps {
    subtitle: string;
    cardTitle: string;
    children: React.ReactNode;
}

export function AuthLayout({ subtitle, cardTitle, children }: AuthLayoutProps) {
    return (
        <KeyboardAvoidingView
            style={Styles.flex}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
            <ScrollView
                contentContainerStyle={Styles.container}
                keyboardShouldPersistTaps="handled">
                {Platform.OS === 'web' && (
                    <>
                        <View style={Styles.orbBlue} />
                        <View style={Styles.orbOrange} />
                    </>
                )}

                <View style={Styles.header}>
                    <View style={Styles.logoRow}>
                        <Pokeball size={Platform.OS === 'web' ? 28 : 22} />
                        <Text style={Styles.logoText}>PokeBattle</Text>
                    </View>
                    <Text style={Styles.subtitle}>{subtitle}</Text>
                </View>

                <View style={Styles.card}>
                    <Text style={Styles.cardTitle}>{cardTitle}</Text>
                    {children}
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}
