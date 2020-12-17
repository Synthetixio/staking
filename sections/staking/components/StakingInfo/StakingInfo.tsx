import React, { useMemo } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { Svg } from 'react-optimized-image';
import { useRecoilValue } from 'recoil';

import ArrowRightIcon from 'assets/svg/app/arrow-right.svg';

import { amountToBurnState, amountToMintState } from 'store/staking';

import useStakingCalculations from 'sections/staking/hooks/useStakingCalculations';

import { formatCurrency, toBigNumber } from 'utils/formatters/number';

import { CryptoCurrency, Synths } from 'constants/currency';

import { EXTERNAL_LINKS } from 'constants/links';

import { getStakingAmount } from '../helper';

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
} from '../common';

type StakingInfoProps = {
	isMint: boolean;
};

const StakingInfo: React.FC<StakingInfoProps> = ({ isMint }) => {
	const { t } = useTranslation();
	const {
		unstakedCollateral,
		debtBalance,
		targetCRatio,
		currentCRatio,
		transferableCollateral,
		stakedCollateral,
		lockedCollateral,
		SNXRate,
		totalEscrowBalance,
		issuableSynths,
	} = useStakingCalculations();

	const amountToBurn = useRecoilValue(amountToBurnState);
	const amountToMint = useRecoilValue(amountToMintState);

	const Rows = useMemo(() => {
		const calculatedTargetBurn = Math.max(debtBalance.minus(issuableSynths).toNumber(), 0);

		const amountToMintBN = toBigNumber(amountToMint);
		const amountToBurnBN = toBigNumber(amountToBurn);

		let unlockedStakeAmount;

		if (
			!isMint &&
			currentCRatio.isGreaterThan(targetCRatio) &&
			amountToBurnBN.isLessThanOrEqualTo(calculatedTargetBurn)
		) {
			unlockedStakeAmount = toBigNumber(0);
		} else {
			unlockedStakeAmount = getStakingAmount(targetCRatio, amountToBurnBN, SNXRate);
		}

		const stakingAmount = getStakingAmount(targetCRatio, amountToMintBN, SNXRate);
		const mintAdditionalDebt = stakedCollateral
			.plus(stakingAmount)
			.multipliedBy(targetCRatio)
			.multipliedBy(SNXRate);
		const changedNotStakedValue = isMint
			? unstakedCollateral.minus(stakingAmount)
			: unstakedCollateral.plus(unlockedStakeAmount);
		const changedStakedValue = isMint
			? stakedCollateral.plus(stakingAmount)
			: stakedCollateral.minus(unlockedStakeAmount);
		const changedTransferable = isMint
			? transferableCollateral.minus(stakingAmount.minus(totalEscrowBalance))
			: transferableCollateral.plus(unlockedStakeAmount);
		const changedLocked = isMint
			? lockedCollateral.plus(stakingAmount)
			: lockedCollateral.minus(unlockedStakeAmount);
		const changeCRatio = isMint
			? changedStakedValue.multipliedBy(SNXRate).dividedBy(mintAdditionalDebt).multipliedBy(100)
			: stakedCollateral
					.multipliedBy(SNXRate)
					.dividedBy(debtBalance.minus(amountToBurnBN))
					.multipliedBy(100);
		const changedDebt = isMint
			? debtBalance.plus(mintAdditionalDebt)
			: debtBalance.minus(amountToBurnBN);

		return [
			{
				title: t('staking.info.table.not-staked'),
				value: unstakedCollateral.isNaN() ? toBigNumber(0) : unstakedCollateral,
				changedValue: changedNotStakedValue.isNaN() ? toBigNumber(0) : changedNotStakedValue,
				currencyKey: CryptoCurrency.SNX,
			},
			{
				title: t('staking.info.table.staked'),
				value: stakedCollateral.isNaN() ? toBigNumber(0) : stakedCollateral,
				changedValue: changedStakedValue.isNaN() ? toBigNumber(0) : changedStakedValue,
				currencyKey: CryptoCurrency.SNX,
			},
			{
				title: t('staking.info.table.transferable'),
				value: transferableCollateral.isNaN() ? toBigNumber(0) : transferableCollateral,
				changedValue: changedTransferable.isNaN() ? toBigNumber(0) : changedTransferable,
				currencyKey: CryptoCurrency.SNX,
			},
			{
				title: t('staking.info.table.locked'),
				value: lockedCollateral.isNaN() ? toBigNumber(0) : lockedCollateral,
				changedValue: changedLocked.isNaN() ? toBigNumber(0) : changedLocked,
				currencyKey: CryptoCurrency.SNX,
			},
			{
				title: t('staking.info.table.c-ratio'),
				value:
					currentCRatio.isNaN() || currentCRatio.isZero()
						? toBigNumber(0)
						: toBigNumber(100).dividedBy(currentCRatio),
				changedValue: changeCRatio.isNaN()
					? toBigNumber(0)
					: !changeCRatio.isFinite()
					? toBigNumber(0)
					: changeCRatio,
				currencyKey: '%',
			},
			{
				title: t('staking.info.table.debt'),
				value: debtBalance.isNaN() ? toBigNumber(0) : debtBalance,
				changedValue: changedDebt.isNaN() ? toBigNumber(0) : changedDebt,
				currencyKey: Synths.sUSD,
			},
		];
	}, [
		amountToBurn,
		amountToMint,
		t,
		isMint,
		SNXRate,
		currentCRatio,
		debtBalance,
		lockedCollateral,
		stakedCollateral,
		targetCRatio,
		totalEscrowBalance,
		transferableCollateral,
		unstakedCollateral,
		issuableSynths,
	]);

	const emptyInput = isMint ? amountToMint.length === 0 : amountToBurn.length === 0;

	return (
		<InfoContainer>
			<InfoHeader>
				<Title>{isMint ? t('staking.info.mint.title') : t('staking.info.burn.title')}</Title>
				<Subtitle>
					<Trans
						i18nKey={isMint ? 'staking.info.mint.subtitle' : 'staking.info.burn.subtitle'}
						components={[<StyledLink href={EXTERNAL_LINKS.Synthetix.Litepaper} />]}
					/>
				</Subtitle>
			</InfoHeader>
			<DataContainer>
				{Rows.map(({ title, value, changedValue, currencyKey = '' }, i) => (
					<DataRow key={i}>
						<RowTitle>{title}</RowTitle>
						<ValueContainer>
							<RowValue>
								{formatCurrency(currencyKey, value.toString(), {
									currencyKey: currencyKey,
									decimals: 2,
								})}
							</RowValue>
							{!emptyInput && (
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

const StyledArrowRight = styled(Svg)`
	margin: 0 5px;
	color: ${(props) => props.theme.colors.blue};
`;

export default StakingInfo;
