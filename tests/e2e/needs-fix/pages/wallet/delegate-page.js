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

	createApproval(delegateAddress, power) {
		this.getFormInput().type(delegateAddress);
		// this.getTable().contains('No addresses to show');
		cy.findByTestId(`action-${power}`).click();
		this.getFormButton().contains('delegate').click();
		this.confirmMetamaskTransaction();
		// this.getTable().not.contains('No addresses to show');
	}
}
