import { StyleSheet } from 'react-native';
import { Colors } from '@/constants/colors';

export const Styles = StyleSheet.create({
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
});
