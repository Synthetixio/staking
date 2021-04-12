import Page from '../page';

export default class DelegatePage extends Page {
	getForm() {
		return cy.findByTestId('form');
	}

	getFormButton() {
		return cy.findByTestId('form-button');
	}

	getFormInput() {
		return cy.findByTestId('form-input');
	}

	getTable() {
		return cy.findByTestId('table');
	}

	visit() {
		cy.visit('/delegate');
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

	getAllCheckbox(delegateAddress) {
		return this.getCheckbox(delegateAddress, 'all');
	}

	getMintCheckbox(delegateAddress) {
		return this.getCheckbox(delegateAddress, 'mint');
	}

	getBurnCheckbox(delegateAddress) {
		return this.getCheckbox(delegateAddress, 'burn');
	}

	getClaimCheckbox(delegateAddress) {
		return this.getCheckbox(delegateAddress, 'claim');
	}

	getTradeCheckbox(delegateAddress) {
		return this.getCheckbox(delegateAddress, 'trade');
	}

	getCheckbox(delegateAddress, power) {
		return cy.findByTestId(`checkbox-${delegateAddress}-${power}`);
	}
}
