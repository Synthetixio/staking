import SelfLiquidateTransactionButton from 'components/SelfLiquidateTransactionButton';
import BurnMaxButton from './BurnMaxButton';
import { EXTERNAL_LINKS } from 'constants/links';
import { StyledLink } from 'sections/staking/components/common';
import { formatCryptoCurrency, formatNumber, formatPercent } from 'utils/formatters/number';
import Wei, { WeiSource } from '@synthetixio/wei';
import { useTranslation } from 'react-i18next';
import { Synths } from 'constants/currency';
import styled from 'styled-components';
import Loader from 'components/Loader';
import { FlexDivJustifyCenter } from 'styles/common';

const formatSUSD = (val: WeiSource) =>
	formatCryptoCurrency(val, {
		sign: '$',
		currencyKey: Synths.sUSD,
		minDecimals: 2,
	});

const SelfLiquidationTabContent: React.FC<{
	percentageCurrentCRatio: Wei;
	percentageTargetCRatio: Wei;
	burnAmountToFixCRatio: Wei;
	sUSDBalance: Wei;
	selfLiquidationPenalty?: Wei;
	liquidationPenalty?: Wei;
	walletAddress: string;
	isDelegateWallet: boolean;
	SNXRate: Wei;
	amountToSelfLiquidateUsd?: Wei;
}> = ({
	isDelegateWallet,
	percentageCurrentCRatio,
	percentageTargetCRatio,
	burnAmountToFixCRatio,
	selfLiquidationPenalty,
	liquidationPenalty,
	walletAddress,
	sUSDBalance,
	SNXRate,
	amountToSelfLiquidateUsd,
}) => {
	const { t } = useTranslation();

	if (isDelegateWallet) {
		return (
			<Container>
				<InfoText>{t('staking.self-liquidation.info.delegate-wallet')}</InfoText>
				<Link href={EXTERNAL_LINKS.Synthetix.SIP148Liquidations}>
					{t('staking.self-liquidation.info.liquidation-link-text')}
				</Link>
			</Container>
		);
	}
	if (percentageCurrentCRatio.gt(percentageTargetCRatio)) {
		return (
			<Container>
				<InfoText>
					{t('staking.self-liquidation.info.c-ratio-ok', {
						cRatio: formatPercent(percentageCurrentCRatio),
						targetCRatio: formatPercent(percentageTargetCRatio),
					})}
				</InfoText>
				<Link href={EXTERNAL_LINKS.Synthetix.SIP148Liquidations}>
					{t('staking.self-liquidation.info.liquidation-link-text')}
				</Link>
			</Container>
		);
	}

	if (sUSDBalance.lt(burnAmountToFixCRatio)) {
		return (
			<Container>
				<InfoText>
					{t('staking.self-liquidation.info.enough-susd-balance', {
						targetCRatio: formatPercent(percentageTargetCRatio),
						burnAmountToFixCRatio: formatSUSD(burnAmountToFixCRatio),
						balance: formatSUSD(sUSDBalance),
					})}
				</InfoText>
				<Link href={EXTERNAL_LINKS.Synthetix.SIP148Liquidations}>
					{t('staking.self-liquidation.info.liquidation-link-text')}
				</Link>
			</Container>
		);
	}

	if (!selfLiquidationPenalty || !liquidationPenalty || !amountToSelfLiquidateUsd)
		return (
			<FlexDivJustifyCenter>
				<Loader inline />
			</FlexDivJustifyCenter>
		);
	return (
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
							selfLiquidationPenalty: formatPercent(selfLiquidationPenalty),
							amountToSelfLiquidate: formatCryptoCurrency(amountToSelfLiquidateUsd.div(SNXRate), {
								currencyKey: 'SNX',
								minDecimals: 2,
							}),
							amountToSelfLiquidateUsd: formatNumber(amountToSelfLiquidateUsd, {
								prefix: '$',
								minDecimals: 2,
							}),
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
	);
};

const Link = styled(StyledLink)`
	font-size: 14px;
`;
const Container = styled.div`
	width: 100%;
`;
const ButtonWrapper = styled.div`
	display: flex;
	justify-content: center;
`;
const InfoText = styled.p`
	max-width: 640px;
	font-size: 14px;
`;
export default SelfLiquidationTabContent;
