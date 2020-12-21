import Page from '../page';
export default class Header extends Page {
	getUserMenu() {
		return cy.findByTestId('user-menu');
	}
	getConnectWalletBtn() {
		return cy.findByTestId('connect-wallet');
	}
	getWalletAddress() {
		return cy.findByTestId('wallet-address');
	}
}
