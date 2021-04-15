import Web3 from 'web3';

let web3: any;

export function makeWeb3Contract(address: string, abi: any) {
	if (!web3) web3 = new Web3(window.ethereum);
	return new web3.eth.Contract(abi, address);
}
