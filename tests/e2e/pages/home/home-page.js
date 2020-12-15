import Page from '../page';
import Header from './header';
import Onboard from './onboard';

export default class HomePage extends Page {
	constructor() {
		super();
		this.header = new Header();
		this.onboard = new Onboard();
	}

	visit() {
		cy.visit('/');
	}

	connectMetamaskWallet() {
		const connectWalletButton = this.header.getConnectWalletBtn();
		connectWalletButton.click();
		const onboardMetamaskButton = this.onboard.getMetamaskBtn();
		onboardMetamaskButton.click();
	}

	waitUntilLoggedIn() {
		cy.waitUntil(() => {
			const walletButton = this.header.getWalletButton();
			return walletButton.should('exist');
		});
	}

	getLoggedInWalletAddress() {
		const walletButton = this.header.getWalletButton();
		return walletButton.invoke('text');
	}
}
