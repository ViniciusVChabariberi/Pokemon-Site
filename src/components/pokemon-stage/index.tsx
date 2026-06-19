import React from 'react';
import { View, Text, Image } from 'react-native';
import { Pokemon } from '@/@types/pokemon';
import { STATS_POOL, STAT_LABELS, getStatValue } from '@/constants/pokemon';
import { Styles } from './style';

interface PokemonStageProps {
    pokemon: Pokemon;
    imageUri: string;
    isWinner: boolean;
    selectedStat: string;
    activeIndex: number;
}

export function PokemonStage({
    pokemon,
    imageUri,
    isWinner,
    selectedStat,
    activeIndex,
}: PokemonStageProps) {
    return (
        <View style={Styles.pokemonStage}>
            {imageUri ? (
                <Image source={{ uri: imageUri }} style={Styles.pokemonImage} />
            ) : null}
            <Text style={Styles.pokemonName}>{pokemon.nome}</Text>
            {isWinner && <Text style={Styles.winnerBadge}>👑 Ganhou</Text>}

            <View style={Styles.statsList}>
                {STATS_POOL.map((statKey, index) => {
                    const val = getStatValue(pokemon, statKey);
                    const isSelected = selectedStat === statKey;
                    const isBlinking = activeIndex === index;
                    return (
                        <View key={`stat-${statKey}`} style={[
                            Styles.statItem,
                            isSelected && Styles.statItemHighlight,
                            isBlinking && Styles.statItemBlinking
                        ]}>
                            <Text style={[Styles.statName, isSelected && Styles.statHighlightText]}>
                                {STAT_LABELS[statKey]}
                            </Text>
                            <Text style={[Styles.statValue, isSelected && Styles.statHighlightText]}>
                                {val}
                            </Text>
                        </View>
                    );
                })}
            </View>
        </View>
    );
}
