import { createMuiTheme } from '@material-ui/core/styles';

import colors from './colors';
import fonts from './fonts';

export const theme = {
	colors,
	fonts,
};

export type ThemeInterface = typeof theme;

export const muiTheme = createMuiTheme({});

export default theme;
