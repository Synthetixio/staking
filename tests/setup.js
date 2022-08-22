import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// next + swc does not allow to use moduleNameMapper for statics so mock them manually as modules
// see https://github.com/vercel/next.js/discussions/33928
jest.mock(
  'assets/svg/app/loader.svg',
  () =>
    function SVG() {
      return null;
    }
);
