import React, { useMemo } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import { FlexDivCol, ExternalLink } from 'styles/common';
import {
	Title,
	Subtitle,
	DataContainer,
	DataRow,
	RowTitle,
	RowValue,
	ValueContainer,
} from '../common';
import { Svg } from 'react-optimized-image';
import Arrows from 'assets/svg/app/arrows.svg';

interface BurnInfoProps {
	unstakedCollateral: number;
	stakedCollateral: number;
	currentCRatio: number;
	transferableCollateral: number;
	debtBalance: number;
	lockedCollateral: number;
	amountToStake: string | null;
	targetCRatio: number;
}

const BurnInfo: React.FC<BurnInfoProps> = ({
	unstakedCollateral,
	stakedCollateral,
	transferableCollateral,
	currentCRatio,
	debtBalance,
	lockedCollateral,
	amountToStake,
	targetCRatio,
}) => {
	const { t } = useTranslation();
	const amountToStakeNum = Number(amountToStake);
	const changeInCollateral = stakedCollateral + amountToStakeNum;
	const changeInDebt = debtBalance + changeInCollateral / (1 / targetCRatio);

	const Rows = useMemo(
		() => [
			{
				title: t('staking.info.mint.table.not-staked'),
				value: unstakedCollateral,
				changedValue: unstakedCollateral - amountToStakeNum,
			},
			{
				title: t('staking.info.mint.table.staked'),
				value: stakedCollateral,
				changedValue: changeInCollateral,
			},
			{
				title: t('staking.info.mint.table.transferable'),
				value: transferableCollateral,
				changedValue: transferableCollateral - amountToStakeNum,
			},
			{
				title: t('staking.info.mint.table.locked'),
				value: lockedCollateral,
				changedValue: lockedCollateral + amountToStakeNum,
			},
			{
				title: t('staking.info.mint.table.c-ratio'),
				value: 100 / currentCRatio,
				changedValue: (changeInCollateral / changeInDebt) * 100,
			},
			{
				title: t('staking.info.mint.table.debt'),
				value: debtBalance,
				changedValue: changeInDebt,
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
			t,
		]
	);
	return (
		<FlexDivCol>
			<Title>{t('staking.info.mint.title')}</Title>
			<Subtitle>
				<Trans i18nKey="staking.info.mint.subtitle" components={[<ExternalLink />]} />
			</Subtitle>
			<DataContainer>
				{Rows.map((row, i) => (
					<DataRow key={i}>
						<RowTitle>{row.title}</RowTitle>
						<ValueContainer>
							<RowValue>{row.value}</RowValue>
							{unstakedCollateral > 0 && amountToStake && row.changedValue > 0 && (
								<>
									<Svg src={Arrows} /> <RowValue>{row.changedValue}</RowValue>
								</>
							)}
						</ValueContainer>
					</DataRow>
				))}
			</DataContainer>
		</FlexDivCol>
	);
};

export default BurnInfo;
