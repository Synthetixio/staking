export type NumberColor = 'green' | 'pink';
export type NumberStyle =
	| 'percent0'
	| 'percent2'
	| 'number'
	| 'number4'
	| 'currency0'
	| 'currency2';

export const MAX_PAGE_WIDTH = 1226;
export const BOX_COLUMN_WIDTH = 450;

export const Z_INDEX = {
	one: 1,
	hundred: 100,
	thousand: 1000,
};

export const COLORS: { [color: string]: NumberColor } = {
	green: 'green',
	pink: 'pink',
};
