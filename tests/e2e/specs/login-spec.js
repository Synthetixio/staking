/* eslint-disable ui-testing/missing-assertion-in-test */
import HomePage from '../pages/home/home-page';
import { createHorde } from 'gremlins.js';

const home = new HomePage();

describe('Monkey tests', () => {
	let horde;
	beforeEach(() =>
		cy.window().then((testedWindow) => {
			horde = createHorde({ window: testedWindow });
		})
	);
	before(() => {
		home.visit();
		home.connectBrowserWallet();
		home.acceptMetamaskAccessRequest();
		home.waitUntilLoggedIn();
	});
	context('begin', () => {
		it(`should start and throw no errors`, () => {
			return cy.wrap(horde.unleash()).then(() => {
				/* ... */
			});
		});
	});
});
