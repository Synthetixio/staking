import useSynthetixQueries from '@synthetixio/queries';
import Wei, { wei } from '@synthetixio/wei';
import Button from 'components/Button';
import { EXTERNAL_LINKS } from 'constants/links';
import React, { useState } from 'react';
import { useRecoilValue } from 'recoil';
import TxConfirmationModal from 'sections/shared/modals/TxConfirmationModal';
import { delegateWalletState, walletAddressState } from 'store/wallet';
import styled from 'styled-components';
import {
	ExternalLink,
	LineSpacer,
	ModalContent,
	ModalItem,
	ModalItemTitle,
	ModalItemText,
} from 'styles/common';
import { formatShortDateWithTime } from 'utils/formatters/date';
import { formatCryptoCurrency, formatPercent, isZero } from 'utils/formatters/number';
import { Svg } from 'react-optimized-image';
import WarningIcon from 'assets/svg/app/warning.svg';
import { useTranslation } from 'react-i18next';
import { Trans } from 'react-i18next';
import useLiquidationAmountToFixCollateral from 'hooks/useLiquidationAmountToFixCollateral';

const SelfLiquidationText: React.FC<{
	totalSNXBalance: Wei;
	amountToBeSelfLiquidated: Wei;
	amountOfNonSelfLiquidation: Wei;
	escrowedSnx: Wei;
	SNXRate: Wei;
	selfLiquidationPenalty: Wei;
	targetCRatio: Wei;
}> = ({
	totalSNXBalance,
	amountToBeSelfLiquidated,
	amountOfNonSelfLiquidation,
	escrowedSnx,
	SNXRate,
	selfLiquidationPenalty,
	targetCRatio,
}) => {
	const nonEscrowedSNX = totalSNXBalance.sub(escrowedSnx);
	// If SNX rate is 0 we need to wait for data
	if (isZero(SNXRate)) return null;
	const snxToBeSelfLiquidated = amountToBeSelfLiquidated.div(SNXRate);
	const snxToBeLiquidated = amountOfNonSelfLiquidation.div(SNXRate);
	const formatSNX = (amount: Wei) =>
		formatCryptoCurrency(amount, {
			currencyKey: 'SNX',
			maxDecimals: 2,
			minDecimals: 2,
		});

	if (snxToBeSelfLiquidated.lt(nonEscrowedSNX)) {
		return (
			<InfoText>
				Self liquidating will cause a loss of {formatSNX(snxToBeSelfLiquidated)}, if someone else
				liquidates you, you would lose {formatSNX(snxToBeLiquidated)}
			</InfoText>
		);
	}
	return (
		<InfoText>
			Self liquidating would cause you to lose all your none escrowed SNX. With the self liquidation
			penalty of {formatPercent(selfLiquidationPenalty)} you would need{' '}
			{formatSNX(snxToBeSelfLiquidated)} to get back to {formatPercent(targetCRatio)}. Your non
			escrowed balance is {formatSNX(nonEscrowedSNX)}
		</InfoText>
	);
};

const FlagWarningText: React.FC<{
	liquidationDeadlineForAccount: Wei;
	percentageTargetCRatio: Wei;
}> = ({ liquidationDeadlineForAccount, percentageTargetCRatio }) => {
	const { t } = useTranslation();
	return (
		<>
			<Title>{t('staking.flag-warning.title')}</Title>
			<InfoText>
				<Trans
					i18nKey={'staking.flag-warning.info'}
					components={[
						<Strong />,
						<StyledExternalLink href={EXTERNAL_LINKS.Synthetix.SIP148Liquidations} />,
					]}
					values={{
						deadlineDate: formatShortDateWithTime(liquidationDeadlineForAccount.toNumber() * 1000),
						percentageTargetCRatio: formatPercent(percentageTargetCRatio),
					}}
				/>
			</InfoText>
		</>
	);
};
const CratioUnderLiquidationRatioWarning: React.FC<{
	currentCRatioPercent: Wei;
	liquidationRatioPercent: Wei;
	liquidationDelay: Wei;
}> = ({ currentCRatioPercent, liquidationDelay, liquidationRatioPercent }) => {
	return (
		<>
			<Title>Low C-Ratio</Title>
			<InfoText>
				{`Your C-Ratio (${formatPercent(
					currentCRatioPercent
				)}) is below the liquidation C-Ratio ${formatPercent(
					liquidationRatioPercent
				)}. This means you might get flagged. If you get flagged you have ${Math.round(
					(liquidationDelay.toNumber() * 1e18) / 60 / 60
				)} hours before someone can liquidate you.`}
			</InfoText>
		</>
	);
};
const SelfLiquidation: React.FC<{
	percentageTargetCRatio: Wei;
	currentCRatio: Wei;
	totalSNXBalance: Wei;
	debtBalance: Wei;
	escrowedSnx: Wei;
	SNXRate: Wei;
}> = ({
	percentageTargetCRatio,
	currentCRatio,
	totalSNXBalance,
	escrowedSnx,
	SNXRate,
	debtBalance,
}) => {
	const { t } = useTranslation();
	const { useGetLiquidationDataQuery, useSynthetixTxn } = useSynthetixQueries();
	const [txModalOpen, setTxModalOpen] = useState<boolean>(false);

	const walletAddress = useRecoilValue(walletAddressState);
	const delegateWallet = useRecoilValue(delegateWalletState);
	const addressToUse = delegateWallet?.address || walletAddress!;

	const liquidationQuery = useGetLiquidationDataQuery(addressToUse);
	const liquidationData = liquidationQuery.data;
	const liquidationAmountsToFixCollateralQuery = useLiquidationAmountToFixCollateral(
		debtBalance,
		totalSNXBalance?.mul(SNXRate),
		liquidationData?.selfLiquidationPenalty,
		liquidationData?.liquidationPenalty
	);

	const liquidationAmountsToFixCollateral = liquidationAmountsToFixCollateralQuery.data;

	const txn = useSynthetixTxn('Synthetix', 'liquidateSelf');

	// You cant self liquidate with delegation
	if (delegateWallet?.address) return null;
	// Wait for data
	if (liquidationData === undefined || liquidationAmountsToFixCollateral === undefined) return null;

	const liquidationDeadlineForAccount = liquidationData.liquidationDeadlineForAccount;
	const notBeenFlagged = liquidationDeadlineForAccount.eq(0);

	const currentCratioPercent = wei(1).div(isZero(currentCRatio) ? 1 : currentCRatio); //0.3333333 = 3
	const liquidationRatioPercent = wei(1).div(
		isZero(liquidationData.liquidationRatio) ? 1 : liquidationData.liquidationRatio
	); //0.6666 = 1.50
	const currentCRatioBelowLiquidationCRatio = currentCratioPercent.gt(liquidationRatioPercent);
	// Only render if flagged or below LiquidationCratio
	if (notBeenFlagged && currentCRatioBelowLiquidationCRatio) return null;

	return (
		<>
			<Container>
				<Svg src={WarningIcon} />
				{notBeenFlagged ? (
					<CratioUnderLiquidationRatioWarning
						currentCRatioPercent={currentCratioPercent}
						liquidationRatioPercent={liquidationRatioPercent}
						liquidationDelay={liquidationData.liquidationDelay}
					/>
				) : (
					<FlagWarningText
						liquidationDeadlineForAccount={liquidationDeadlineForAccount}
						percentageTargetCRatio={percentageTargetCRatio}
					/>
				)}

				<SelfLiquidationText
					totalSNXBalance={totalSNXBalance}
					amountToBeSelfLiquidated={liquidationAmountsToFixCollateral.amountToSelfLiquidateUsd}
					amountOfNonSelfLiquidation={liquidationAmountsToFixCollateral.amountToLiquidateUsd}
					escrowedSnx={escrowedSnx}
					SNXRate={SNXRate}
					selfLiquidationPenalty={liquidationData.selfLiquidationPenalty}
					targetCRatio={percentageTargetCRatio}
				/>

				<StyledButton
					variant={'primary'}
					onClick={() => {
						setTxModalOpen(true);
						txn.mutate();
					}}
				>
					{t('staking.flag-warning.self-liquidate')}
				</StyledButton>
				<LineSpacer />
			</Container>
			{txModalOpen && (
				<TxConfirmationModal
					onDismiss={() => setTxModalOpen(false)}
					txError={txn.errorMessage}
					attemptRetry={txn.mutate}
					content={
						<ModalContent>
							<ModalItem>
								<ModalItemTitle> {t('staking.flag-warning.self-liquidating')}</ModalItemTitle>
								<ModalItemText>{walletAddress}</ModalItemText>
							</ModalItem>
						</ModalContent>
					}
				/>
			)}
		</>
	);
};

const StyledButton = styled(Button)`
	margin-bottom: 30px;
`;

const Strong = styled.strong`
	font-family: ${(props) => props.theme.fonts.condensedBold};
`;
const StyledExternalLink = styled(ExternalLink)`
	color: ${(props) => props.theme.colors.blue};
`;
const Container = styled.div`
	display: flex;
	flex-direction: column;
	align-items: center;
`;
const InfoText = styled.p`
	max-width: 640px;
	font-size: 14px;
`;
const Title = styled.h3`
	font-family: ${(props) => props.theme.fonts.condensedBold};
	color: ${(props) => props.theme.colors.white};
	font-size: 16px;
	margin: 8px 24px;
`;

export default SelfLiquidation;
