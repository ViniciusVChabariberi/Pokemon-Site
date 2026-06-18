import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    FlatList,
    Image,
    TouchableOpacity,
    StyleSheet,
    ActivityIndicator,
    Modal,
    ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from 'expo-router';
import { useTeam } from '@/context/TeamContext';
import { Colors, getColor } from '@/constants/colors';
import { Pokemon } from '@/@types/pokemon';

export default function Team() {
    const { team, capturedReservoir, isLoadingTeam, swapPokemon } = useTeam();

    const [shinyIds, setShinyIds] = useState<number[]>([]);
    const [selectedPokemon, setSelectedPokemon] = useState<Pokemon | null>(null);
    const [isFromActiveTeam, setIsFromActiveTeam] = useState(false);
    const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
    const [modalView, setModalView] = useState<'detail' | 'select_slot' | 'select_reservoir'>('detail');
    const [isActionLoading, setIsActionLoading] = useState(false);

    const loadShinyIds = async () => {
        try {
            const stored = await AsyncStorage.getItem('@Team:shiny_list');
            if (stored) {
                setShinyIds(JSON.parse(stored));
            }
        } catch (e) {
            console.error('Erro ao ler shinies locais:', e);
        }
    };

    useFocusEffect(
        useCallback(() => {
            loadShinyIds();
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
        setModalView('detail');
        setIsDetailModalVisible(true);
    };

    const handleSwapByActive = async (reservoirPkmId: number) => {
        if (!selectedPokemon) return;
        setIsActionLoading(true);
        try {
            await swapPokemon(selectedPokemon.id, reservoirPkmId);
            setIsDetailModalVisible(false);
            setSelectedPokemon(null);
        } catch (error) {
            console.error(error);
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleSwapByReservoir = async (activePkmId: number) => {
        if (!selectedPokemon) return;
        setIsActionLoading(true);
        try {
            await swapPokemon(activePkmId, selectedPokemon.id);
            setIsDetailModalVisible(false);
            setSelectedPokemon(null);
        } catch (error) {
            console.error(error);
        } finally {
            setIsActionLoading(false);
        }
    };

    const STATS_POOL = ['hp', 'atk', 'def', 'spa', 'spd', 'speed'];
    const STAT_LABELS: Record<string, string> = {
        hp: 'HP',
        atk: 'ATK',
        def: 'DEF',
        spa: 'SP. ATK',
        spd: 'SP. DEF',
        speed: 'SPEED',
    };

    const getStatValue = (pokemon: Pokemon, statName: string): number => {
        const apiNameMap: Record<string, string> = {
            hp: 'hp',
            atk: 'attack',
            def: 'defense',
            spa: 'special-attack',
            spd: 'special-defense',
            speed: 'speed',
        };
        const mappedName = apiNameMap[statName] || statName;
        const statObj = pokemon.poderes?.find(p => p.nome === mappedName);
        return statObj ? statObj.forca : 50;
    };

    if (isLoadingTeam && team.length === 0) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color={Colors.btnPrimary} />
                <Text style={styles.loadingText}>Carregando Equipe...</Text>
            </View>
        );
    }

    const modalTheme = selectedPokemon ? getColor(selectedPokemon.tipos) : Colors.types['normal'];

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

            <Modal
                visible={isDetailModalVisible}
                transparent={true}
                animationType="slide"
                onRequestClose={() => setIsDetailModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={[styles.modalContent, { borderColor: modalTheme.accent }]}>
                        <View style={styles.modalHeader}>
                            {modalView !== 'detail' ? (
                                <TouchableOpacity onPress={() => setModalView('detail')} style={styles.headerBackButton}>
                                    <Text style={styles.headerBackButtonText}>← Voltar</Text>
                                </TouchableOpacity>
                            ) : (
                                <Text style={styles.modalTitle}>
                                    {selectedPokemon ? `#${selectedPokemon.index}` : 'Detalhes'}
                                </Text>
                            )}
                            <TouchableOpacity onPress={() => setIsDetailModalVisible(false)} style={styles.closeModalBtn}>
                                <Text style={styles.closeModalBtnText}>✕</Text>
                            </TouchableOpacity>
                        </View>

                        {selectedPokemon && (
                            <>
                                {modalView === 'detail' && (
                                    <ScrollView contentContainerStyle={styles.modalScroll} showsVerticalScrollIndicator={false}>
                                        <View style={styles.modalDetailContainer}>
                                            <Image
                                                source={{ uri: getPokemonImage(selectedPokemon) }}
                                                style={styles.modalLargeImage}
                                            />
                                            
                                            {shinyIds.includes(selectedPokemon.id) && (
                                                <View style={[styles.shinyLabelBadge, { backgroundColor: modalTheme.accent }]}>
                                                    <Text style={styles.shinyLabelText}>✨ Shiny</Text>
                                                </View>
                                            )}

                                            <Text style={styles.modalPokemonName}>{selectedPokemon.nome}</Text>

                                            <View style={styles.modalTypes}>
                                                {selectedPokemon.tipos.map((type) => {
                                                    const typeTheme = Colors.types[type] || Colors.types['normal'];
                                                    return (
                                                        <View
                                                            key={type}
                                                            style={[
                                                                styles.typeBadge,
                                                                {
                                                                    backgroundColor: typeTheme.bg,
                                                                    borderColor: typeTheme.accent,
                                                                }
                                                            ]}
                                                        >
                                                            <Text style={[styles.typeText, { color: typeTheme.accent }]}>
                                                                {type}
                                                            </Text>
                                                        </View>
                                                    );
                                                })}
                                            </View>

                                            <View style={styles.statsSection}>
                                                <Text style={styles.statsSectionTitle}>Atributos</Text>
                                                {STATS_POOL.map((statKey) => {
                                                    const value = getStatValue(selectedPokemon, statKey);
                                                    const pct = Math.min(100, (value / 150) * 100);
                                                    return (
                                                        <View key={statKey} style={styles.statBarContainer}>
                                                            <View style={styles.statBarLabelRow}>
                                                                <Text style={styles.statBarLabel}>{STAT_LABELS[statKey]}</Text>
                                                                <Text style={styles.statBarValue}>{value}</Text>
                                                            </View>
                                                            <View style={styles.statBarBg}>
                                                                <View
                                                                    style={[
                                                                        styles.statBarFill,
                                                                        {
                                                                            width: `${pct}%`,
                                                                            backgroundColor: modalTheme.accent,
                                                                        }
                                                                    ]}
                                                                />
                                                            </View>
                                                        </View>
                                                    );
                                                })}
                                            </View>

                                            {isActionLoading ? (
                                                <ActivityIndicator size="small" color={Colors.btnPrimary} style={{ marginTop: 20 }} />
                                            ) : isFromActiveTeam ? (
                                                <TouchableOpacity
                                                    style={[styles.actionButton, { backgroundColor: Colors.btnPrimary }]}
                                                    onPress={() => setModalView('select_reservoir')}
                                                >
                                                    <Text style={styles.actionButtonText}>Substituir Pokémon</Text>
                                                </TouchableOpacity>
                                            ) : (
                                                <TouchableOpacity
                                                    style={[styles.actionButton, { backgroundColor: modalTheme.accent }]}
                                                    onPress={() => setModalView('select_slot')}
                                                >
                                                    <Text style={[styles.actionButtonText, { color: Colors.black }]}>Colocar no Time</Text>
                                                </TouchableOpacity>
                                            )}
                                        </View>
                                    </ScrollView>
                                )}

                                {modalView === 'select_slot' && (
                                    <View style={styles.selectViewContainer}>
                                        <Text style={styles.modalSubtitle}>
                                            Substituir na posição:
                                        </Text>
                                        {isActionLoading ? (
                                            <ActivityIndicator size="large" color={Colors.btnPrimary} style={{ marginTop: 40 }} />
                                        ) : (
                                            <ScrollView contentContainerStyle={styles.slotsScroll} showsVerticalScrollIndicator={false}>
                                                {team.map((teamPkm, index) => {
                                                    const teamPkmTheme = getColor(teamPkm.tipos);
                                                    const isShiny = shinyIds.includes(teamPkm.id);
                                                    return (
                                                        <TouchableOpacity
                                                            key={teamPkm.id}
                                                            style={[
                                                                styles.slotRow,
                                                                {
                                                                    backgroundColor: teamPkmTheme.bg,
                                                                    borderColor: teamPkmTheme.accent,
                                                                }
                                                            ]}
                                                            onPress={() => handleSwapByReservoir(teamPkm.id)}
                                                        >
                                                            <View style={styles.slotRowLeft}>
                                                                <Text style={styles.slotNumber}>Slot {index + 1}</Text>
                                                                <Image source={{ uri: getPokemonImage(teamPkm) }} style={styles.slotImage} />
                                                                <Text style={styles.slotName}>{teamPkm.nome}</Text>
                                                                {isShiny && <Text style={styles.slotShinyStar}>✨</Text>}
                                                            </View>
                                                            <Text style={[styles.slotSelectAction, { color: teamPkmTheme.accent }]}>Substituir</Text>
                                                        </TouchableOpacity>
                                                    );
                                                })}
                                            </ScrollView>
                                        )}
                                    </View>
                                )}

                                {modalView === 'select_reservoir' && (
                                    <View style={styles.selectViewContainer}>
                                        <Text style={styles.modalSubtitle}>
                                            Substituir {selectedPokemon.nome.toUpperCase()} por:
                                        </Text>
                                        {isActionLoading ? (
                                            <ActivityIndicator size="large" color={Colors.btnPrimary} style={{ marginTop: 40 }} />
                                        ) : capturedReservoir.length === 0 ? (
                                            <View style={styles.modalEmptyState}>
                                                <Text style={styles.modalEmptyText}>
                                                    Você não possui Pokémons no reservatório para substituir.
                                                </Text>
                                            </View>
                                        ) : (
                                            <ScrollView contentContainerStyle={styles.modalScroll} showsVerticalScrollIndicator={false}>
                                                <View style={styles.modalGrid}>
                                                    {capturedReservoir.map((pkm) => {
                                                        const pkmTheme = getColor(pkm.tipos);
                                                        const isShiny = shinyIds.includes(pkm.id);
                                                        return (
                                                            <TouchableOpacity
                                                                key={`modal-${pkm.id}`}
                                                                style={[styles.modalCard, { backgroundColor: pkmTheme.bg, borderColor: pkmTheme.accent }]}
                                                                onPress={() => handleSwapByActive(pkm.id)}
                                                            >
                                                                {isShiny && <Text style={styles.modalCardShinyStar}>✨</Text>}
                                                                <Image source={{ uri: getPokemonImage(pkm) }} style={styles.modalCardImage} />
                                                                <Text style={styles.modalCardName} numberOfLines={1}>{pkm.nome}</Text>
                                                            </TouchableOpacity>
                                                        );
                                                    })}
                                                </View>
                                            </ScrollView>
                                        )}
                                    </View>
                                )}
                            </>
                        )}
                    </View>
                </View>
            </Modal>
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
    container: {
        flex: 1,
        backgroundColor: Colors.background,
        paddingTop: 24,
        paddingHorizontal: 16,
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
    reservoirList: {
        paddingBottom: 24,
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

    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.85)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        width: '100%',
        maxWidth: 440,
        maxHeight: '80%',
        flexShrink: 1,
        backgroundColor: Colors.surface,
        borderRadius: 20,
        borderWidth: 1.5,
        borderColor: Colors.primaryAlpha['30'],
        padding: 20,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottomWidth: 1,
        borderBottomColor: Colors.whiteAlpha['08'],
        paddingBottom: 12,
        marginBottom: 16,
    },
    modalTitle: {
        color: Colors.white,
        fontSize: 18,
        fontWeight: '900',
        textTransform: 'uppercase',
    },
    headerBackButton: {
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 6,
        backgroundColor: Colors.whiteAlpha['08'],
    },
    headerBackButtonText: {
        color: Colors.white,
        fontSize: 12,
        fontWeight: 'bold',
    },
    closeModalBtn: {
        padding: 4,
    },
    closeModalBtnText: {
        color: Colors.white,
        fontSize: 18,
    },
    modalSubtitle: {
        color: Colors.whiteAlpha['65'],
        fontSize: 14,
        marginBottom: 16,
    },
    modalHighlight: {
        color: Colors.btnPrimary,
        fontWeight: 'bold',
    },
    modalScroll: {
        paddingBottom: 16,
    },
    modalGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    modalCard: {
        width: '31%',
        borderRadius: 12,
        borderWidth: 1.5,
        padding: 8,
        alignItems: 'center',
        position: 'relative',
    },
    modalCardShinyStar: {
        position: 'absolute',
        top: 4,
        left: 4,
        fontSize: 10,
    },
    modalCardImage: {
        width: 60,
        height: 60,
        resizeMode: 'contain',
    },
    modalCardName: {
        color: Colors.white,
        fontSize: 11,
        fontWeight: '600',
        textTransform: 'capitalize',
        marginTop: 4,
    },
    modalEmptyState: {
        padding: 24,
        alignItems: 'center',
    },
    modalEmptyText: {
        color: Colors.whiteAlpha['40'],
        fontSize: 14,
        textAlign: 'center',
    },

    modalDetailContainer: {
        alignItems: 'center',
        paddingVertical: 10,
    },
    modalLargeImage: {
        width: 140,
        height: 140,
        resizeMode: 'contain',
        marginBottom: 10,
    },
    shinyLabelBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 10,
        marginBottom: 10,
        shadowColor: '#FFF',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 4,
        elevation: 2,
    },
    shinyLabelText: {
        color: Colors.black,
        fontSize: 12,
        fontWeight: 'bold',
    },
    modalPokemonName: {
        color: Colors.white,
        fontSize: 24,
        fontWeight: '900',
        textTransform: 'uppercase',
        marginBottom: 10,
        textAlign: 'center',
    },
    modalTypes: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: 20,
    },
    typeBadge: {
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
        borderWidth: 1.5,
    },
    typeText: {
        fontSize: 12,
        fontWeight: 'bold',
        textTransform: 'capitalize',
    },
    statsSection: {
        width: '100%',
        backgroundColor: Colors.surfaceDeep,
        borderRadius: 16,
        padding: 16,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: Colors.whiteAlpha['06'],
    },
    statsSectionTitle: {
        color: Colors.white,
        fontSize: 16,
        fontWeight: 'bold',
        textTransform: 'uppercase',
        marginBottom: 12,
        letterSpacing: 0.5,
    },
    statBarContainer: {
        marginBottom: 10,
        width: '100%',
    },
    statBarLabelRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 4,
    },
    statBarLabel: {
        color: Colors.whiteAlpha['50'],
        fontSize: 12,
        fontWeight: '600',
    },
    statBarValue: {
        color: Colors.white,
        fontSize: 12,
        fontWeight: 'bold',
    },
    statBarBg: {
        height: 6,
        backgroundColor: Colors.whiteAlpha['08'],
        borderRadius: 3,
        overflow: 'hidden',
        width: '100%',
    },
    statBarFill: {
        height: '100%',
        borderRadius: 3,
    },
    actionButton: {
        width: '100%',
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
    },
    actionButtonText: {
        color: Colors.white,
        fontSize: 16,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },

    selectViewContainer: {
        width: '100%',
        flexShrink: 1,
    },
    slotsScroll: {
        gap: 10,
        paddingVertical: 10,
    },
    slotRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 12,
        borderRadius: 16,
        borderWidth: 1.5,
        marginBottom: 8,
    },
    slotRowLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    slotNumber: {
        color: Colors.whiteAlpha['40'],
        fontSize: 12,
        fontWeight: 'bold',
    },
    slotImage: {
        width: 40,
        height: 40,
        resizeMode: 'contain',
    },
    slotName: {
        color: Colors.white,
        fontSize: 14,
        fontWeight: 'bold',
        textTransform: 'capitalize',
    },
    slotShinyStar: {
        fontSize: 12,
    },
    slotSelectAction: {
        fontSize: 12,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
});