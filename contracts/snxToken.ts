export default {
	address: {
		mainnet: '0xc011a73ee8576fb46f5e1c5751ca3b9fe0af2a6f',
		'mainnet-ovm': '0x8700dAec35aF8Ff88c16BdF0418774CB3D7599B4',
		kovan: '0xC011a73ee8576Fb46F5E1c5751cA3B9Fe0af2a6F',
		'kovan-ovm': '0x8700dAec35aF8Ff88c16BdF0418774CB3D7599B4',
	},
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
