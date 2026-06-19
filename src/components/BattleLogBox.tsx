import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { Colors } from '@/constants/colors';

interface BattleLogBoxProps {
    battleLog: string;
}

export function BattleLogBox({ battleLog }: BattleLogBoxProps) {
    return (
        <View style={styles.logBox}>
            <Text style={styles.logText}>{battleLog}</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    logBox: {
        backgroundColor: Colors.black,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: Colors.whiteAlpha['12'],
        padding: 16,
        minHeight: 70,
        justifyContent: 'center',
    },
    logText: {
        color: '#00FF00',
        fontSize: 13,
        fontFamily: Platform.OS === 'web' ? 'Courier New, monospace' : undefined,
        lineHeight: 18,
    },
});
