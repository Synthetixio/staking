export default {
	address: '0xEB4C2781e4ebA804CE9a9803C67d0893436bB27D',
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
			inputs: [{ internalType: 'address', name: 'account', type: 'address' }],
			name: 'balanceOfUnderlying',
			outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
			payable: false,
			stateMutability: 'view',
			type: 'function',
		},
	],
};
