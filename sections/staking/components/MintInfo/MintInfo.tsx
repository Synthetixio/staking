import React, { useMemo } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import { FlexDivCol } from 'styles/common';
import {
	Title,
	Subtitle,
	DataContainer,
	DataRow,
	RowTitle,
	RowValue,
	ValueContainer,
	StyledLink,
} from '../common';
import { Svg } from 'react-optimized-image';
import Arrows from 'assets/svg/app/arrows.svg';
import { formatCurrency } from 'utils/formatters/number';
import { CRYPTO_CURRENCY_MAP, SYNTHS_MAP } from 'constants/currency';

interface MintInfoProps {
	unstakedCollateral: number;
	stakedCollateral: number;
	currentCRatio: number;
	transferableCollateral: number;
	debtBalance: number;
	lockedCollateral: number;
	amountToStake: string | null;
	targetCRatio: number;
	SNXRate: number;
}

const MintInfo: React.FC<MintInfoProps> = ({
	unstakedCollateral,
	stakedCollateral,
	transferableCollateral,
	currentCRatio,
	debtBalance,
	lockedCollateral,
	amountToStake,
	targetCRatio,
	SNXRate,
}) => {
	const { t } = useTranslation();
	const amountToStakeNum = Number(amountToStake);
	const changeInCollateral = stakedCollateral + amountToStakeNum;
	const newDebt = changeInCollateral * targetCRatio * SNXRate;
	const changeInDebt = debtBalance + newDebt;

	const Rows = useMemo(
		() => [
			{
				title: t('staking.info.mint.table.not-staked'),
				value: unstakedCollateral,
				changedValue: unstakedCollateral - amountToStakeNum,
				currencyKey: CRYPTO_CURRENCY_MAP.SNX,
			},
			{
				title: t('staking.info.mint.table.staked'),
				value: stakedCollateral,
				changedValue: changeInCollateral,
				currencyKey: CRYPTO_CURRENCY_MAP.SNX,
			},
			{
				title: t('staking.info.mint.table.transferable'),
				value: transferableCollateral,
				changedValue: transferableCollateral - amountToStakeNum,
				currencyKey: CRYPTO_CURRENCY_MAP.SNX,
			},
			{
				title: t('staking.info.mint.table.locked'),
				value: lockedCollateral,
				changedValue: lockedCollateral + amountToStakeNum,
				currencyKey: CRYPTO_CURRENCY_MAP.SNX,
			},
			{
				title: t('staking.info.mint.table.c-ratio'),
				value: currentCRatio ?? 100 / currentCRatio,
				changedValue: Math.round(((changeInCollateral * SNXRate) / changeInDebt) * 100),
				currencyKey: '%',
			},
			{
				title: t('staking.info.mint.table.debt'),
				value: debtBalance,
				changedValue: changeInDebt,
				currencyKey: SYNTHS_MAP.sUSD,
			},
		],
		[
			unstakedCollateral,
			stakedCollateral,
			transferableCollateral,
			currentCRatio,
			amountToStakeNum,
			lockedCollateral,
			changeInDebt,
			debtBalance,
			changeInCollateral,
			SNXRate,
			t,
		]
	);
	return (
		<FlexDivCol>
			<Title>{t('staking.info.mint.title')}</Title>
			<Subtitle>
				<Trans i18nKey="staking.info.mint.subtitle" components={[<StyledLink />]} />
			</Subtitle>
			<DataContainer>
				{Rows.map(({ title, value, changedValue, currencyKey = '' }, i) => (
					<DataRow key={i}>
						<RowTitle>{title}</RowTitle>
						<ValueContainer>
							<RowValue>
								{formatCurrency(currencyKey, value, { currencyKey: currencyKey, decimals: 2 })}
							</RowValue>
							{unstakedCollateral > 0 && amountToStake && changedValue >= 0 && (
								<>
									<Svg src={Arrows} />{' '}
									<RowValue>
										{formatCurrency(currencyKey, changedValue, {
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
		</FlexDivCol>
	);
};

export default MintInfo;
