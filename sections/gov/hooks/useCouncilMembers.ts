import { ethers } from 'ethers';
import spartanCouncil from 'contracts/spartanCouncil';
import councilDilution from 'contracts/councilDilution';
import Connector from 'containers/Connector';
import { useRecoilValue } from 'recoil';
import { appReadyState } from 'store/app';
import { getProfiles } from '../components/helper';
import { useQuery } from 'react-query';

export const useCouncilMembers = () => {
	const { provider, L2DefaultProvider, L1DefaultProvider } = Connector.useContainer();
	const isAppReady = useRecoilValue(appReadyState);
	return useQuery(
		['gov', 'council-members'],
		async () => {
			let spartanCouncilContract = new ethers.Contract(
				spartanCouncil.address,
				spartanCouncil.abi,
				L1DefaultProvider
			);

			let councilDilutionContract = new ethers.Contract(
				councilDilution.address,
				councilDilution.abi,
				L2DefaultProvider
			);

			let councilMembers = [] as string[];

			const numOfCouncilMembersBN = await councilDilutionContract.numOfSeats();

			const numOfCouncilMembers = Number(numOfCouncilMembersBN);

			for (let i = 1; i <= numOfCouncilMembers; i++) {
				let address = await spartanCouncilContract.ownerOf(i);
				if (address !== ethers.constants.AddressZero) {
					councilMembers.push(ethers.utils.getAddress(address));
				}
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
			return profileArray;
		},
		{
			staleTime: 600000, // 10 min stale time,
			enabled: Boolean(provider && isAppReady && L1DefaultProvider && L2DefaultProvider),
		}
	);
};

export default useCouncilMembers;
