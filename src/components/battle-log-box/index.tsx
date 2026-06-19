import React from 'react';
import { View, Text } from 'react-native';
import { Styles } from './style';

interface BattleLogBoxProps {
    battleLog: string;
}

export function BattleLogBox({ battleLog }: BattleLogBoxProps) {
    return (
        <View style={Styles.logBox}>
            <Text style={Styles.logText}>{battleLog}</Text>
        </View>
    );
}
