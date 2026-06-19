import { StyleSheet } from 'react-native';
import { Colors } from '@/constants/colors';

export const Styles = StyleSheet.create({
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
});
