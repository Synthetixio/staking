import Page from '../page';
export default class Onboard extends Page {
	getMetamaskBtn() {
		return cy.findByAltText('MetaMask');
	}
}
