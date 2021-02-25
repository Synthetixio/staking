import React from 'react';
import { useConfig as baseUseConfig } from 'sections/loans/hooks/config';
import { useLoans as baseUseLoans } from 'sections/loans/hooks/loans';

const LoansContext = React.createContext(null);

export function LoansProvider({ children }) {
	const config = baseUseConfig();
	const loans = baseUseLoans();

	return (
		<LoansContext.Provider
			value={{
				config,
				loans,
			}}
		>
			{children}
		</LoansContext.Provider>
	);
}

export function useConfig() {
	const context = React.useContext(LoansContext);
	if (!context) {
		throw new Error('Missing loans context');
	}
	return context['config'];
}

export function useLoans() {
	const context = React.useContext(LoansContext);
	if (!context) {
		throw new Error('Missing loans context');
	}
	return context['loans'];
}
