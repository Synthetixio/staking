import useSynthetixQueries from '@synthetixio/queries';
import Wei, { wei } from '@synthetixio/wei';
import { Synths } from 'constants/currency';
import useGetSnxAmountToBeLiquidatedUsd from 'hooks/useGetSnxAmountToBeLiquidatedUsd';
import { useRecoilValue } from 'recoil';
import { TabContainer } from 'sections/staking/components/common';
import useStakingCalculations from 'sections/staking/hooks/useStakingCalculations';
import { delegateWalletState, walletAddressState } from 'store/wallet';
import { useTranslation } from 'react-i18next';
import SelfLiquidationTabContent from './SelfLiquidationTabContent';
import { StyledCTA } from 'sections/staking/components/common';
import Connector from 'containers/Connector';
import styled from 'styled-components';
import { FlexDivJustifyCenter } from 'styles/common';
import Loader from 'components/Loader';

const SelfLiquidateTab = () => {
	const walletAddress = useRecoilValue(walletAddressState);
	const { t } = useTranslation();
	const {
		debtBalance,
		issuableSynths,
		percentageCurrentCRatio,
		percentageTargetCRatio,
		SNXRate,
		collateral,
		isLoading,
	} = useStakingCalculations();
	const { connectWallet } = Connector.useContainer();
	const { useSynthsBalancesQuery, useGetLiquidationDataQuery } = useSynthetixQueries();
	const synthsBalancesQuery = useSynthsBalancesQuery(walletAddress);
	const sUSDBalance = synthsBalancesQuery?.data?.balancesMap[Synths.sUSD]?.balance ?? wei(0);
	const liquidationDataQuery = useGetLiquidationDataQuery(walletAddress);
	const delegateWallet = useRecoilValue(delegateWalletState);

	const isDelegateWallet = Boolean(delegateWallet?.address);
	const canSelfLiquidate =
		percentageCurrentCRatio.gt(0) &&
		percentageCurrentCRatio.lt(percentageTargetCRatio) &&
		!isDelegateWallet;
	const liquidationAmountsToFixCollateralQuery = useGetSnxAmountToBeLiquidatedUsd(
		debtBalance,
		collateral.mul(SNXRate),
		liquidationDataQuery.data?.selfLiquidationPenalty,
		liquidationDataQuery.data?.liquidationPenalty,
		canSelfLiquidate
	);

	const burnAmountToFixCRatio = wei(Wei.max(debtBalance.sub(issuableSynths), wei(0)));
	if (!walletAddress) {
		return (
			<ConnectWalletButtonWrapper>
				<StyledCTA variant="primary" size="lg" onClick={connectWallet}>
					{t('common.wallet.connect-wallet')}
				</StyledCTA>
			</ConnectWalletButtonWrapper>
		);
	}
	if (!liquidationDataQuery.data || synthsBalancesQuery.isLoading || isLoading) {
		return (
			<FlexDivJustifyCenter>
				<Loader inline />
			</FlexDivJustifyCenter>
		);
	}

	return (
		<TabContainer>
			<SelfLiquidationTabContent
				percentageCurrentCRatio={percentageCurrentCRatio}
				percentageTargetCRatio={percentageTargetCRatio}
				burnAmountToFixCRatio={burnAmountToFixCRatio}
				sUSDBalance={sUSDBalance}
				selfLiquidationPenalty={liquidationDataQuery.data.selfLiquidationPenalty}
				liquidationPenalty={liquidationDataQuery.data.liquidationPenalty}
				walletAddress={walletAddress}
				isDelegateWallet={isDelegateWallet}
				SNXRate={SNXRate}
				amountToSelfLiquidateUsd={
					liquidationAmountsToFixCollateralQuery.data?.amountToSelfLiquidateUsd
				}
			/>
		</TabContainer>
	);
};
const ConnectWalletButtonWrapper = styled.div`
	width: 200px;
	margin: 0 auto;
`;
export default SelfLiquidateTab;
