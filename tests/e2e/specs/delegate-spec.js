import * as ethers from 'ethers';
import DelegatePage from '../pages/wallet/delegate-page';

const delegatePage = new DelegatePage();

describe('Delegate', () => {
	before(() => {});
	context('Page', () => {
		it('should be accessible from sidenav', () => {
			cy.visit('/');
			cy.findByTestId('sidenav-/escrow').trigger('mouseover');
			cy.findByTestId('sidenav-submenu-/delegate').click();
			cy.findByTestId('form', { timeout: 30 * 1e3 }).should('be.visible');
		});
		it('should delegate & undelegate powers to an account', () => {
			const { address: delegateAddress } = ethers.Wallet.createRandom();
			const shortenedDelegateAddress = `${delegateAddress.slice(0, 5)}...${delegateAddress.slice(
				-3
			)}`;

			delegatePage.visit();
			delegatePage.getFormButton().contains('connect wallet').click();
			cy.findByAltText('MetaMask').click();
			delegatePage.acceptMetamaskAccessRequest();
			delegatePage.getFormButton().contains('enter an address');

			// approve burn
			delegatePage.getFormInput().type(delegateAddress);
			// delegatePage.getTable().contains('No addresses to show');
			cy.findByTestId('action-burn').click();
			delegatePage.getFormButton().contains('delegate').click();
			delegatePage.confirmMetamaskTransaction();
			// delegatePage.getTable().not.contains('No addresses to show');
			delegatePage.getTable().contains(shortenedDelegateAddress, { timeout: 30 * 1e3 });
			cy.findByTestId(`checkbox-${delegateAddress}-all`).should('not.be.checked');
			cy.findByTestId(`checkbox-${delegateAddress}-mint`).should('not.be.checked');
			cy.findByTestId(`checkbox-${delegateAddress}-burn`).should('be.checked');
			cy.findByTestId(`checkbox-${delegateAddress}-claim`).should('not.be.checked');
			cy.findByTestId(`checkbox-${delegateAddress}-trade`).should('not.be.checked');

			// check mint
			cy.findByTestId(`checkbox-${delegateAddress}-mint`).siblings().click();
			delegatePage.confirmMetamaskTransaction();
			cy.findByTestId(`checkbox-${delegateAddress}-all`).should('not.be.checked');
			cy.findByTestId(`checkbox-${delegateAddress}-mint`).should('be.checked');
			cy.findByTestId(`checkbox-${delegateAddress}-burn`).should('be.checked');
			cy.findByTestId(`checkbox-${delegateAddress}-claim`).should('not.be.checked');
			cy.findByTestId(`checkbox-${delegateAddress}-trade`).should('not.be.checked');

			// check all
			cy.findByTestId(`checkbox-${delegateAddress}-all`).siblings().click();
			delegatePage.confirmMetamaskTransaction();
			cy.findByTestId(`checkbox-${delegateAddress}-all`).should('be.checked');
			cy.findByTestId(`checkbox-${delegateAddress}-mint`).should('be.checked');
			cy.findByTestId(`checkbox-${delegateAddress}-burn`).should('be.checked');
			cy.findByTestId(`checkbox-${delegateAddress}-claim`).should('be.checked');
			cy.findByTestId(`checkbox-${delegateAddress}-trade`).should('be.checked');
			cy.findByTestId(`checkbox-${delegateAddress}-all`).should('not.be.disabled');
			cy.findByTestId(`checkbox-${delegateAddress}-mint`).should('be.disabled');
			cy.findByTestId(`checkbox-${delegateAddress}-burn`).should('be.disabled');
			cy.findByTestId(`checkbox-${delegateAddress}-claim`).should('be.disabled');
			cy.findByTestId(`checkbox-${delegateAddress}-trade`).should('be.disabled');

			// uncheck all
			cy.findByTestId(`checkbox-${delegateAddress}-all`).siblings().click();
			delegatePage.confirmMetamaskTransaction();
			cy.findByTestId(`checkbox-${delegateAddress}-all`).should('not.be.checked');
			cy.findByTestId(`checkbox-${delegateAddress}-mint`).should('not.be.checked');
			cy.findByTestId(`checkbox-${delegateAddress}-burn`).should('not.be.checked');
			cy.findByTestId(`checkbox-${delegateAddress}-claim`).should('not.be.checked');
			cy.findByTestId(`checkbox-${delegateAddress}-trade`).should('not.be.checked');
			cy.findByTestId(`checkbox-${delegateAddress}-all`).should('not.be.disabled');
			cy.findByTestId(`checkbox-${delegateAddress}-mint`).should('not.be.disabled');
			cy.findByTestId(`checkbox-${delegateAddress}-burn`).should('not.be.disabled');
			cy.findByTestId(`checkbox-${delegateAddress}-claim`).should('not.be.disabled');
			cy.findByTestId(`checkbox-${delegateAddress}-trade`).should('not.be.disabled');
		});
	});
});
