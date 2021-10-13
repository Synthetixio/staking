import LoansPage from '../pages/loans-page';

const loansPage = new LoansPage();

describe.skip('Loans', () => {
	context('Navigation', () => {
		it('should be accessible from sidenav', () => {
			cy.visit('/');
			cy.findByTestId('sidenav-/loans').click();
			cy.findByTestId('loans-form', { timeout: 30 * 1e3 }).should('be.visible');
		});
	});
	context('Form', () => {
		before(() => {
			loansPage.visit();
			loansPage.getFormButton().contains('connect wallet').click();
			cy.findByAltText('MetaMask').click();
			loansPage.acceptMetamaskAccessRequest();
		});
		it('should default debt asset to sUSD', () => {
			loansPage.getFormButton().contains('BORROW sUSD');
		});
		it('should allow switching debt to sETH', () => {
			loansPage.getLeftInput().within(() => {
				cy.findByTestId('select').click();
				cy.findAllByText('sETH').click();
			});
			loansPage.getFormButton().contains('BORROW sETH');
			loansPage.getLeftInput().contains('sETH');
		});
		it('should allow switching debt to sBTC', () => {
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
		});
		it('should allow switching collateral to renBTC', () => {
			loansPage.getRightInput().within(() => {
				cy.findByTestId('select').click();
				cy.findAllByText('renBTC').click();
			});
			loansPage.getLeftInput().contains('sUSD');
			loansPage.getRightInput().contains('renBTC');
			loansPage.getFormButton().contains('BORROW sUSD');

			//
			loansPage.getRightInput().within(() => {
				cy.findByTestId('select').click();
				cy.findAllByText('ETH').click();
			});
		});
		it('should indicate minimum ETH collateral', () => {
			loansPage.getLeftInput().within(() => {
				cy.findByTestId('input').clear().type(5000);
			});
			loansPage.getRightInput().within(() => {
				cy.findByTestId('input').clear().type(1);
			});
			loansPage.getFormButton().contains('MINIMUM COLLATERAL IS 2.00 ETH');
		});
		it('should indicate minimum renBTC collateral', () => {
			loansPage.getLeftInput().within(() => {
				cy.findByTestId('input').clear().type(5000);
			});
			loansPage.getRightInput().within(() => {
				cy.findByTestId('input').clear().type(0.01);
				cy.findByTestId('select').click();
				cy.findAllByText('renBTC').click();
			});
			loansPage.getFormButton().contains('MINIMUM COLLATERAL IS 0.05 renBTC');

			//
			loansPage.getRightInput().within(() => {
				cy.findByTestId('select').click();
				cy.findAllByText('ETH').click();
			});
		});
		it('should indicate low c-ratio', () => {
			loansPage.getLeftInput().within(() => {
				cy.findByTestId('input').clear().type(5000);
			});
			loansPage.getRightInput().within(() => {
				cy.findByTestId('input').clear().clear().type(2);
			});
			loansPage.getFormButton().contains('C-RATIO TOO LOW');
		});
		it('should allow creating a loan', () => {
			loansPage.getLeftInput().within(() => {
				cy.findByTestId('input').clear().clear().type(1000);
			});
			loansPage.getRightInput().within(() => {
				cy.findByTestId('input').clear().clear().type(2);
			});

			// todo validate c-ratio, interest rate and issuance fee stats

			loansPage.getFormButton().contains('BORROW sUSD').click();

			cy.rejectMetamaskTransaction();
		});
	});
});
