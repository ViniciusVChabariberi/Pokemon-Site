import React from 'react';
import { View, Text } from 'react-native';
import { Colors } from '@/constants/colors';
import { Styles } from './style';

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
            Styles.alertContainer,
            {
                backgroundColor: themeColors.bg,
                borderColor: themeColors.border,
            }
        ]}>
            <Text style={[
                Styles.alertText,
                {
                    color: themeColors.text,
                }
            ]}>
                {message}
            </Text>
        </View>
    );
}
