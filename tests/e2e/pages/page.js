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
				if (!accounts.length) {
					cy.acceptMetamaskAccess();
				}
			});
	}

	confirmMetamaskTransaction() {
		cy.confirmMetamaskTransaction();
	}

	etherscanWaitForTxSuccess(txid) {
		return cy.etherscanWaitForTxSuccess(txid);
	}
}
