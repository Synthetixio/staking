import Page from '../page';
export default class Onboard extends Page {
	c() {
		return cy.findByAltText('Browser Wallet');
	}
}
