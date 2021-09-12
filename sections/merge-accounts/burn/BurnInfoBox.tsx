import { FC, useMemo } from 'react';
import styled from 'styled-components';
import { Trans, useTranslation } from 'react-i18next';
import { Svg } from 'react-optimized-image';
import { useRecoilValue } from 'recoil';
import useSynthetixQueries from '@synthetixio/queries';
import { wei } from '@synthetixio/wei';

import ArrowRightIcon from 'assets/svg/app/arrow-right.svg';
import { formatCurrency } from 'utils/formatters/number';
import { EXTERNAL_LINKS } from 'constants/links';
import { FlexDivCentered } from 'styles/common';
import { CryptoCurrency, Synths } from 'constants/currency';
import { walletAddressState } from 'store/wallet';
import { parseSafeWei } from 'utils/parse';

import BarStatsRow from 'sections/staking/components/StakingInfo/BarStatsRow';

import {
	Title,
	Subtitle,
	StyledLink,
	DataContainer,
	DataRow,
	RowTitle,
	RowValue,
	ValueContainer,
	InfoContainer,
	InfoHeader,
} from 'sections/staking/components/common';

import { amountToBurnState } from 'store/staking';

import useStakingCalculations from 'sections/staking/hooks/useStakingCalculations';

import {
	getStakingAmount,
	getTransferableAmountFromBurn,
	sanitiseValue,
} from 'sections/staking/components/helper';

type InfoLayoutProps = {};

const InfoLayout: FC<InfoLayoutProps> = () => {
	const { t } = useTranslation();

	const {
		debtBalance,
		targetCRatio,
		currentCRatio,
		transferableCollateral,
		stakedCollateral,
		SNXRate,
		issuableSynths,
		debtEscrowBalance,
		collateral,
	} = useStakingCalculations();

	const walletAddress = useRecoilValue(walletAddressState);
	const { useSynthsBalancesQuery } = useSynthetixQueries();

	const synthsBalancesQuery = useSynthsBalancesQuery(walletAddress);

	const amountToBurn = useRecoilValue(amountToBurnState);

	const sUSDBalance = synthsBalancesQuery?.data?.balancesMap[Synths.sUSD]?.balance ?? wei(0);

	const stakingInfo = useMemo(() => {
		const calculatedTargetBurn = Math.max(debtBalance.sub(issuableSynths).toNumber(), 0);

		let amountToBurnBN = parseSafeWei(amountToBurn, 0);

		let unlockedStakeAmount;

		if (currentCRatio.gt(targetCRatio) && amountToBurnBN.lte(calculatedTargetBurn)) {
			unlockedStakeAmount = wei(0);
		} else {
			unlockedStakeAmount = getStakingAmount(targetCRatio, amountToBurnBN, SNXRate);
		}

		const changedStakedValue = stakedCollateral.eq(0)
			? wei(0)
			: stakedCollateral.sub(unlockedStakeAmount);

		const changedTransferable = getTransferableAmountFromBurn(
			amountToBurn,
			debtEscrowBalance,
			targetCRatio,
			SNXRate,
			transferableCollateral
		);

		const changedDebt = debtBalance.eq(0) ? wei(0) : debtBalance.sub(amountToBurnBN);

		const changedSUSDBalance = sUSDBalance.sub(amountToBurnBN);

		const changeCRatio =
			SNXRate.eq(0) || collateral.eq(0) || changedDebt.eq(0)
				? wei(0)
				: wei(100).div(changedDebt.div(SNXRate).div(collateral));

		return {
			barRows: [
				{
					title: t('staking.info.table.staked'),
					value: sanitiseValue(stakedCollateral),
					changedValue: sanitiseValue(changedStakedValue),
					percentage: collateral.eq(0) ? wei(0) : sanitiseValue(stakedCollateral).div(collateral),
					changedPercentage: collateral.eq(0)
						? wei(0)
						: sanitiseValue(changedStakedValue).div(collateral),
					currencyKey: CryptoCurrency.SNX,
				},
				{
					title: t('staking.info.table.transferable'),
					value: sanitiseValue(transferableCollateral),
					changedValue: sanitiseValue(changedTransferable),
					percentage: collateral.eq(0)
						? wei(0)
						: sanitiseValue(transferableCollateral).div(sanitiseValue(collateral)),
					changedPercentage: collateral.eq(0)
						? wei(0)
						: sanitiseValue(changedTransferable).div(sanitiseValue(collateral)),
					currencyKey: CryptoCurrency.SNX,
				},
			],
			dataRows: [
				{
					title: t('staking.info.table.c-ratio'),
					value: currentCRatio.eq(0) ? wei(0) : sanitiseValue(wei(100).div(currentCRatio)),
					changedValue: sanitiseValue(changeCRatio),
					currencyKey: '%',
				},
				{
					title: t('staking.info.table.susd-balance'),
					value: sanitiseValue(sUSDBalance),
					changedValue: sanitiseValue(changedSUSDBalance),
				},
				{
					title: t('staking.info.table.debt'),
					value: sanitiseValue(debtBalance),
					changedValue: sanitiseValue(changedDebt),
					currencyKey: Synths.sUSD,
				},
			],
		};
	}, [
		amountToBurn,
		t,
		SNXRate,
		currentCRatio,
		debtBalance,
		stakedCollateral,
		targetCRatio,
		transferableCollateral,
		issuableSynths,
		collateral,
		debtEscrowBalance,
		sUSDBalance,
	]);

	const isInputEmpty = amountToBurn.length === 0;

	return (
		<InfoContainer>
			<InfoHeader>
				<Title>{t('merge-accounts.nominate.info.title')}</Title>
				<Subtitle>
					<Trans
						i18nKey={t('merge-accounts.nominate.info.description')}
						components={[<StyledLink href={EXTERNAL_LINKS.Synthetix.Litepaper} />]}
					/>
				</Subtitle>
			</InfoHeader>
			<TotalBalanceContainer>
				<TotalBalanceHeading>{t('staking.info.table.total-snx')}</TotalBalanceHeading>
				<RowValue>
					{formatCurrency(CryptoCurrency.SNX, collateral, {
						currencyKey: CryptoCurrency.SNX,
						minDecimals: 2,
						maxDecimals: 2,
					})}
				</RowValue>
			</TotalBalanceContainer>
			<DataContainer>
				{stakingInfo.barRows.map(
					({ title, value, changedValue, percentage, changedPercentage, currencyKey }, i) => (
						<BarStatsRow
							key={`bar-stats-row-${i}`}
							title={title}
							value={formatCurrency(currencyKey, isInputEmpty ? value : changedValue, {
								currencyKey: currencyKey,
								minDecimals: 2,
								maxDecimals: 2,
							})}
							percentage={isInputEmpty ? percentage.toNumber() : changedPercentage.toNumber()}
						/>
					)
				)}
				{stakingInfo.dataRows.map(({ title, value, changedValue, currencyKey = '' }, i) => (
					<DataRow key={i}>
						<RowTitle>{title}</RowTitle>
						<ValueContainer>
							<RowValue>
								{formatCurrency(currencyKey, value.toString(), {
									currencyKey: currencyKey,
									minDecimals: 2,
									maxDecimals: 2,
								})}
							</RowValue>
							{!isInputEmpty && (
								<>
									<StyledArrowRight src={ArrowRightIcon} />
									<RowValue>
										{formatCurrency(currencyKey, changedValue, {
											currencyKey: currencyKey,
											minDecimals: 2,
											maxDecimals: 2,
										})}
									</RowValue>
								</>
							)}
						</ValueContainer>
					</DataRow>
				))}
			</DataContainer>
		</InfoContainer>
	);
};

const TotalBalanceHeading = styled(RowTitle)`
	border-bottom: none;
	color: ${(props) => props.theme.colors.white};
`;

const StyledArrowRight = styled(Svg)`
	margin: 0 5px;
	color: ${(props) => props.theme.colors.blue};
`;

const TotalBalanceContainer = styled(FlexDivCentered)`
	padding: 0px 24px;
	justify-content: space-between;
	border-bottom: ${(props) => `1px solid ${props.theme.colors.grayBlue}`};
`;

export default InfoLayout;
