import { useEffect, useState, useMemo } from 'react';
import { ethers } from 'ethers';
import spartanCouncil from 'contracts/spartanCouncil';
import Connector from 'containers/Connector';
import { useRecoilValue } from 'recoil';
import { appReadyState } from 'store/app';

// @TODO: Add to snx-js after redeploying Spartan Council NFT with transfer event to conform to ERC20
export const useCouncilMembers = () => {
	const [councilMembers, setCouncilMembers] = useState<string[] | null>(null);
	const numOfCouncil = 8;
	const { provider } = Connector.useContainer();
	const isAppReady = useRecoilValue(appReadyState);

	let contract = useMemo(
		() =>
			new ethers.Contract(
				spartanCouncil.address,
				spartanCouncil.abi,
				provider as ethers.providers.Provider
			),
		[provider]
	);

	useEffect(() => {
		const getCouncilMembers = async () => {
			if (provider && isAppReady) {
				let councilMembers = [] as any;
				for (let i = 1; i <= numOfCouncil; i++) {
					let address = await contract.ownerOf(i);
					councilMembers.push(address);
				}
				let resolvedMembers = await Promise.resolve(councilMembers);
				setCouncilMembers(resolvedMembers);
			} else {
				setCouncilMembers([]);
			}
		};
		// @TODO uncomment
		// getCouncilMembers();
	}, [provider, isAppReady, contract]);

	return councilMembers;
};

export default useCouncilMembers;
