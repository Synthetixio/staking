import { FC } from 'react';
import styled, { useTheme } from 'styled-components';
import { useTranslation } from 'react-i18next';

import { FlexDivColCentered, FlexDivRowCentered } from 'styles/common';
import SNXStatBackground from 'assets/svg/app/snx-stat-background.svg';
import { formatFiatCurrency } from 'utils/formatters/number';
import { DEFAULT_FIAT_DECIMALS } from 'constants/defaults';

interface SingleStatBoxProps {
	synthValue?: number;
	transactionCount?: number;
}

const SingleStatBox: FC<SingleStatBoxProps> = ({ synthValue, transactionCount }) => {
	const { t } = useTranslation();
	const theme = useTheme();
	return (
		<StatsSection>
			{synthValue ? (
				<StatBox
					key={'synthValue'}
					style={{
						backgroundImage: `url(${SNXStatBackground})`,
					}}
				>
					<StatTitle titleColor={theme.colors.brightGreen}>
						{t('common.stat-box.synth-value')}
					</StatTitle>
					<NeonValue>
						{' '}
						{formatFiatCurrency(synthValue, { sign: '$', maxDecimals: DEFAULT_FIAT_DECIMALS })}
					</NeonValue>
				</StatBox>
			) : transactionCount ? (
				<StatBox
					key={'txCount'}
					style={{
						backgroundImage: `url(${SNXStatBackground})`,
					}}
				>
					<StatTitle titleColor={theme.colors.brightGreen}>
						{t('common.stat-box.tx-count')}
					</StatTitle>
					<NeonValue>{transactionCount}</NeonValue>
				</StatBox>
			) : null}
		</StatsSection>
	);
};

const StatsSection = styled(FlexDivRowCentered)`
	width: 100%;
	justify-content: center;
	margin: 0 auto;
`;

const StatBox = styled(FlexDivColCentered)`
	height: 200px;
	width: 400px;
	background-image: url('assets/svg/snx-stat-background.svg');
	background-position: center;
	background-repeat: no-repeat;
	justify-content: center;
	margin: 0px 20px;
`;

const StatTitle = styled.p<{ titleColor: string }>`
	font-family: ${(props) => props.theme.fonts.condensedMedium};
	font-size: 14px;
	color: ${(props) => props.titleColor};
	margin: 0;
`;

const NeonValue = styled.p`
	font-family: ${(props) => props.theme.fonts.expanded};
	font-size: 42px;
	margin: 0;
	/* text-shadow: rgba(0, 209, 255, 0.35) 0px 0px 4px, rgba(0, 209, 255, 0.35) 0px 0px 4px,
		rgba(0, 209, 255, 0.35) 0px 0px 4px, rgba(0, 209, 255, 0.35) 0px 0px 4px,
		rgba(0, 209, 255, 0.35) 0px 0px 4px, rgba(0, 209, 255, 0.35) 0px 0px 4px; */
	text-shadow: rgba(65, 199, 157, 1) 0px 0px 4px, rgba(65, 199, 157, 1) 0px 0px 4px,
		rgba(65, 199, 157, 1) 0px 0px 4px, rgba(65, 199, 157, 1) 0px 0px 4px,
		rgba(65, 199, 157, 1) 0px 0px 4px, rgba(65, 199, 157, 1) 0px 0px 4px;
	color: #073124;
`;

export default SingleStatBox;
