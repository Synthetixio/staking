import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import spartanCouncil from 'contracts/spartanCouncil';
import councilDilution from 'contracts/councilDilution';
import Connector from 'containers/Connector';
import { useRecoilValue } from 'recoil';
import { appReadyState } from 'store/app';

// @TODO: Add to snx-js after redeploying Spartan Council NFT with transfer event to conform to ERC20
export const useCouncilMembers = () => {
	const [councilMembers, setCouncilMembers] = useState<string[] | null>(null);
	const { provider } = Connector.useContainer();
	const isAppReady = useRecoilValue(appReadyState);

	useEffect(() => {
		const getCouncilMembers = async () => {
			if (provider && isAppReady) {
				let spartanCouncilContract = new ethers.Contract(
					spartanCouncil.address,
					spartanCouncil.abi,
					provider as ethers.providers.Provider
				);

				let councilDilutionContract = new ethers.Contract(
					councilDilution.address,
					councilDilution.abi,
					provider as ethers.providers.Provider
				);

				let councilMembers = [] as any;

				const numOfCouncilMembersBN = await councilDilutionContract.numOfSeats();

				const numOfCouncilMembers = parseInt(numOfCouncilMembersBN.toString());

				for (let i = 1; i <= numOfCouncilMembers; i++) {
					let address = await spartanCouncilContract.ownerOf(i);
					councilMembers.push(address.toLowerCase());
				}
				let resolvedMembers = await Promise.resolve(councilMembers);
				setCouncilMembers(resolvedMembers);
			} else {
				setCouncilMembers(null);
			}
		};
		getCouncilMembers();
	}, [provider, isAppReady]);

	return councilMembers;
};

export default useCouncilMembers;
