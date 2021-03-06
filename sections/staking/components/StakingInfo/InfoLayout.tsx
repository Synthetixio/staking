import { FC } from 'react';
import styled from 'styled-components';
import BigNumber from 'bignumber.js';
import { Trans, useTranslation } from 'react-i18next';
import { Svg } from 'react-optimized-image';

import ArrowRightIcon from 'assets/svg/app/arrow-right.svg';
import { formatCurrency } from 'utils/formatters/number';
import { EXTERNAL_LINKS } from 'constants/links';
import { FlexDivCentered } from 'styles/common';
import { CryptoCurrency } from 'constants/currency';

import BarStatsRow from './BarStatsRow';

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

type BarChartData = {
	title: string;
	value: BigNumber;
	changedValue: BigNumber;
	percentage: BigNumber;
	changedPercentage: BigNumber;
	currencyKey: CryptoCurrency;
};

type RowData = {
	title: string;
	value: BigNumber;
	changedValue: BigNumber;
	currencyKey: CryptoCurrency | string;
};

type StakingInfo = {
	barRows: BarChartData[];
	dataRows: RowData[];
};

type InfoLayoutProps = {
	stakingInfo: StakingInfo;
	collateral: BigNumber;
	isInputEmpty: boolean;
	infoType: 'mint' | 'burn' | 'clear';
};

const InfoLayout: FC<InfoLayoutProps> = ({ stakingInfo, collateral, isInputEmpty, infoType }) => {
	const title = () => {
		switch (infoType) {
			case 'mint':
				return t('staking.info.mint.title');
			case 'burn':
				return t('staking.info.burn.title');
			case 'clear':
				return t('staking.info.clear.title');
		}
	};

	const subtitle = () => {
		switch (infoType) {
			case 'mint':
				return 'staking.info.mint.subtitle';
			case 'burn':
				return 'staking.info.burn.subtitle';
			case 'clear':
				return 'staking.info.clear.subtitle';
		}
	};

	const { t } = useTranslation();
	return (
		<InfoContainer>
			<InfoHeader>
				<Title>{title()}</Title>
				<Subtitle>
					<Trans
						i18nKey={subtitle()}
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
