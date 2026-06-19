import React, { useState, useCallback } from 'react';
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    ScrollView,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { useTeam } from '@/context/TeamContext';
import { Colors, getColor } from '@/constants/colors';
import { Pokemon } from '@/@types/pokemon';
import { useShinyList } from '@/hooks/useShinyList';
import { PokemonDetailModal } from '@/components/pokemon-detail-modal';

export default function Team() {
    const { team, capturedReservoir, isLoadingTeam, swapPokemon } = useTeam();
    const [shinyReloadTrigger, setShinyReloadTrigger] = useState(0);
    const { shinyIds, loadShinyIds } = useShinyList(shinyReloadTrigger);

    const [selectedPokemon, setSelectedPokemon] = useState<Pokemon | null>(null);
    const [isFromActiveTeam, setIsFromActiveTeam] = useState(false);
    const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);

    useFocusEffect(
        useCallback(() => {
            setShinyReloadTrigger(prev => prev + 1);
        }, [])
    );

    const getPokemonImage = (pokemon: Pokemon) => {
        const isShiny = shinyIds.includes(pokemon.id);
        return isShiny
            ? pokemon.imagem.replace('/official-artwork/', '/official-artwork/shiny/')
            : pokemon.imagem;
    };

    const handleOpenDetail = (pokemon: Pokemon, fromTeam: boolean) => {
        setSelectedPokemon(pokemon);
        setIsFromActiveTeam(fromTeam);
        setIsDetailModalVisible(true);
    };

    if (isLoadingTeam && team.length === 0) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color={Colors.btnPrimary} />
                <Text style={styles.loadingText}>Carregando Equipe...</Text>
            </View>
        );
    }

    return (
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <Text style={styles.title}>Meu Time</Text>
            <Text style={styles.subtitle}>{team.length} de 5 Pokémons Ativos</Text>

            <View style={styles.activeTeamGrid}>
                {team.map((pokemon) => {
                    const theme = getColor(pokemon.tipos);
                    const isShiny = shinyIds.includes(pokemon.id);
                    return (
                        <TouchableOpacity
                            key={pokemon.id}
                            style={[
                                styles.card,
                                {
                                    backgroundColor: theme.bg,
                                    borderColor: theme.accent,
                                }
                            ]}
                            onPress={() => handleOpenDetail(pokemon, true)}
                            activeOpacity={0.8}
                        >
                            {isShiny && <Text style={styles.cardShinyStar}>✨</Text>}
                            <Image source={{ uri: getPokemonImage(pokemon) }} style={styles.image} />
                            <Text style={styles.name} numberOfLines={1}>{pokemon.nome}</Text>
                            <Text style={styles.swapAction}>Ver Atributos</Text>
                        </TouchableOpacity>
                    );
                })}

                {Array.from({ length: Math.max(0, 5 - team.length) }).map((_, index) => (
                    <View key={`empty-${index}`} style={styles.emptyCard}>
                        <Text style={styles.emptyIcon}>⚪</Text>
                        <Text style={styles.emptyText}>Vazio</Text>
                    </View>
                ))}
            </View>

            <Text style={styles.sectionTitle}>Reservatório (Capturados)</Text>
            
            {capturedReservoir.length === 0 ? (
                <View style={styles.emptyReservoirBox}>
                    <Text style={styles.emptyReservoirText}>
                        Seu reservatório está vazio. Vença batalhas na Arena para capturar novos Pokémons!
                    </Text>
                </View>
            ) : (
                <View style={styles.reservoirGrid}>
                    {capturedReservoir.map((item) => {
                        const theme = getColor(item.tipos);
                        const isShiny = shinyIds.includes(item.id);
                        return (
                            <TouchableOpacity
                                key={`reservoir-${item.id}`}
                                style={[styles.reservoirCard, { backgroundColor: theme.bg, borderColor: Colors.whiteAlpha['12'] }]}
                                onPress={() => handleOpenDetail(item, false)}
                                activeOpacity={0.8}
                            >
                                {isShiny && <Text style={styles.reservoirShinyStar}>✨</Text>}
                                <Image source={{ uri: getPokemonImage(item) }} style={styles.reservoirImage} />
                                <Text style={styles.reservoirName} numberOfLines={1}>{item.nome}</Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            )}

            <PokemonDetailModal
                visible={isDetailModalVisible}
                onClose={() => setIsDetailModalVisible(false)}
                pokemon={selectedPokemon}
                isFromActiveTeam={isFromActiveTeam}
                team={team}
                capturedReservoir={capturedReservoir}
                shinyIds={shinyIds}
                onSwap={swapPokemon}
            />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    scrollView: {
        flex: 1,
        backgroundColor: Colors.background,
    },
    scrollContent: {
        paddingTop: 24,
        paddingHorizontal: 16,
        paddingBottom: 40,
    },
    centerContainer: {
        flex: 1,
        backgroundColor: Colors.background,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        color: Colors.white,
        marginTop: 12,
        fontSize: 16,
    },
    title: {
        color: Colors.btnPrimary,
        fontSize: 28,
        fontWeight: '900',
        textAlign: 'center',
        textTransform: 'uppercase',
    },
    subtitle: {
        color: Colors.whiteAlpha['40'],
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 20,
    },
    activeTeamGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: 8,
        marginBottom: 24,
    },
    card: {
        width: '48%',
        borderRadius: 16,
        borderWidth: 1.5,
        alignItems: 'center',
        padding: 12,
        marginBottom: 8,
        position: 'relative',
    },
    cardShinyStar: {
        position: 'absolute',
        top: 8,
        left: 8,
        fontSize: 14,
    },
    image: {
        width: 80,
        height: 80,
        resizeMode: 'contain',
    },
    name: {
        color: Colors.white,
        fontSize: 15,
        fontWeight: 'bold',
        textTransform: 'capitalize',
        marginTop: 4,
    },
    swapAction: {
        color: Colors.btnPrimary,
        fontSize: 10,
        fontWeight: '600',
        marginTop: 6,
        textTransform: 'uppercase',
    },
    emptyCard: {
        width: '48%',
        height: 140,
        backgroundColor: Colors.surfaceDeep,
        borderRadius: 16,
        borderWidth: 1.5,
        borderStyle: 'dashed',
        borderColor: Colors.whiteAlpha['12'],
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 8,
    },
    emptyIcon: {
        fontSize: 24,
        opacity: 0.3,
    },
    emptyText: {
        color: Colors.whiteAlpha['30'],
        fontSize: 12,
        marginTop: 4,
    },
    sectionTitle: {
        color: Colors.white,
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 12,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    emptyReservoirBox: {
        flex: 1,
        backgroundColor: Colors.surface,
        borderRadius: 16,
        padding: 24,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: Colors.whiteAlpha['06'],
        minHeight: 120,
    },
    emptyReservoirText: {
        color: Colors.whiteAlpha['40'],
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 20,
    },
    reservoirGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        width: '100%',
        paddingBottom: 24,
    },
    reservoirCard: {
        width: '31.3%',
        margin: '1%',
        borderRadius: 12,
        borderWidth: 1,
        padding: 8,
        alignItems: 'center',
        position: 'relative',
    },
    reservoirShinyStar: {
        position: 'absolute',
        top: 4,
        left: 4,
        fontSize: 10,
    },
    reservoirImage: {
        width: 50,
        height: 50,
        resizeMode: 'contain',
    },
    reservoirName: {
        color: Colors.white,
        fontSize: 11,
        textTransform: 'capitalize',
        marginTop: 4,
        fontWeight: '600',
    },
});