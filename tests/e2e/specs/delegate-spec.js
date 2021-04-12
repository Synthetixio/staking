import * as ethers from 'ethers';
import DelegatePage from '../pages/wallet/delegate-page';

cy.setupMetamask = () => {};

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
			delegatePage.getAllCheckbox(delegateAddress).should('not.be.checked');
			delegatePage.getMintCheckbox(delegateAddress).should('not.be.checked');
			delegatePage.getBurnCheckbox(delegateAddress).should('be.checked');
			delegatePage.getClaimCheckbox(delegateAddress).should('not.be.checked');
			delegatePage.getTradeCheckbox(delegateAddress).should('not.be.checked');

			// check mint
			delegatePage.getMintCheckbox(delegateAddress).siblings().click();
			delegatePage.confirmMetamaskTransaction();
			delegatePage.getAllCheckbox(delegateAddress).should('not.be.checked');
			delegatePage.getMintCheckbox(delegateAddress).should('be.checked');
			delegatePage.getBurnCheckbox(delegateAddress).should('be.checked');
			delegatePage.getClaimCheckbox(delegateAddress).should('not.be.checked');
			delegatePage.getTradeCheckbox(delegateAddress).should('not.be.checked');

			// check all
			delegatePage.getAllCheckbox(delegateAddress).siblings().click();
			delegatePage.confirmMetamaskTransaction();
			delegatePage.getAllCheckbox(delegateAddress).should('be.checked');
			delegatePage.getMintCheckbox(delegateAddress).should('be.checked');
			delegatePage.getBurnCheckbox(delegateAddress).should('be.checked');
			delegatePage.getClaimCheckbox(delegateAddress).should('be.checked');
			delegatePage.getTradeCheckbox(delegateAddress).should('be.checked');
			delegatePage.getAllCheckbox(delegateAddress).should('not.be.disabled');
			delegatePage.getMintCheckbox(delegateAddress).should('be.disabled');
			delegatePage.getBurnCheckbox(delegateAddress).should('be.disabled');
			delegatePage.getClaimCheckbox(delegateAddress).should('be.disabled');
			delegatePage.getTradeCheckbox(delegateAddress).should('be.disabled');

			// uncheck all
			delegatePage.getAllCheckbox(delegateAddress).siblings().click();
			delegatePage.confirmMetamaskTransaction();
			delegatePage.getAllCheckbox(delegateAddress).should('not.be.checked');
			delegatePage.getMintCheckbox(delegateAddress).should('not.be.checked');
			delegatePage.getBurnCheckbox(delegateAddress).should('not.be.checked');
			delegatePage.getClaimCheckbox(delegateAddress).should('not.be.checked');
			delegatePage.getTradeCheckbox(delegateAddress).should('not.be.checked');
			delegatePage.getAllCheckbox(delegateAddress).should('not.be.disabled');
			delegatePage.getMintCheckbox(delegateAddress).should('not.be.disabled');
			delegatePage.getBurnCheckbox(delegateAddress).should('not.be.disabled');
			delegatePage.getClaimCheckbox(delegateAddress).should('not.be.disabled');
			delegatePage.getTradeCheckbox(delegateAddress).should('not.be.disabled');
		});
	});
});
