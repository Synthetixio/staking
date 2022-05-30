import useSynthetixQueries from '@synthetixio/queries';
import Wei, { wei, WeiSource } from '@synthetixio/wei';
import { Synths } from 'constants/currency';
import useGetSnxAmountToBeLiquidatedUsd from 'hooks/useGetSnxAmountToBeLiquidatedUsd';
import { useRecoilValue } from 'recoil';
import { TabContainer } from 'sections/staking/components/common';
import useStakingCalculations from 'sections/staking/hooks/useStakingCalculations';
import { walletAddressState } from 'store/wallet';
import styled from 'styled-components';
import { formatCryptoCurrency, formatNumber, formatPercent } from 'utils/formatters/number';
import SelfLiquidateTransactionButton from 'components/SelfLiquidateTransactionButton';
import BurnMaxButton from './BurnMaxButton';
import { EXTERNAL_LINKS } from 'constants/links';
import { StyledLink } from 'sections/staking/components/common';
import { useTranslation } from 'react-i18next';

const formatSUSD = (val: WeiSource) => {
	return formatCryptoCurrency(val, {
		sign: '$',
		currencyKey: Synths.sUSD,
		minDecimals: 2,
	});
};

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
	} = useStakingCalculations();
	const { useSynthsBalancesQuery, useGetLiquidationDataQuery } = useSynthetixQueries();
	const synthsBalancesQuery = useSynthsBalancesQuery(walletAddress);
	const sUSDBalance = synthsBalancesQuery?.data?.balancesMap[Synths.sUSD]?.balance ?? wei(0);
	const liquidationDataQuery = useGetLiquidationDataQuery(walletAddress);

	const liquidationAmountsToFixCollateralQuery = useGetSnxAmountToBeLiquidatedUsd(
		debtBalance,
		collateral.mul(SNXRate),
		liquidationDataQuery.data?.selfLiquidationPenalty,
		liquidationDataQuery.data?.liquidationPenalty
	);

	const burnAmountToFixCRatio = wei(Wei.max(debtBalance.sub(issuableSynths), wei(0)));
	const liquidationAmountsData = liquidationAmountsToFixCollateralQuery.data;
	if (!liquidationDataQuery.data || !liquidationAmountsData || synthsBalancesQuery.isLoading) {
		return null;
	}

	return (
		<TabContainer>
			<Container>
				<InfoText>
					{t('staking.self-liquidation.info.ratios', {
						cRatio: formatPercent(percentageCurrentCRatio),
						targetCRatio: formatPercent(percentageTargetCRatio),
					})}
				</InfoText>
				<InfoText>
					{t('staking.self-liquidation.info.burn-amount', {
						targetCratio: formatPercent(percentageTargetCRatio),
						burnAmountToFixCRatio: formatSUSD(burnAmountToFixCRatio),
						balance: formatSUSD(sUSDBalance),
					})}
				</InfoText>
				<Link href={EXTERNAL_LINKS.Synthetix.SIP148Liquidations}>
					{t('staking.self-liquidation.info.liquidation-link-text')}
				</Link>
				{sUSDBalance.gt(0) ? (
					<>
						<InfoText>{t('staking.self-liquidation.info.balance-not-zero')}</InfoText>
						<ButtonWrapper>
							<BurnMaxButton amountToBurn={sUSDBalance} />
						</ButtonWrapper>
					</>
				) : (
					<>
						<InfoText>
							{t('staking.self-liquidation.info.self-liquidate-text', {
								selfLiquidationPenalty: formatPercent(
									liquidationDataQuery.data.selfLiquidationPenalty
								),
								amountToSelfLiquidate: formatCryptoCurrency(
									liquidationAmountsData.amountToSelfLiquidateUsd.div(SNXRate),
									{ currencyKey: 'SNX', minDecimals: 2 }
								),
								amountToSelfLiquidateUsd: formatNumber(
									liquidationAmountsData.amountToSelfLiquidateUsd,
									{ prefix: '$', minDecimals: 2 }
								),
							})}
						</InfoText>
						<ButtonWrapper>
							<SelfLiquidateTransactionButton
								disabled={sUSDBalance.gt(0)}
								walletAddress={walletAddress}
							/>
						</ButtonWrapper>
					</>
				)}
			</Container>
		</TabContainer>
	);
};
export default SelfLiquidateTab;

const Link = styled(StyledLink)`
	font-size: 14px;
`;
const Container = styled.div``;
const ButtonWrapper = styled.div`
	display: flex;
	justify-content: center;
`;
const InfoText = styled.p`
	max-width: 640px;
	font-size: 14px;
`;
