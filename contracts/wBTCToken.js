export default {
	address: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
	abi: [
		{
			constant: true,
			inputs: [{ internalType: 'address', name: 'account', type: 'address' }],
			name: 'balanceOf',
			outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
			payable: false,
			stateMutability: 'view',
			type: 'function',
		},
	],
};
