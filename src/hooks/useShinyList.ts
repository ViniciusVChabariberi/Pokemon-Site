import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export function useShinyList(triggerReload?: any) {
    const [shinyIds, setShinyIds] = useState<number[]>([]);

    const loadShinyIds = async () => {
        try {
            const stored = await AsyncStorage.getItem('@Team:shiny_list');
            if (stored) {
                setShinyIds(JSON.parse(stored));
            }
        } catch (e) {
            console.error('Erro ao ler shinies locais no Hook:', e);
        }
    };

    useEffect(() => {
        loadShinyIds();
    }, [triggerReload]);

    return { shinyIds, loadShinyIds };
}
