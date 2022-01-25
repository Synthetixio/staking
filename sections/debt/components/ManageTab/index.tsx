import Wei from '@synthetixio/wei';
import useUserStakingData from 'hooks/useUserStakingData';
import { useRecoilValue } from 'recoil';
import { walletAddressState } from 'store/wallet';
import styled from 'styled-components';
import { FlexDivColCentered } from 'styles/common';

const ManageTab = () => {
	const walletAddress = useRecoilValue(walletAddressState);
	const { debtBalance: actualDebt } = useUserStakingData(walletAddress);

	return (
		<ManageContainer>
			{!walletAddress ? <span>Please connect a wallet</span> : <div>Input here</div>}
		</ManageContainer>
	);
};

const ManageContainer = styled(FlexDivColCentered)`
	height: 100%;
	justify-content: center;
	background: ${(props) => props.theme.colors.navy};
	font-family: ${(props) => props.theme.fonts.extended};
	text-transform: uppercase;
	color: ${(props) => props.theme.colors.mutedGray};
`;

export default ManageTab;
