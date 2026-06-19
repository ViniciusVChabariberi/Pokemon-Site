import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    ActivityIndicator,
    Modal,
    ScrollView,
} from 'react-native';
import { Colors, getColor } from '@/constants/colors';
import { Pokemon } from '@/@types/pokemon';
import { STATS_POOL, STAT_LABELS, getStatValue } from '@/constants/pokemon';

interface PokemonDetailModalProps {
    visible: boolean;
    onClose: () => void;
    pokemon: Pokemon | null;
    isFromActiveTeam: boolean;
    team: Pokemon[];
    capturedReservoir: Pokemon[];
    shinyIds: number[];
    onSwap: (removedId: number, newId: number) => Promise<boolean>;
}

export function PokemonDetailModal({
    visible,
    onClose,
    pokemon,
    isFromActiveTeam,
    team,
    capturedReservoir,
    shinyIds,
    onSwap,
}: PokemonDetailModalProps) {
    const [modalView, setModalView] = useState<'detail' | 'select_slot' | 'select_reservoir'>('detail');
    const [isActionLoading, setIsActionLoading] = useState(false);

    useEffect(() => {
        if (visible) {
            setModalView('detail');
            setIsActionLoading(false);
        }
    }, [visible, pokemon]);

    if (!pokemon) return null;

    const modalTheme = getColor(pokemon.tipos);

    const getPokemonImage = (pkm: Pokemon) => {
        const isShiny = shinyIds.includes(pkm.id);
        return isShiny
            ? pkm.imagem.replace('/official-artwork/', '/official-artwork/shiny/')
            : pkm.imagem;
    };

    const handleSwapByActive = async (reservoirPkmId: number) => {
        setIsActionLoading(true);
        try {
            const success = await onSwap(pokemon.id, reservoirPkmId);
            if (success) {
                onClose();
            }
        } catch (error) {
            console.error('Erro ao substituir por ativo:', error);
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleSwapByReservoir = async (activePkmId: number) => {
        setIsActionLoading(true);
        try {
            const success = await onSwap(activePkmId, pokemon.id);
            if (success) {
                onClose();
            }
        } catch (error) {
            console.error('Erro ao substituir por reservatório:', error);
        } finally {
            setIsActionLoading(false);
        }
    };

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="slide"
            onRequestClose={onClose}
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
                                {`#${pokemon.index}`}
                            </Text>
                        )}
                        <TouchableOpacity onPress={onClose} style={styles.closeModalBtn}>
                            <Text style={styles.closeModalBtnText}>✕</Text>
                        </TouchableOpacity>
                    </View>

                    {modalView === 'detail' && (
                        <ScrollView contentContainerStyle={styles.modalScroll} showsVerticalScrollIndicator={false}>
                            <View style={styles.modalDetailContainer}>
                                <Image
                                    source={{ uri: getPokemonImage(pokemon) }}
                                    style={styles.modalLargeImage}
                                />
                                
                                {shinyIds.includes(pokemon.id) && (
                                    <View style={[styles.shinyLabelBadge, { backgroundColor: modalTheme.accent }]}>
                                        <Text style={styles.shinyLabelText}>✨ Shiny</Text>
                                    </View>
                                )}

                                <Text style={styles.modalPokemonName}>{pokemon.nome}</Text>

                                <View style={styles.modalTypes}>
                                    {pokemon.tipos.map((type) => {
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
                                        const value = getStatValue(pokemon, statKey);
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
                                Substituir {pokemon.nome.toUpperCase()} por:
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
                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
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
