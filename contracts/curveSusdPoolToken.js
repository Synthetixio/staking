export default {
	address: '0xC25a3A3b969415c80451098fa907EC722572917F',
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
		{
			constant: true,
			inputs: [
				{ internalType: 'address', name: 'account', type: 'address' },
				{ internalType: 'address', name: 'account', type: 'address' },
			],
			name: 'allowance',
			outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
			payable: false,
			stateMutability: 'view',
			type: 'function',
		},
	],
};
