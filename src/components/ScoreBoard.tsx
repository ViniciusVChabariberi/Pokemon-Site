import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '@/constants/colors';

interface ScoreBoardProps {
    playerScore: number;
    opponentScore: number;
}

export function ScoreBoard({ playerScore, opponentScore }: ScoreBoardProps) {
    return (
        <View style={styles.scoreBoard}>
            <View style={styles.scoreBox}>
                <Text style={styles.scoreLabel}>Seu Time</Text>
                <Text style={styles.scoreValue}>{playerScore}</Text>
            </View>
            <Text style={styles.vsText}>VS</Text>
            <View style={styles.scoreBox}>
                <Text style={styles.scoreLabel}>Oponente</Text>
                <Text style={styles.scoreValue}>{opponentScore}</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    scoreBoard: {
        flexDirection: 'row',
        backgroundColor: Colors.surface,
        borderRadius: 16,
        borderWidth: 1.5,
        borderColor: Colors.primaryAlpha['30'],
        padding: 16,
        alignItems: 'center',
        justifyContent: 'space-around',
    },
    scoreBox: {
        alignItems: 'center',
    },
    scoreLabel: {
        color: Colors.whiteAlpha['50'],
        fontSize: 11,
        fontWeight: '800',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    scoreValue: {
        color: Colors.white,
        fontSize: 32,
        fontWeight: '900',
        marginTop: 4,
    },
    vsText: {
        color: Colors.btnPrimary,
        fontSize: 20,
        fontWeight: '900',
    },
});
