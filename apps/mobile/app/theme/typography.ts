// TODO: write documentation about fonts and typography along with guides on how to add custom fonts in own
// markdown file and add links from here

import { Platform } from 'react-native';
import {
	SpaceGrotesk_300Light as spaceGroteskLight,
	SpaceGrotesk_400Regular as spaceGroteskRegular,
	SpaceGrotesk_500Medium as spaceGroteskMedium,
	SpaceGrotesk_600SemiBold as spaceGroteskSemiBold,
	SpaceGrotesk_700Bold as spaceGroteskBold
} from '@expo-google-fonts/space-grotesk';

export const customFontsToLoad = {
	spaceGroteskLight,
	spaceGroteskRegular,
	spaceGroteskMedium,
	spaceGroteskSemiBold,
	spaceGroteskBold,
	'Helvetica Neue': require('../../assets/fonts/HelveticaNeue.ttf'),
	'HelveticaNeue-Thin': require('../../assets/fonts/HelveticaNeue_Thin.ttf'),
	'HelveticaNeue-Light': require('../../assets/fonts/HelveticaNeue_Light.ttf'),
	'HelveticaNeue-Medium': require('../../assets/fonts/HelveticaNeue_Medium.ttf'),
	'Plus Jakarta Sans': require('../../assets/fonts/PlusJakartaSans-VariableFont_wght.ttf'),
	'PlusJakartaSans-Bold': require('../../assets/fonts/PlusJakartaSans-Bold.ttf'),
	'PlusJakartaSans-Light': require('../../assets/fonts/PlusJakartaSans-Light.ttf'),
	'PlusJakartaSans-Medium': require('../../assets/fonts/PlusJakartaSans-Medium.ttf'),
	'PlusJakartaSans-Regular': require('../../assets/fonts/PlusJakartaSans-Regular.ttf'),
	'PlusJakartaSans-SemiBold': require('../../assets/fonts/PlusJakartaSans-SemiBold.ttf')
};

const fonts = {
	spaceGrotesk: {
		// Cross-platform Google font.
		light: 'spaceGroteskLight',
		normal: 'spaceGroteskRegular',
		medium: 'spaceGroteskMedium',
		semiBold: 'spaceGroteskSemiBold',
		bold: 'spaceGroteskBold'
	},
	helveticaNeue: {
		// iOS only font.
		thin: 'HelveticaNeue-Thin',
		light: 'HelveticaNeue-Light',
		normal: 'Helvetica Neue',
		medium: 'HelveticaNeue-Medium'
	},
	courier: {
		// iOS only font.
		normal: 'Courier'
	},
	sansSerif: {
		// Android only font.
		thin: 'sans-serif-thin',
		light: 'sans-serif-light',
		normal: 'sans-serif',
		medium: 'sans-serif-medium'
	},
	monospace: {
		// Android only font.
		normal: 'monospace'
	},
	PlusJakartaSans: {
		normal: 'PlusJakartaSans-Regular',
		light: 'PlusJakartaSans-Light',
		medium: 'PlusJakartaSans-Medium',
		bold: 'PlusJakartaSans-Bold',
		semiBold: 'PlusJakartaSans-SemiBold'
	}
};

export const typography = {
	/**
	 * The fonts are available to use, but prefer using the semantic name.
	 */
	fonts,
	/**
	 * The primary font. Used in most places.
	 */
	// primary: fonts.spaceGrotesk,
	primary: fonts.PlusJakartaSans,
	/**
	 * An alternate font used for perhaps titles and stuff.
	 */
	// secondary: Platform.select({ ios: fonts.helveticaNeue, android: fonts.sansSerif }),
	secondary: fonts.PlusJakartaSans,

	/**
	 * Lets get fancy with a monospace font!
	 */
	code: Platform.select({ ios: fonts.courier, android: fonts.monospace })
};
