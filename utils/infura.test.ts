import { NetworkIdByName } from '@synthetixio/contracts-interface';
import { getInfuraRpcURL } from './infura';

describe('getInfuraRpcURL', () => {
  beforeAll(() => {
    process.env.NEXT_PUBLIC_INFURA_PROJECT_ID = '<id>';
  });
  test('mainnet', () => {
    expect(getInfuraRpcURL(NetworkIdByName.mainnet)).toBe('https://mainnet.infura.io/v3/<id>');
  });
  test('goerli', () => {
    expect(getInfuraRpcURL(NetworkIdByName.goerli)).toBe('https://goerli.infura.io/v3/<id>');
  });
  test('optimism', () => {
    expect(getInfuraRpcURL(NetworkIdByName['mainnet-ovm'])).toBe(
      'https://optimism-mainnet.infura.io/v3/<id>'
    );
  });
  test('optimism goerli', () => {
    expect(getInfuraRpcURL(NetworkIdByName['goerli-ovm'])).toBe(
      'https://optimism-goerli.infura.io/v3/<id>'
    );
  });
});
