import { useEffect, useState } from 'react';
import { ethers } from 'ethers';
import spartanCouncil from 'contracts/spartanCouncil';
import councilDilution from 'contracts/councilDilution';
import Connector from 'containers/Connector';
import { useRecoilValue } from 'recoil';
import { appReadyState } from 'store/app';
import { getProfiles } from '../components/helper';

export const useCouncilMembers = () => {
	const [councilMembers, setCouncilMembers] = useState<any[] | null>(null);
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

				const profiles = await getProfiles(resolvedMembers);

				const profileArray = Object.keys(profiles).map((profile) => {
					const accessor = profiles[profile];
					return {
						ens: accessor.ens.length > 0 ? accessor.ens : null,
						address: profile,
						name: accessor.name ? accessor.name : null,
					};
				});

				setCouncilMembers(profileArray);
			} else {
				setCouncilMembers(null);
			}
		};
		getCouncilMembers();
	}, [provider, isAppReady]);

	return councilMembers;
};

export default useCouncilMembers;
