import Wei from '@synthetixio/wei';
import useUserStakingData from 'hooks/useUserStakingData';
import { useRecoilValue } from 'recoil';
import { walletAddressState } from 'store/wallet';
import styled from 'styled-components';
import { FlexDivColCentered } from 'styles/common';

const getDehedgeUniswapUrl = (debt: Wei) =>
	`https://app.uniswap.org/#/swap?inputCurrency=0x57ab1ec28d129707052df4df418d58a2d46d5f51&exactAmount=${debt.toNumber()}&exactField=input`;

const ManageTab = () => {
	const walletAddress = useRecoilValue(walletAddressState);
	const { debtBalance: actualDebt } = useUserStakingData(walletAddress);

	return (
		<ManageContainer>
			{!walletAddress ? (
				<span>Please connect a wallet</span>
			) : (
				<iframe
					title="uniswap-dhedge"
					style={{
						width: '100%',
						height: 'auto',
						minHeight: '550px',
						border: 'none',
						borderRadius: '5px',
						overflow: 'hidden',
					}}
					scrolling="no"
					src={getDehedgeUniswapUrl(actualDebt)}
				></iframe>
			)}
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
