export default {
	address: '0x194eBd173F6cDacE046C53eACcE9B953F28411d1',
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
