import React from 'react';
import { View, Text } from 'react-native';
import { Styles } from './style';

interface ScoreBoardProps {
    playerScore: number;
    opponentScore: number;
}

export function ScoreBoard({ playerScore, opponentScore }: ScoreBoardProps) {
    return (
        <View style={Styles.scoreBoard}>
            <View style={Styles.scoreBox}>
                <Text style={Styles.scoreLabel}>Seu Time</Text>
                <Text style={Styles.scoreValue}>{playerScore}</Text>
            </View>
            <Text style={Styles.vsText}>VS</Text>
            <View style={Styles.scoreBox}>
                <Text style={Styles.scoreLabel}>Oponente</Text>
                <Text style={Styles.scoreValue}>{opponentScore}</Text>
            </View>
        </View>
    );
}
