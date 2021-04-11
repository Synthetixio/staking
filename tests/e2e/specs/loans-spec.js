import LoansPage from '../pages/loans-page';

const loansPage = new LoansPage();

describe('Loans', () => {
	context('Page', () => {
		it('should be accessible from sidenav', () => {
			cy.visit('/');
			cy.findByTestId('sidenav-/loans').click();
			cy.findByTestId('loans-form', { timeout: 30 * 1e3 }).should('be.visible');
		});
		it.only('should create & manage loans', () => {
			loansPage.visit();
			loansPage.getFormButton().contains('connect wallet').click();
			cy.findByAltText('MetaMask').click();
			loansPage.acceptMetamaskAccessRequest();
			loansPage.getFormButton().contains('BORROW sUSD');

			// switch debt to sETH
			loansPage.getLeftInput().within(() => {
				cy.findByTestId('select').click();
				cy.findAllByText('sETH').click();
			});
			loansPage.getFormButton().contains('BORROW sETH');
			loansPage.getLeftInput().contains('sETH');

			// switch debt to sBTC
			// should update default collateral to renBTC
			loansPage.getLeftInput().within(() => {
				cy.findByTestId('select').click();
				cy.findAllByText('sBTC').click();
			});
			loansPage.getFormButton().contains('BORROW sBTC');
			loansPage.getLeftInput().contains('sBTC');
			loansPage.getRightInput().contains('renBTC');

			// switch debt to sUSD
			// should update default collateral back to sETH
			loansPage.getLeftInput().within(() => {
				cy.findByTestId('select').click();
				cy.findAllByText('sUSD').click();
			});
			loansPage.getLeftInput().contains('sUSD');
			loansPage.getRightInput().contains('ETH');
			loansPage.getFormButton().contains('BORROW sUSD');

			// fill collateral and debt amounts
			loansPage.getLeftInput().within(() => {
				cy.findByTestId('input').type(5000);
			});
			loansPage.getRightInput().within(() => {
				cy.findByTestId('input').type(1);
			});
			loansPage.getRightInput().contains('ETH');
			loansPage.getFormButton().contains('MINIMUM COLLATERAL IS 2.00 ETH');

			loansPage.getRightInput().within(() => {
				cy.findByTestId('input').clear().type(2);
			});
			loansPage.getFormButton().contains('C-RATIO TOO LOW');

			// todo validate c-ratio, interest rate and issuance fee stats

			loansPage.getLeftInput().within(() => {
				cy.findByTestId('input').clear().type(1000);
			});
			loansPage.getFormButton().contains('BORROW sUSD');
		});
	});
});
