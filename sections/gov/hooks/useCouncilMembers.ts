import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import spartanCouncil from 'contracts/spartanCouncil';
import Connector from 'containers/Connector';

// @TODO: Add to snx-js after redeploying Spartan Council NFT with transfer event to conform to ERC20
export const useCouncilMembers = () => {
	const [councilMembers, setCouncilMembers] = useState<string[] | null>(null);
	const numOfCouncil = 8;
	const { provider, ens } = Connector.useContainer();

	let contract = new ethers.Contract(
		spartanCouncil.address,
		spartanCouncil.abi,
		provider as ethers.providers.Provider
	);

	useEffect(() => {
		const getCouncilMembers = async () => {
			let councilMembers = [] as any;
			for (let i = 1; i <= numOfCouncil; i++) {
				let address = await contract.ownerOf(i);
				councilMembers.push(address);
			}
			let resolvedMembers = await Promise.resolve(councilMembers);
			setCouncilMembers(resolvedMembers);
		};

		getCouncilMembers();
	}, []);

	return councilMembers;
};

export default useCouncilMembers;
