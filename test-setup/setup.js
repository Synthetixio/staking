import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

jest.mock('react-optimized-image', () => ({
	default: ({ src }) => `IMG: ${src}`,
	Svg: ({ src }) => `SVG: ${src}`,
}));
