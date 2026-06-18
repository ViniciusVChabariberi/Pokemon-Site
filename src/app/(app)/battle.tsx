import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    ActivityIndicator,
    ScrollView,
    Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuth } from '@/context/AuthContext';
import { useTeam } from '@/context/TeamContext';
import { getPokemon } from '@/integration/pokemonIntegration';
import { Pokemon } from '@/@types/pokemon';
import { Colors, getColor } from '@/constants/colors';
import Button from '@/components/button';

const STATS_POOL = ['hp', 'atk', 'def', 'spa', 'spd', 'speed'];
const STAT_LABELS: Record<string, string> = {
    hp: 'HP',
    atk: 'ATK',
    def: 'DEF',
    spa: 'SP. ATK',
    spd: 'SP. DEF',
    speed: 'SPEED',
};

export default function Battle() {
    const { userData, updateStats } = useAuth();
    const { team, capturedReservoir, capturePokemon } = useTeam();

    const [allPokemons, setAllPokemons] = useState<Pokemon[]>([]);
    const [loading, setLoading] = useState(true);
    const [gameState, setGameState] = useState<'idle' | 'playing' | 'round_resolved' | 'finished'>('idle');
    const [shinyIds, setShinyIds] = useState<number[]>([]);

    const [opponentTeam, setOpponentTeam] = useState<Pokemon[]>([]);

    const [currentRound, setCurrentRound] = useState(0);
    const [playerScore, setPlayerScore] = useState(0);
    const [opponentScore, setOpponentScore] = useState(0);

    const [playerSelectedStat, setPlayerSelectedStat] = useState<string>('');
    const [opponentSelectedStat, setOpponentSelectedStat] = useState<string>('');

    const [playerStatValue, setPlayerStatValue] = useState<number>(0);
    const [opponentStatValue, setOpponentStatValue] = useState<number>(0);
    const [roundWinner, setRoundWinner] = useState<'player' | 'opponent' | 'tie' | null>(null);

    const [playerActiveIndex, setPlayerActiveIndex] = useState<number>(-1);
    const [opponentActiveIndex, setOpponentActiveIndex] = useState<number>(-1);

    const [rouletteText, setRouletteText] = useState('Escolhendo Atributos...');
    const [isSpinning, setIsSpinning] = useState(false);
    const [battleLog, setBattleLog] = useState('');
    const [rewardPokemon, setRewardPokemon] = useState<Pokemon | null>(null);

    useEffect(() => {
        async function fetchPokemons() {
            try {
                const data = await getPokemon(151);
                setAllPokemons(data);
            } catch (error) {
                console.error('Erro ao carregar pokemons para batalha:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchPokemons();
    }, []);

    useEffect(() => {
        async function loadShinyIds() {
            try {
                const stored = await AsyncStorage.getItem('@Team:shiny_list');
                if (stored) {
                    setShinyIds(JSON.parse(stored));
                }
            } catch (e) {
                console.error('Erro ao ler shinies locais na Arena:', e);
            }
        }
        loadShinyIds();
    }, [gameState]);

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
        const statObj = pokemon.poderes.find(p => p.nome === mappedName);
        return statObj ? statObj.forca : 50;
    };

    const startMatch = () => {
        if (team.length === 0) return;

        const opponents: Pokemon[] = [];
        for (let i = 0; i < 5; i++) {
            const randomIndex = Math.floor(Math.random() * allPokemons.length);
            opponents.push(allPokemons[randomIndex]);
        }

        setOpponentTeam(opponents);
        setCurrentRound(0);
        setPlayerScore(0);
        setOpponentScore(0);
        setRewardPokemon(null);
        setBattleLog('Uma nova batalha começou! Prepare seu time!');
        setGameState('playing');
        triggerRoundBattle(0, opponents);
    };

    const triggerRoundBattle = (roundIdx: number, opponents: Pokemon[]) => {
        const playerPkm = team[roundIdx];
        const opponentPkm = opponents[roundIdx];

        setIsSpinning(true);
        setRoundWinner(null);
        setPlayerSelectedStat('');
        setOpponentSelectedStat('');
        setPlayerActiveIndex(-1);
        setOpponentActiveIndex(-1);
        setGameState('playing');

        let counter = 0;
        const interval = setInterval(() => {
            const playerIdx = counter % STATS_POOL.length;
            const opponentIdx = (counter + 3) % STATS_POOL.length;

            setPlayerActiveIndex(playerIdx);
            setOpponentActiveIndex(opponentIdx);

            setRouletteText(`🎲 Sorteando: ${STAT_LABELS[STATS_POOL[playerIdx]]} vs ${STAT_LABELS[STATS_POOL[opponentIdx]]}`);
            counter++;

            if (counter > 15) {
                clearInterval(interval);
                setIsSpinning(false);

                const pStat = STATS_POOL[Math.floor(Math.random() * STATS_POOL.length)];
                const oStat = STATS_POOL[Math.floor(Math.random() * STATS_POOL.length)];

                setPlayerActiveIndex(STATS_POOL.indexOf(pStat));
                setOpponentActiveIndex(STATS_POOL.indexOf(oStat));

                setPlayerSelectedStat(pStat);
                setOpponentSelectedStat(oStat);
                setRouletteText(`🎯 Sorteado: ${STAT_LABELS[pStat]} vs ${STAT_LABELS[oStat]}`);

                const pValue = getStatValue(playerPkm, pStat);
                const oValue = getStatValue(opponentPkm, oStat);

                setPlayerStatValue(pValue);
                setOpponentStatValue(oValue);

                let winner: 'player' | 'opponent' | 'tie' = 'tie';
                if (pValue > oValue) {
                    winner = 'player';
                } else if (pValue < oValue) {
                    winner = 'opponent';
                } else {
                    winner = 'player';
                }

                setRoundWinner(winner);

                let logMsg = '';
                if (winner === 'player') {
                    setPlayerScore(prev => prev + 1);
                    logMsg = `Seu ${playerPkm.nome.toUpperCase()} venceu o ${opponentPkm.nome.toUpperCase()}! Seu ${STAT_LABELS[pStat]} (${pValue}) foi maior que o ${STAT_LABELS[oStat]} (${oValue}) do oponente!`;
                } else {
                    setOpponentScore(prev => prev + 1);
                    logMsg = `O ${opponentPkm.nome.toUpperCase()} oponente venceu! O ${STAT_LABELS[oStat]} (${oValue}) do oponente foi maior que o seu ${STAT_LABELS[pStat]} (${pValue})!`;
                }

                setBattleLog(logMsg);
                setGameState('round_resolved');
            }
        }, 150);
    };

    const handleNextRound = async () => {
        const nextRoundIdx = currentRound + 1;
        const newPlayerScore = playerScore;
        const newOpponentScore = opponentScore;

        if (newPlayerScore >= 3 || newOpponentScore >= 3 || nextRoundIdx >= 5) {
            setGameState('finished');
            const userWon = newPlayerScore > newOpponentScore;

            if (userWon && userData) {
                setBattleLog('🏆 PARABÉNS! Você venceu a partida!');
                const currentIds = new Set([
                    ...team.map(p => p.id),
                    ...capturedReservoir.map(p => p.id)
                ]);

                const availableIds = Array.from({ length: 151 }, (_, i) => i + 1)
                    .filter(id => !currentIds.has(id));

                if (availableIds.length > 0) {
                    const randomIndex = Math.floor(Math.random() * availableIds.length);
                    const randomRewardId = availableIds[randomIndex];
                    const rewardPkm = allPokemons.find(p => p.id === randomRewardId);

                    if (rewardPkm) {
                        const isShinyRoll = Math.random() < 0.10;
                        if (isShinyRoll) {
                            try {
                                const stored = await AsyncStorage.getItem('@Team:shiny_list');
                                let currentShinies: number[] = stored ? JSON.parse(stored) : [];
                                if (!currentShinies.includes(randomRewardId)) {
                                    currentShinies.push(randomRewardId);
                                    await AsyncStorage.setItem('@Team:shiny_list', JSON.stringify(currentShinies));
                                }
                            } catch (e) {
                                console.error('Erro ao salvar shiny no AsyncStorage:', e);
                            }
                        }

                        setRewardPokemon({
                            ...rewardPkm,
                            isShiny: isShinyRoll,
                        });
                        await capturePokemon(randomRewardId);
                    }
                } else {
                    setRewardPokemon(null);
                    setBattleLog('🏆 PARABÉNS! Você venceu a partida! No entanto, você já possui todos os 151 Pokémons disponíveis.');
                }

                const wins = userData.vitorias + 1;
                const losses = userData.derrotas;
                const newLevel = 1 + Math.floor(wins / 5);
                await updateStats(wins, losses, newLevel);
            } else if (userData) {
                setBattleLog('💀 DERROTA! O oponente venceu esta partida.');
                const wins = userData.vitorias;
                const losses = userData.derrotas + 1;
                await updateStats(wins, losses, userData.level);
            }
        } else {
            setCurrentRound(nextRoundIdx);
            triggerRoundBattle(nextRoundIdx, opponentTeam);
        }
    };

    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color={Colors.btnPrimary} />
                <Text style={styles.loadingText}>Preparando Arena...</Text>
            </View>
        );
    }

    if (team.length < 5) {
        return (
            <View style={styles.centerContainer}>
                <Text style={styles.errorText}>Você precisa de 5 Pokémons na equipe para batalhar.</Text>
                <Text style={styles.subErrorText}>Vá para a tela "Meu Time" e ajuste sua equipe.</Text>
            </View>
        );
    }

    return (
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
            <Text style={styles.title}>Arena de Batalha</Text>

            {gameState === 'idle' ? (
                <View style={styles.idleContainer}>
                    <Text style={styles.idleSubtitle}>
                        Desafie treinadores virtuais em um embate de 5 contra 5!
                    </Text>
                    <Image
                        source={{ uri: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/384.png' }}
                        style={styles.introImage}
                    />
                    <Button title="Iniciar Partida" onPress={startMatch} style={styles.startButton} />
                </View>
            ) : gameState === 'finished' ? (
                <View style={styles.finishedContainer}>
                    <Text style={[styles.resultTitle, playerScore > opponentScore ? styles.winColor : styles.lossColor]}>
                        {playerScore > opponentScore ? '🏆 VITÓRIA!' : '💀 DERROTA!'}
                    </Text>

                    <Text style={styles.scoreBoardText}>
                        Placar Final: {playerScore} - {opponentScore}
                    </Text>

                    {rewardPokemon && (() => {
                        const isShiny = rewardPokemon.isShiny;
                        const imageUrl = (isShiny && rewardPokemon.imagemShiny)
                            ? rewardPokemon.imagemShiny
                            : rewardPokemon.imagem;
                        const rewardTheme = getColor(rewardPokemon.tipos);
                        return (
                            <View style={[
                                styles.rewardCard,
                                {
                                    backgroundColor: rewardTheme.bg,
                                    borderColor: rewardTheme.accent,
                                    shadowColor: rewardTheme.accent,
                                    shadowOffset: { width: 0, height: 0 },
                                    shadowOpacity: 0.8,
                                    shadowRadius: 20,
                                    elevation: 10,
                                }
                            ]}>
                                <Text style={[styles.rewardTitle, { color: rewardTheme.accent }]}>
                                    {isShiny ? '✨ SHINY CAPTURADO!' : '🎉 Pokémon Capturado!'}
                                </Text>
                                <Image source={{ uri: imageUrl }} style={styles.rewardImage} />
                                <Text style={styles.rewardName}>{rewardPokemon.nome}</Text>
                                <Text style={styles.rewardDescription}>Adicionado ao seu reservatório.</Text>
                            </View>
                        );
                    })()}

                    <Button title="Batalhar Novamente" onPress={startMatch} style={styles.startButton} />
                </View>
            ) : (
                <View style={styles.battleArea}>
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

                    <View style={styles.arenaRow}>
                        <View style={styles.pokemonStage}>
                            <Image
                                source={{
                                    uri: (team[currentRound] && shinyIds.includes(team[currentRound].id))
                                        ? team[currentRound].imagem.replace('/official-artwork/', '/official-artwork/shiny/')
                                        : team[currentRound].imagem
                                }}
                                style={styles.pokemonImage}
                            />
                            <Text style={styles.pokemonName}>{team[currentRound].nome}</Text>
                            {roundWinner === 'player' && <Text style={styles.winnerBadge}>👑 Ganhou</Text>}

                            <View style={styles.statsList}>
                                {STATS_POOL.map((statKey, index) => {
                                    const val = getStatValue(team[currentRound], statKey);
                                    const isSelected = playerSelectedStat === statKey;
                                    const isBlinking = playerActiveIndex === index;
                                    return (
                                        <View key={`p-${statKey}`} style={[
                                            styles.statItem,
                                            isSelected && styles.statItemHighlight,
                                            isBlinking && styles.statItemBlinking
                                        ]}>
                                            <Text style={[styles.statName, isSelected && styles.statHighlightText]}>
                                                {STAT_LABELS[statKey]}
                                            </Text>
                                            <Text style={[styles.statValue, isSelected && styles.statHighlightText]}>
                                                {val}
                                            </Text>
                                        </View>
                                    );
                                })}
                            </View>
                        </View>

                        <View style={styles.pokemonStage}>
                            <Image source={{ uri: opponentTeam[currentRound].imagem }} style={styles.pokemonImage} />
                            <Text style={styles.pokemonName}>{opponentTeam[currentRound].nome}</Text>
                            {roundWinner === 'opponent' && <Text style={styles.winnerBadge}>👑 Ganhou</Text>}

                            <View style={styles.statsList}>
                                {STATS_POOL.map((statKey, index) => {
                                    const val = getStatValue(opponentTeam[currentRound], statKey);
                                    const isSelected = opponentSelectedStat === statKey;
                                    const isBlinking = opponentActiveIndex === index;
                                    return (
                                        <View key={`o-${statKey}`} style={[
                                            styles.statItem,
                                            isSelected && styles.statItemHighlight,
                                            isBlinking && styles.statItemBlinking
                                        ]}>
                                            <Text style={[styles.statName, isSelected && styles.statHighlightText]}>
                                                {STAT_LABELS[statKey]}
                                            </Text>
                                            <Text style={[styles.statValue, isSelected && styles.statHighlightText]}>
                                                {val}
                                            </Text>
                                        </View>
                                    );
                                })}
                            </View>
                        </View>
                    </View>

                    <View style={styles.rouletteBox}>
                        <Text style={[styles.rouletteText, isSpinning ? styles.spinning : styles.selectedStatText]}>
                            {rouletteText}
                        </Text>

                        {gameState === 'round_resolved' && (
                            <View style={styles.statComparison}>
                                <Text style={styles.comparisonText}>
                                    Seu {STAT_LABELS[playerSelectedStat]} (<Text style={styles.statCompareVal}>{playerStatValue}</Text>) vs Oponente {STAT_LABELS[opponentSelectedStat]} (<Text style={styles.statCompareVal}>{opponentStatValue}</Text>)
                                </Text>
                            </View>
                        )}
                    </View>

                    <View style={styles.logBox}>
                        <Text style={styles.logText}>{battleLog}</Text>
                    </View>

                    {gameState === 'round_resolved' && (
                        <Button
                            title={
                                (playerScore >= 3 || opponentScore >= 3 || currentRound >= 4)
                                    ? 'Finalizar Partida'
                                    : 'Próxima Batalha'
                            }
                            onPress={handleNextRound}
                            style={styles.actionBtn}
                        />
                    )}
                </View>
            )}
        </ScrollView>
    );
}

const isWeb = Platform.OS === 'web';

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        backgroundColor: Colors.background,
        padding: 24,
        alignItems: 'center',
    },
    centerContainer: {
        flex: 1,
        backgroundColor: Colors.background,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 24,
    },
    title: {
        color: Colors.btnPrimary,
        fontSize: 24,
        fontWeight: '900',
        letterSpacing: 2,
        textTransform: 'uppercase',
        marginBottom: 24,
        textAlign: 'center',
        fontFamily: isWeb ? "'Press Start 2P', monospace" : undefined,
    },
    loadingText: {
        color: Colors.white,
        marginTop: 12,
        fontSize: 16,
    },
    errorText: {
        color: Colors.semantic.error.text,
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 8,
    },
    subErrorText: {
        color: Colors.whiteAlpha['40'],
        fontSize: 14,
        textAlign: 'center',
    },

    idleContainer: {
        alignItems: 'center',
        gap: 24,
        marginTop: 20,
        maxWidth: 440,
    },
    idleSubtitle: {
        color: Colors.whiteAlpha['50'],
        fontSize: 14,
        textAlign: 'center',
        lineHeight: 22,
    },
    introImage: {
        width: 200,
        height: 200,
        resizeMode: 'contain',
    },
    startButton: {
        width: 250,
        marginTop: 8,
    },

    battleArea: {
        width: '100%',
        maxWidth: 600,
        gap: 20,
    },
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
    arenaRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 16,
    },
    pokemonStage: {
        flex: 1,
        backgroundColor: Colors.surface,
        borderRadius: 18,
        borderWidth: 1.5,
        borderColor: Colors.whiteAlpha['12'],
        padding: 12,
        alignItems: 'center',
        position: 'relative',
    },
    pokemonImage: {
        width: 100,
        height: 100,
        resizeMode: 'contain',
    },
    pokemonName: {
        color: Colors.white,
        fontSize: 16,
        fontWeight: 'bold',
        textTransform: 'capitalize',
        marginTop: 4,
        marginBottom: 8,
    },
    winnerBadge: {
        position: 'absolute',
        top: -10,
        backgroundColor: Colors.game.win,
        color: Colors.black,
        fontSize: 10,
        fontWeight: '900',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 12,
        textTransform: 'uppercase',
    },

    statsList: {
        width: '100%',
        marginTop: 8,
        gap: 4,
    },
    statItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 4,
        paddingHorizontal: 8,
        borderRadius: 6,
        backgroundColor: Colors.whiteAlpha['05'],
        borderWidth: 1,
        borderColor: 'transparent',
    },
    statItemHighlight: {
        backgroundColor: Colors.primaryAlpha['18'],
        borderColor: Colors.btnPrimary,
    },
    statItemBlinking: {
        backgroundColor: Colors.whiteAlpha['12'],
        borderColor: Colors.white,
    },
    statName: {
        color: Colors.whiteAlpha['50'],
        fontSize: 11,
        fontWeight: '600',
        textTransform: 'uppercase',
    },
    statValue: {
        color: Colors.white,
        fontSize: 11,
        fontWeight: '700',
    },
    statHighlightText: {
        color: Colors.btnPrimary,
        fontWeight: 'bold',
    },

    rouletteBox: {
        backgroundColor: Colors.surfaceDeep,
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: Colors.primaryAlpha['25'],
        padding: 16,
        alignItems: 'center',
    },
    rouletteText: {
        fontSize: 15,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    spinning: {
        color: Colors.white,
    },
    selectedStatText: {
        color: Colors.btnPrimary,
    },
    statComparison: {
        marginTop: 6,
    },
    comparisonText: {
        color: Colors.whiteAlpha['65'],
        fontSize: 13,
    },
    statCompareVal: {
        color: Colors.white,
        fontWeight: 'bold',
    },

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
    actionBtn: {
        width: '100%',
    },

    finishedContainer: {
        alignItems: 'center',
        gap: 20,
        marginTop: 20,
        width: '100%',
        maxWidth: 440,
    },
    resultTitle: {
        fontSize: 28,
        fontWeight: '900',
        letterSpacing: 2,
        fontFamily: isWeb ? "'Press Start 2P', monospace" : undefined,
    },
    winColor: {
        color: Colors.game.win,
    },
    lossColor: {
        color: Colors.game.loss,
    },
    scoreBoardText: {
        color: Colors.white,
        fontSize: 20,
        fontWeight: 'bold',
    },
    rewardCard: {
        width: '100%',
        backgroundColor: Colors.surface,
        borderWidth: 1.5,
        borderColor: Colors.game.win,
        borderRadius: 18,
        padding: 20,
        alignItems: 'center',
        gap: 8,
    },
    rewardTitle: {
        color: Colors.game.win,
        fontSize: 16,
        fontWeight: 'bold',
        textTransform: 'uppercase',
    },
    rewardImage: {
        width: 120,
        height: 120,
        resizeMode: 'contain',
    },
    rewardName: {
        color: Colors.white,
        fontSize: 20,
        fontWeight: 'bold',
        textTransform: 'capitalize',
    },
    rewardDescription: {
        color: Colors.whiteAlpha['45'],
        fontSize: 12,
    },
});
