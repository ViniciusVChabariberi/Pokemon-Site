import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    Image,
    TouchableOpacity,
    ActivityIndicator,
    Modal,
    ScrollView,
} from 'react-native';
import { Colors, getColor } from '@/constants/colors';
import { Pokemon } from '@/@types/pokemon';
import { STATS_POOL, STAT_LABELS, getStatValue } from '@/constants/pokemon';
import { Styles } from './style';

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
            <View style={Styles.modalOverlay}>
                <View style={[Styles.modalContent, { borderColor: modalTheme.accent }]}>
                    <View style={Styles.modalHeader}>
                        {modalView !== 'detail' ? (
                            <TouchableOpacity onPress={() => setModalView('detail')} style={Styles.headerBackButton}>
                                <Text style={Styles.headerBackButtonText}>← Voltar</Text>
                            </TouchableOpacity>
                        ) : (
                            <Text style={Styles.modalTitle}>
                                {`#${pokemon.index}`}
                            </Text>
                        )}
                        <TouchableOpacity onPress={onClose} style={Styles.closeModalBtn}>
                            <Text style={Styles.closeModalBtnText}>✕</Text>
                        </TouchableOpacity>
                    </View>

                    {modalView === 'detail' && (
                        <ScrollView contentContainerStyle={Styles.modalScroll} showsVerticalScrollIndicator={false}>
                            <View style={Styles.modalDetailContainer}>
                                <Image
                                    source={{ uri: getPokemonImage(pokemon) }}
                                    style={Styles.modalLargeImage}
                                />
                                
                                {shinyIds.includes(pokemon.id) && (
                                    <View style={[Styles.shinyLabelBadge, { backgroundColor: modalTheme.accent }]}>
                                        <Text style={Styles.shinyLabelText}>✨ Shiny</Text>
                                    </View>
                                )}

                                <Text style={Styles.modalPokemonName}>{pokemon.nome}</Text>

                                <View style={Styles.modalTypes}>
                                    {pokemon.tipos.map((type) => {
                                        const typeTheme = Colors.types[type] || Colors.types['normal'];
                                        return (
                                            <View
                                                key={type}
                                                style={[
                                                    Styles.typeBadge,
                                                    {
                                                        backgroundColor: typeTheme.bg,
                                                        borderColor: typeTheme.accent,
                                                    }
                                                ]}
                                            >
                                                <Text style={[Styles.typeText, { color: typeTheme.accent }]}>
                                                    {type}
                                                </Text>
                                            </View>
                                        );
                                    })}
                                </View>

                                <View style={Styles.statsSection}>
                                    <Text style={Styles.statsSectionTitle}>Atributos</Text>
                                    {STATS_POOL.map((statKey) => {
                                        const value = getStatValue(pokemon, statKey);
                                        const pct = Math.min(100, (value / 150) * 100);
                                        return (
                                            <View key={statKey} style={Styles.statBarContainer}>
                                                <View style={Styles.statBarLabelRow}>
                                                    <Text style={Styles.statBarLabel}>{STAT_LABELS[statKey]}</Text>
                                                    <Text style={Styles.statBarValue}>{value}</Text>
                                                </View>
                                                <View style={Styles.statBarBg}>
                                                    <View
                                                        style={[
                                                            Styles.statBarFill,
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
                                        style={[Styles.actionButton, { backgroundColor: Colors.btnPrimary }]}
                                        onPress={() => setModalView('select_reservoir')}
                                    >
                                        <Text style={Styles.actionButtonText}>Substituir Pokémon</Text>
                                    </TouchableOpacity>
                                ) : (
                                    <TouchableOpacity
                                        style={[Styles.actionButton, { backgroundColor: modalTheme.accent }]}
                                        onPress={() => setModalView('select_slot')}
                                    >
                                        <Text style={[Styles.actionButtonText, { color: Colors.black }]}>Colocar no Time</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        </ScrollView>
                    )}

                    {modalView === 'select_slot' && (
                        <View style={Styles.selectViewContainer}>
                            <Text style={Styles.modalSubtitle}>
                                Substituir na posição:
                            </Text>
                            {isActionLoading ? (
                                <ActivityIndicator size="large" color={Colors.btnPrimary} style={{ marginTop: 40 }} />
                            ) : (
                                <ScrollView contentContainerStyle={Styles.slotsScroll} showsVerticalScrollIndicator={false}>
                                    {team.map((teamPkm, index) => {
                                        const teamPkmTheme = getColor(teamPkm.tipos);
                                        const isShiny = shinyIds.includes(teamPkm.id);
                                        return (
                                            <TouchableOpacity
                                                key={teamPkm.id}
                                                style={[
                                                    Styles.slotRow,
                                                    {
                                                        backgroundColor: teamPkmTheme.bg,
                                                        borderColor: teamPkmTheme.accent,
                                                    }
                                                ]}
                                                onPress={() => handleSwapByReservoir(teamPkm.id)}
                                            >
                                                <View style={Styles.slotRowLeft}>
                                                    <Text style={Styles.slotNumber}>Slot {index + 1}</Text>
                                                    <Image source={{ uri: getPokemonImage(teamPkm) }} style={Styles.slotImage} />
                                                    <Text style={Styles.slotName}>{teamPkm.nome}</Text>
                                                    {isShiny && <Text style={Styles.slotShinyStar}>✨</Text>}
                                                </View>
                                                <Text style={[Styles.slotSelectAction, { color: teamPkmTheme.accent }]}>Substituir</Text>
                                            </TouchableOpacity>
                                        );
                                    })}
                                </ScrollView>
                            )}
                        </View>
                    )}

                    {modalView === 'select_reservoir' && (
                        <View style={Styles.selectViewContainer}>
                            <Text style={Styles.modalSubtitle}>
                                Substituir {pokemon.nome.toUpperCase()} por:
                            </Text>
                            {isActionLoading ? (
                                <ActivityIndicator size="large" color={Colors.btnPrimary} style={{ marginTop: 40 }} />
                            ) : capturedReservoir.length === 0 ? (
                                <View style={Styles.modalEmptyState}>
                                    <Text style={Styles.modalEmptyText}>
                                        Você não possui Pokémons no reservatório para substituir.
                                    </Text>
                                </View>
                            ) : (
                                <ScrollView contentContainerStyle={Styles.modalScroll} showsVerticalScrollIndicator={false}>
                                    <View style={Styles.modalGrid}>
                                        {capturedReservoir.map((pkm) => {
                                            const pkmTheme = getColor(pkm.tipos);
                                            const isShiny = shinyIds.includes(pkm.id);
                                            return (
                                                <TouchableOpacity
                                                    key={`modal-${pkm.id}`}
                                                    style={[Styles.modalCard, { backgroundColor: pkmTheme.bg, borderColor: pkmTheme.accent }]}
                                                    onPress={() => handleSwapByActive(pkm.id)}
                                                >
                                                    {isShiny && <Text style={Styles.modalCardShinyStar}>✨</Text>}
                                                    <Image source={{ uri: getPokemonImage(pkm) }} style={Styles.modalCardImage} />
                                                    <Text style={Styles.modalCardName} numberOfLines={1}>{pkm.nome}</Text>
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
