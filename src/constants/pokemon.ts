import { Pokemon } from '@/@types/pokemon';

export const STATS_POOL = ['hp', 'atk', 'def', 'spa', 'spd', 'speed'];

export const STAT_LABELS: Record<string, string> = {
    hp: 'HP',
    atk: 'ATK',
    def: 'DEF',
    spa: 'SP. ATK',
    spd: 'SP. DEF',
    speed: 'SPEED',
};

export const getStatValue = (pokemon: Pokemon, statName: string): number => {
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
