import { NetworkIdByName } from '@synthetixio/contracts-interface';
import { getInfuraRpcURL } from './infura';

describe('getInfuraRpcURL', () => {
	beforeAll(() => {
		process.env.NEXT_PUBLIC_INFURA_PROJECT_ID = '<id>';
	});
	test('mainnet', () => {
		expect(getInfuraRpcURL(NetworkIdByName.mainnet)).toBe('https://mainnet.infura.io/v3/<id>');
	});
	test('kovan', () => {
		expect(getInfuraRpcURL(NetworkIdByName.kovan)).toBe('https://kovan.infura.io/v3/<id>');
	});
	test('optimism', () => {
		expect(getInfuraRpcURL(NetworkIdByName['mainnet-ovm'])).toBe(
			'https://optimism-mainnet.infura.io/v3/<id>'
		);
	});
	test('optimism kovan', () => {
		expect(getInfuraRpcURL(NetworkIdByName['kovan-ovm'])).toBe(
			'https://optimism-kovan.infura.io/v3/<id>'
		);
	});
});
