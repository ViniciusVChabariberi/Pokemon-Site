import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
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
import { STATS_POOL, STAT_LABELS } from '@/constants/pokemon';
import { useShinyList } from '@/hooks/useShinyList';
import { ScoreBoard } from '@/components/score-board';
import { BattleLogBox } from '@/components/battle-log-box';
import { PokemonStage } from '@/components/pokemon-stage';

export default function Battle() {
    const { userData, updateStats } = useAuth();
    const { team, capturedReservoir, capturePokemon } = useTeam();

    const [allPokemons, setAllPokemons] = useState<Pokemon[]>([]);
    const [loading, setLoading] = useState(true);
    const [gameState, setGameState] = useState<'idle' | 'playing' | 'round_resolved' | 'finished'>('idle');
    const { shinyIds } = useShinyList(gameState);

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
                    winner = 'tie';
                }

                setRoundWinner(winner);

                let logMsg = '';
                if (winner === 'player') {
                    setPlayerScore(prev => prev + 1);
                    logMsg = `Seu ${playerPkm.nome.toUpperCase()} venceu o ${opponentPkm.nome.toUpperCase()}! Seu ${STAT_LABELS[pStat]} (${pValue}) foi maior que o ${STAT_LABELS[oStat]} (${oValue}) do oponente!`;
                } else if (winner === 'opponent') {
                    setOpponentScore(prev => prev + 1);
                    logMsg = `O ${opponentPkm.nome.toUpperCase()} oponente venceu! O ${STAT_LABELS[oStat]} (${oValue}) do oponente foi maior que o seu ${STAT_LABELS[pStat]} (${pValue})!`;
                } else {
                    logMsg = `Empate nesta rodada! Seu ${playerPkm.nome.toUpperCase()} (${STAT_LABELS[pStat]}: ${pValue}) empatou com o ${opponentPkm.nome.toUpperCase()} do oponente (${STAT_LABELS[oStat]}: ${oValue})!`;
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

            if (newPlayerScore > newOpponentScore) {
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

                if (userData) {
                    const wins = userData.vitorias + 1;
                    const losses = userData.derrotas;
                    const newLevel = 1 + Math.floor(wins / 5);
                    await updateStats(wins, losses, newLevel);
                }
            } else if (newOpponentScore > newPlayerScore) {
                setRewardPokemon(null);
                setBattleLog('💀 DERROTA! O oponente venceu esta partida.');
                if (userData) {
                    const wins = userData.vitorias;
                    const losses = userData.derrotas + 1;
                    await updateStats(wins, losses, userData.level);
                }
            } else {
                setRewardPokemon(null);
                setBattleLog('🤝 EMPATE! A partida terminou empatada.');
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
                    <Text style={[
                        styles.resultTitle,
                        playerScore > opponentScore 
                            ? styles.winColor 
                            : (playerScore < opponentScore ? styles.lossColor : styles.tieColor)
                    ]}>
                        {playerScore > opponentScore 
                            ? '🏆 VITÓRIA!' 
                            : (playerScore < opponentScore ? '💀 DERROTA!' : '🤝 EMPATE!')}
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
                    <ScoreBoard
                        playerScore={playerScore}
                        opponentScore={opponentScore}
                    />

                    <View style={styles.arenaRow}>
                        <PokemonStage
                            pokemon={team[currentRound]}
                            imageUri={(() => {
                                const pkm = team[currentRound];
                                if (!pkm) return '';
                                const isShiny = shinyIds.includes(pkm.id);
                                const detail = allPokemons.find(p => p.id === pkm.id);
                                if (detail) {
                                    return isShiny 
                                        ? (detail.imagemShiny || detail.imagem.replace('/official-artwork/', '/official-artwork/shiny/')) 
                                        : detail.imagem;
                                }
                                return isShiny 
                                    ? pkm.imagem.replace('/official-artwork/', '/official-artwork/shiny/') 
                                    : pkm.imagem;
                            })()}
                            isWinner={roundWinner === 'player'}
                            selectedStat={playerSelectedStat}
                            activeIndex={playerActiveIndex}
                        />

                        <PokemonStage
                            pokemon={opponentTeam[currentRound]}
                            imageUri={opponentTeam[currentRound].imagem}
                            isWinner={roundWinner === 'opponent'}
                            selectedStat={opponentSelectedStat}
                            activeIndex={opponentActiveIndex}
                        />
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

                    <BattleLogBox battleLog={battleLog} />

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
    arenaRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 16,
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
    tieColor: {
        color: '#FFD600',
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
