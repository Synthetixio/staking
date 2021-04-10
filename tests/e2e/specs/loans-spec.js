import LoansPage from '../pages/loans-page';

const loansPage = new LoansPage();

cy.setupMetamask = () => {};

describe('Loans', () => {
	before(() => {});
	context('Page', () => {
		it('should be accessible from sidenav', () => {
			cy.visit('/');
			cy.findByTestId('sidenav-/loans').click();
			cy.findByTestId('loans-form', { timeout: 30 * 1e3 }).should('be.visible');
		});
		it('should create & manage loans', () => {
			loansPage.visit();
			loansPage.getFormButton().contains('connect wallet').click();
			cy.findByAltText('MetaMask').click();
			loansPage.acceptMetamaskAccessRequest();
			loansPage.getFormButton().contains('BORROW sUSD');
		});
	});
});
