import { FC, useMemo } from 'react';
import styled from 'styled-components';
import { Trans, useTranslation } from 'react-i18next';
import { Svg } from 'react-optimized-image';
import { useRecoilValue } from 'recoil';

import ArrowRightIcon from 'assets/svg/app/arrow-right.svg';
import { formatCurrency } from 'utils/formatters/number';
import { EXTERNAL_LINKS } from 'constants/links';
import { FlexDivCentered } from 'styles/common';
import { CryptoCurrency, Synths } from 'constants/currency';

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
import useSynthsBalancesQuery from 'queries/walletBalances/useSynthsBalancesQuery';

import { toBigNumber, zeroBN } from 'utils/formatters/number';

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
	const synthsBalancesQuery = useSynthsBalancesQuery();

	const amountToBurn = useRecoilValue(amountToBurnState);

	const sUSDBalance =
		synthsBalancesQuery?.data?.balancesMap[Synths.sUSD]?.balance ?? toBigNumber(0);

	const stakingInfo = useMemo(() => {
		const calculatedTargetBurn = Math.max(debtBalance.minus(issuableSynths).toNumber(), 0);

		const amountToBurnBN = toBigNumber(amountToBurn);

		let unlockedStakeAmount;

		if (
			currentCRatio.isGreaterThan(targetCRatio) &&
			amountToBurnBN.isLessThanOrEqualTo(calculatedTargetBurn)
		) {
			unlockedStakeAmount = zeroBN;
		} else {
			unlockedStakeAmount = getStakingAmount(targetCRatio, amountToBurnBN, SNXRate);
		}

		const changedStakedValue = stakedCollateral.isZero()
			? zeroBN
			: stakedCollateral.minus(unlockedStakeAmount);

		const changedTransferable = getTransferableAmountFromBurn(
			amountToBurn,
			debtEscrowBalance,
			targetCRatio,
			SNXRate,
			transferableCollateral
		);

		const changedDebt = debtBalance.isZero() ? zeroBN : debtBalance.minus(amountToBurnBN);

		const changedSUSDBalance = sUSDBalance.minus(amountToBurnBN);

		const changeCRatio = toBigNumber(100).dividedBy(
			changedDebt.dividedBy(SNXRate).dividedBy(collateral)
		);

		return {
			barRows: [
				{
					title: t('staking.info.table.staked'),
					value: sanitiseValue(stakedCollateral),
					changedValue: sanitiseValue(changedStakedValue),
					percentage: collateral.isZero()
						? toBigNumber(0)
						: sanitiseValue(stakedCollateral).dividedBy(collateral),
					changedPercentage: collateral.isZero()
						? toBigNumber(0)
						: sanitiseValue(changedStakedValue).dividedBy(collateral),
					currencyKey: CryptoCurrency.SNX,
				},
				{
					title: t('staking.info.table.transferable'),
					value: sanitiseValue(transferableCollateral),
					changedValue: sanitiseValue(changedTransferable),
					percentage: collateral.isZero()
						? toBigNumber(0)
						: sanitiseValue(transferableCollateral).dividedBy(sanitiseValue(collateral)),
					changedPercentage: collateral.isZero()
						? toBigNumber(0)
						: sanitiseValue(changedTransferable).dividedBy(sanitiseValue(collateral)),
					currencyKey: CryptoCurrency.SNX,
				},
			],
			dataRows: [
				{
					title: t('staking.info.table.c-ratio'),
					value: sanitiseValue(toBigNumber(100).dividedBy(currentCRatio)),
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
						decimals: 2,
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
								decimals: 2,
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
									decimals: 2,
								})}
							</RowValue>
							{!isInputEmpty && (
								<>
									<StyledArrowRight src={ArrowRightIcon} />
									<RowValue>
										{formatCurrency(currencyKey, !changedValue.isNaN() ? changedValue : 0, {
											currencyKey: currencyKey,
											decimals: 2,
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
