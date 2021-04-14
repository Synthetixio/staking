import Page from './page';

export default class LoansPage extends Page {
	getForm() {
		return cy.findByTestId('loans-form');
	}

	getFormButton() {
		return cy.findByTestId('loans-form-button');
	}

	getLeftInput() {
		return cy.findByTestId('loans-form-left-input');
	}

	getRightInput() {
		return cy.findByTestId('loans-form-right-input');
	}

	getTable() {
		return cy.findByTestId('loans-table');
	}

	visit() {
		cy.visit('/loans');
	}

	confirmMetamaskTransaction() {
		cy.confirmMetamaskTransaction();
		cy.findByTestId('tx-notification-transaction-confirmed', { timeout: 30 * 1e3 }).should(
			'be.visible'
		);
		cy.wait(11 * 1e3); // autoclose
		// const notif = cy.findByTestId('tx-notification-transaction-confirmed', { timeout: 30 * 1e3 });
		// notif.invoke('attr', 'data-href').should((txEtherscanUrl) => {
		// 	this.waitUntilAvailableOnEtherscan(txEtherscanUrl, 'etherscan');
		// 	cy.get('@etherscan').should((response) => {
		// 		expect(response.body).to.include('</i>Success</span>');
		// 		// blocker: need slippage explanations
		// 		// todo: verify gas amount in metamask and etherscan, etherscan asset sent, fee and received asset value
		// 	});
		// });
	}

	waitUntilAvailableOnEtherscan(urlOrTx, alias) {
		if (!urlOrTx.includes('http')) {
			cy.getNetwork().then((network) => {
				const etherscanUrl =
					network.networkName === 'mainnet'
						? `https://etherscan.io/tx/${urlOrTx}`
						: `https://${network.networkName}.etherscan.io/tx/${urlOrTx}`;
				this.waitForTxSuccess(etherscanUrl, alias);
			});
		} else {
			this.waitForTxSuccess(urlOrTx, alias);
		}
	}

	waitForTxSuccess(url, alias) {
		cy.request(url).as(alias);
		cy.get(`@${alias}`).then((response) => {
			if (
				response.body.includes('This transaction has been included into Block No') ||
				response.body.includes('</i> Pending</span>')
			) {
				cy.wait(5000);
				this.waitForTxSuccess(url, alias);
			}
		});
	}
}
