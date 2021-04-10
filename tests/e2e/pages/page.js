export default class Page {
	getTitle() {
		return cy.title();
	}

	getMetamaskWalletAddress() {
		return cy.fetchMetamaskWalletAddress();
	}

	acceptMetamaskAccessRequest() {
		cy.wait(1000);
		cy.window()
			.then((win) => {
				return !win.ethereum ? [] : win.ethereum.request({ method: 'eth_accounts' });
			})
			.then((accounts) => {
				cy.log('yo yo');
				cy.log('t ' + accounts.length);
				if (!accounts.length) {
					cy.acceptMetamaskAccess();
				}
			});
	}

	confirmMetamaskTransaction() {
		return cy.confirmMetamaskTransaction();
	}
}
