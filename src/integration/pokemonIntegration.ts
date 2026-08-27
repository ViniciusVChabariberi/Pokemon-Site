import axios from 'axios';
import { Pokemon } from '@/@types/pokemon';
import { translateType } from '@/constants/colors';

const API_URL = axios.create({
    baseURL: 'https://pokeapi.co/api/v2',
});

export const getPokemon = async (
    limit = 151
): Promise<Pokemon[]> => {
    const response = await API_URL.get(`/pokemon?limit=${limit}`);

    const list = response.data.results;

    const detailedList = await Promise.all(
        list.map(async (pokemon: { url: string }) => {
            const detailRes = await axios.get(pokemon.url);

            const data = detailRes.data;

            return {
                id: data.id,
                nome: data.name,
                index: data.id.toString().padStart(3, '0'),
                tipos: data.types.map(
                    (t: any) => translateType(t.type.name)
                ),
                imagem:
                    data.sprites.other['official-artwork']
                        .front_default,
                imagemShiny:
                    data.sprites.other['official-artwork']
                        .front_shiny,
                altura: data.height,
                peso: data.weight,

                poderes: data.stats.map((s: any) => ({
                    nome: s.stat.name,
                    forca: s.base_stat,
                })),
            };
        })
    );

    return detailedList;
};
