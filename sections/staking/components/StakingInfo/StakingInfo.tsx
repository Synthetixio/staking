import React, { useMemo } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { Svg } from 'react-optimized-image';
import { useRecoilValue } from 'recoil';
import BigNumber from 'bignumber.js';

import ArrowRightIcon from 'assets/svg/app/arrow-right.svg';

import { amountToBurnState, amountToMintState } from 'store/staking';

import useStakingCalculations from 'sections/staking/hooks/useStakingCalculations';

import { formatCurrency, toBigNumber, zeroBN, minBN } from 'utils/formatters/number';

import { CryptoCurrency, Synths } from 'constants/currency';

import { EXTERNAL_LINKS } from 'constants/links';

import {
	getStakingAmount,
	getTransferableAmountFromBurn,
	getTransferableAmountFromMint,
} from '../helper';

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
		issuableSynths,
		debtEscrowBalance,
		collateral,
		balance,
	} = useStakingCalculations();

	const amountToBurn = useRecoilValue(amountToBurnState);
	const amountToMint = useRecoilValue(amountToMintState);

	const sanitiseValue = (value: BigNumber) => {
		if (value.isNegative() || value.isNaN() || !value.isFinite()) {
			return zeroBN;
		} else {
			return value;
		}
	};

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
			unlockedStakeAmount = zeroBN;
		} else {
			unlockedStakeAmount = getStakingAmount(targetCRatio, amountToBurnBN, SNXRate);
		}

		const stakingAmount = getStakingAmount(targetCRatio, amountToMintBN, SNXRate);

		const mintAdditionalDebt = stakedCollateral
			.plus(stakingAmount)
			.multipliedBy(targetCRatio)
			.multipliedBy(SNXRate);

		const changedNotStakedValue = isMint
			? unstakedCollateral.isZero()
				? zeroBN
				: unstakedCollateral.minus(stakingAmount)
			: unstakedCollateral.plus(unlockedStakeAmount);

		const changedStakedValue = isMint
			? stakedCollateral.plus(stakingAmount)
			: stakedCollateral.isZero()
			? zeroBN
			: stakedCollateral.minus(unlockedStakeAmount);

		const changedTransferable = isMint
			? transferableCollateral.isZero()
				? zeroBN
				: getTransferableAmountFromMint(balance, changedStakedValue)
			: getTransferableAmountFromBurn(
					amountToBurn,
					debtEscrowBalance,
					targetCRatio,
					SNXRate,
					transferableCollateral
			  );

		const changedLocked = isMint
			? minBN(collateral, lockedCollateral.plus(stakingAmount))
			: lockedCollateral.isZero()
			? zeroBN
			: collateral.minus(changedTransferable);

		const changedDebt = isMint
			? mintAdditionalDebt
			: debtBalance.isZero()
			? zeroBN
			: debtBalance.minus(amountToBurnBN);

		const changeCRatio = isMint
			? currentCRatio.isLessThan(targetCRatio)
				? unstakedCollateral
						.plus(stakedCollateral)
						.multipliedBy(SNXRate)
						.dividedBy(mintAdditionalDebt)
						.multipliedBy(100)
				: changedStakedValue.multipliedBy(SNXRate).dividedBy(mintAdditionalDebt).multipliedBy(100)
			: toBigNumber(100).dividedBy(changedDebt.dividedBy(SNXRate).dividedBy(collateral));

		return [
			{
				title: t('staking.info.table.not-staked'),
				value: sanitiseValue(unstakedCollateral),
				changedValue: sanitiseValue(changedNotStakedValue),
				currencyKey: CryptoCurrency.SNX,
			},
			{
				title: t('staking.info.table.staked'),
				value: sanitiseValue(stakedCollateral),
				changedValue: sanitiseValue(changedStakedValue),
				currencyKey: CryptoCurrency.SNX,
			},
			{
				title: t('staking.info.table.transferable'),
				value: sanitiseValue(transferableCollateral),
				changedValue: sanitiseValue(changedTransferable),
				currencyKey: CryptoCurrency.SNX,
			},
			{
				title: t('staking.info.table.locked'),
				value: sanitiseValue(lockedCollateral),
				changedValue: sanitiseValue(changedLocked),
				currencyKey: CryptoCurrency.SNX,
			},
			{
				title: t('staking.info.table.c-ratio'),
				value: sanitiseValue(toBigNumber(100).dividedBy(currentCRatio)),
				changedValue: sanitiseValue(changeCRatio),
				currencyKey: '%',
			},
			{
				title: t('staking.info.table.debt'),
				value: sanitiseValue(debtBalance),
				changedValue: sanitiseValue(changedDebt),
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
		transferableCollateral,
		unstakedCollateral,
		issuableSynths,
		balance,
		collateral,
		debtEscrowBalance,
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
