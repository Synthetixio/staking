let initialized;
export default class Page {
	getTitle() {
		return cy.title();
	}

	getMetamaskWalletAddress() {
		return cy.fetchMetamaskWalletAddress();
	}

	acceptMetamaskAccessRequest() {
		if (initialized) return;
		initialized = true;

		this.getFormButton().contains('connect wallet').click();
		cy.findByAltText('MetaMask').click();

		cy.wait(1000);
		cy.window()
			.then((win) => {
				return !win.ethereum ? [] : win.ethereum.request({ method: 'eth_accounts' });
			})
			.then((accounts) => {
				if (!accounts.length) {
					cy.acceptMetamaskAccess();
				}
			});
	}

	confirmMetamaskTransaction() {
		return cy.confirmMetamaskTransaction();
	}
}
