import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import styled, { useTheme } from 'styled-components';
import { AreaChart, Area, Tooltip } from 'recharts';
import formatDate from 'date-fns/format';

import useHistoricalDebtData from 'hooks/useHistoricalDebtData';
import { CenteredModal } from '../common';

export const StakedValueModal: FC<{ value: string; isOpened: boolean; onDismiss: () => void }> = ({
	value,
	isOpened,
	onDismiss,
}) => {
	const { t } = useTranslation();
	const { colors } = useTheme();

	const chartColor = colors.blue;
	const linearGradientId = '#colorBlue';

	const historicalDebt = useHistoricalDebtData();

	const data = historicalDebt.data ?? [];

	return (
		<StyledMenuModal onDismiss={onDismiss} isOpen={isOpened} title={t('modals.staked-value.title')}>
			<Title>{value}</Title>

			<AreaChartContainer>
				<AreaChart width={383} height={94} data={data} id={'staked-value-chart'}>
					<defs>
						<linearGradient id={linearGradientId} x1="0" y1="0" x2="0" y2="1">
							<stop offset="0%" stopColor={chartColor} stopOpacity={0.5} />
							<stop offset="100%" stopColor={chartColor} stopOpacity={0} />
						</linearGradient>
					</defs>

					<Area
						dataKey="actualDebt"
						stroke={chartColor}
						dot={false}
						strokeWidth={2}
						fill={`url(#${linearGradientId})`}
						isAnimationActive={false}
					/>

					<Tooltip
						isAnimationActive={false}
						position={{
							y: 0,
						}}
						content={
							// @ts-ignore
							<CustomTooltip />
						}
					/>
				</AreaChart>
			</AreaChartContainer>

			<Footer>
				<FooterItem>
					{t('modals.staked-value.title')}
					<span>100,000</span>
				</FooterItem>
			</Footer>
		</StyledMenuModal>
	);
};

const CustomTooltip = ({
	active,
	label,
	payload,
}: {
	active: boolean;
	payload: [
		{
			value: number;
		}
	];
	label: Date;
}) => {
	return active && payload && payload[0] ? (
		<TooltipContentStyle>
			<LabelStyle>{formatDate(label, 'MMM d yyyy')}</LabelStyle>
			<LabelStyle orange>30000 SNX TRANSFER</LabelStyle>
		</TooltipContentStyle>
	) : null;
};

const StyledMenuModal = styled(CenteredModal)`
	[data-reach-dialog-content] {
		width: 447px;
		height: 456px;
	}
	.card-body {
		padding: 32px;
	}
`;

const Title = styled.div`
	font-size: 24px;
	font-family: ${(props) => props.theme.fonts.extended};
	text-align: center;
	margin: 0 0 24px;
`;

const AreaChartContainer = styled.div`
	margin: 0 auto;
`;

const Footer = styled.div`
	margin-top: 44px;
`;

const FooterItem = styled.div`
	display: flex;
	justify-content: space-between;
	text-transform: uppercase;
	font-size: 12px;
	font-family: ${(props) => props.theme.fonts.condensedBold};
	color: ${(props) => props.theme.colors.gray};
	padding: 8px 0;
	border-bottom: 1px solid ${(props) => props.theme.colors.grayBlue};

	span {
		color: ${(props) => props.theme.colors.white};
	}
`;

const TooltipContentStyle = styled.div`
	font-family: ${(props) => props.theme.fonts.condensedBold};
	font-size: 12px;
	padding: 5px;
	border-radius: 4px;
	background-color: #4f5973;
	text-align: center;
`;

const LabelStyle = styled.div<{ orange?: boolean }>`
	color: ${(props) => (props.orange ? props.theme.colors.orange : props.theme.colors.white)};
	padding: 3px 5px;
	text-transform: capitalize;
`;

export default StakedValueModal;
