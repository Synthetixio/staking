import HomePage from '../pages/home/home-page';

const home = new HomePage();

let metamaskWalletAddress;

describe('Wallet tests', () => {
	before(() => {
		home.getMetamaskWalletAddress().then((address) => {
			metamaskWalletAddress = address;
		});
		home.visit();
	});
	context('Connect metamask wallet', () => {
		it(`should login with success`, () => {
			home.connectBrowserWallet();
			home.acceptMetamaskAccessRequest();
			home.waitUntilLoggedIn();
			home.getLoggedInWalletAddress().then((stakingWalletAddress) => {
				const formattedMetamaskWalletAddress =
					metamaskWalletAddress.slice(0, 5) + '...' + metamaskWalletAddress.slice(-5);
				expect(stakingWalletAddress).to.equal(formattedMetamaskWalletAddress.toLowerCase());
			});
		});
	});
});
