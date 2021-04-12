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

	connectBrowserWallet() {
		const userMenu = this.header.getUserMenu();
		userMenu.click();
		const connectWalletButton = this.header.getConnectWalletBtn();
		connectWalletButton.click();
		const onboardBrowserWalletButton = this.onboard.getBrowserWalletBtn();
		onboardBrowserWalletButton.click();
	}

	waitUntilLoggedIn() {
		cy.waitUntil(() => {
			const walletAddress = this.header.getWalletAddress();
			return walletAddress.should('exist');
		});
	}

	getLoggedInWalletAddress() {
		const walletAddress = this.header.getWalletAddress();
		return walletAddress.invoke('text');
	}
}
