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
}
