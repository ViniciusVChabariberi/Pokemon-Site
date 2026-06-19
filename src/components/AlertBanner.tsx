import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/colors';

interface AlertBannerProps {
    visible: boolean;
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
}

export function AlertBanner({ visible, message, type }: AlertBannerProps) {
    if (!visible || !message) return null;

    const themeColors = Colors.semantic[type] || Colors.semantic.info;

    return (
        <View style={[
            styles.alertContainer,
            {
                backgroundColor: themeColors.bg,
                borderColor: themeColors.border,
            }
        ]}>
            <Text style={[
                styles.alertText,
                {
                    color: themeColors.text,
                }
            ]}>
                {message}
            </Text>
        </View>
    );
}

const styles = StyleSheet.create({
    alertContainer: {
        padding: 12,
        borderRadius: 8,
        borderWidth: 1,
        marginBottom: 8,
        width: '100%',
    },
    alertText: {
        fontSize: 13,
        fontWeight: '600',
        textAlign: 'center',
    },
});
