import * as ethers from 'ethers';
import DelegatePage from '../pages/wallet/delegate-page';

const delegatePage = new DelegatePage();

describe.skip('Delegate', function () {
	context('Navigation', function () {
		it('should be accessible from sidenav', function () {
			cy.visit('/');
			cy.findByTestId('sidenav-/escrow').trigger('mouseover');
			cy.findByTestId('sidenav-submenu-/delegate').click();
			cy.findByTestId('form', { timeout: 30 * 1e3 }).should('be.visible');
		});
		it('should be accessible from url', function () {
			delegatePage.visit();
			cy.findByTestId('form', { timeout: 30 * 1e3 }).should('be.visible');
		});
	});

	context('Page', function () {
		before(function () {
			const { address: delegateAddress } = ethers.Wallet.createRandom();
			cy.wrap(delegateAddress).as('delegateAddress');
			cy.wrap(`${delegateAddress.slice(0, 5)}...${delegateAddress.slice(-3)}`).as(
				'shortenedDelegateAddress'
			);
			delegatePage.visit();
		});
		it('should delegate a power to an account', function () {
			delegatePage.getFormButton().contains('connect wallet').click();
			cy.findByAltText('MetaMask').click();
			delegatePage.acceptMetamaskAccessRequest();
			delegatePage.getFormButton().contains('enter an address');

			delegatePage.createApproval(this.delegateAddress, 'burn');

			delegatePage.getTable().contains(this.shortenedDelegateAddress, { timeout: 30 * 1e3 });
			delegatePage.getAllCheckbox(this.delegateAddress).should('not.be.checked');
			delegatePage.getMintCheckbox(this.delegateAddress).should('not.be.checked');
			delegatePage.getBurnCheckbox(this.delegateAddress).should('be.checked');
			delegatePage.getClaimCheckbox(this.delegateAddress).should('not.be.checked');
			delegatePage.getTradeCheckbox(this.delegateAddress).should('not.be.checked');
		});

		context('Existing Approval', function () {
			before(function () {
				delegatePage.createApproval(this.delegateAddress, 'burn');
			});
			it('should allow updating to a none-ALL power', function () {
				delegatePage.getMintCheckbox(this.delegateAddress).siblings().click();
				delegatePage.confirmMetamaskTransaction();
				delegatePage.getAllCheckbox(this.delegateAddress).should('not.be.checked');
				delegatePage.getMintCheckbox(this.delegateAddress).should('be.checked');
				delegatePage.getBurnCheckbox(this.delegateAddress).should('be.checked');
				delegatePage.getClaimCheckbox(this.delegateAddress).should('not.be.checked');
				delegatePage.getTradeCheckbox(this.delegateAddress).should('not.be.checked');
			});
			it('should allow changing to all powers state', function () {
				delegatePage.getAllCheckbox(this.delegateAddress).siblings().click();
				delegatePage.confirmMetamaskTransaction();
				delegatePage.getAllCheckbox(this.delegateAddress).should('be.checked');
				delegatePage.getMintCheckbox(this.delegateAddress).should('be.checked');
				delegatePage.getBurnCheckbox(this.delegateAddress).should('be.checked');
				delegatePage.getClaimCheckbox(this.delegateAddress).should('be.checked');
				delegatePage.getTradeCheckbox(this.delegateAddress).should('be.checked');
				delegatePage.getAllCheckbox(this.delegateAddress).should('not.be.disabled');
				delegatePage.getMintCheckbox(this.delegateAddress).should('be.disabled');
				delegatePage.getBurnCheckbox(this.delegateAddress).should('be.disabled');
				delegatePage.getClaimCheckbox(this.delegateAddress).should('be.disabled');
				delegatePage.getTradeCheckbox(this.delegateAddress).should('be.disabled');
			});
			it('should allow undelegating powers', function () {
				delegatePage.getAllCheckbox(this.delegateAddress).siblings().click();
				delegatePage.confirmMetamaskTransaction();
				delegatePage.getAllCheckbox(this.delegateAddress).should('not.be.checked');
				delegatePage.getMintCheckbox(this.delegateAddress).should('not.be.checked');
				delegatePage.getBurnCheckbox(this.delegateAddress).should('not.be.checked');
				delegatePage.getClaimCheckbox(this.delegateAddress).should('not.be.checked');
				delegatePage.getTradeCheckbox(this.delegateAddress).should('not.be.checked');
				delegatePage.getAllCheckbox(this.delegateAddress).should('not.be.disabled');
				delegatePage.getMintCheckbox(this.delegateAddress).should('not.be.disabled');
				delegatePage.getBurnCheckbox(this.delegateAddress).should('not.be.disabled');
				delegatePage.getClaimCheckbox(this.delegateAddress).should('not.be.disabled');
				delegatePage.getTradeCheckbox(this.delegateAddress).should('not.be.disabled');
			});
		});
	});
});
