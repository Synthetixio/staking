import { FC, useState, useMemo } from 'react';
import get from 'lodash/get';
import { useTranslation } from 'react-i18next';
import styled, { useTheme } from 'styled-components';
import { AreaChart, Area, Tooltip, XAxis, YAxis } from 'recharts';
import formatDate from 'date-fns/format';
import { Svg } from 'react-optimized-image';

import { formatCurrency } from 'utils/formatters/number';
import ArrowForwardBlue from 'assets/svg/app/arrow-forward-blue.svg';
import useHistoricalDebtData, { HistoricalDebtAndIssuanceData } from 'hooks/useHistoricalDebtData';
import { CenteredModal } from '../common';
import { wei } from '@synthetixio/wei';
import { useRecoilValue } from 'recoil';
import { walletAddressState } from 'store/wallet';

const INITIAL_SNAPSHOT: HistoricalDebtAndIssuanceData = {
	timestamp: 0,
	actualDebt: wei(0),
	issuanceDebt: wei(0),
	index: 0,
};

export const StakedValueModal: FC<{ value: string; isOpened: boolean; onDismiss: () => void }> = ({
	value,
	isOpened,
	onDismiss,
}) => {
	const { t } = useTranslation();
	const { colors } = useTheme();

	const chartColor = colors.blue;
	const linearGradientId = '#colorBlue';

	const walletAddress = useRecoilValue(walletAddressState);

	const historicalDebt = useHistoricalDebtData(walletAddress);
	const data = useMemo(() => historicalDebt.data ?? [], [historicalDebt]);

	const [currentSnapshot, setCurrentSnapshot] = useState<HistoricalDebtAndIssuanceData | null>(
		null
	);
	const currentSnapshotOrLast = useMemo(
		() => (!(data.length && currentSnapshot) ? data[data.length - 1] : currentSnapshot),
		[data, currentSnapshot]
	);
	const prevSnapshot = useMemo(
		() =>
			!(data.length && currentSnapshotOrLast)
				? null
				: currentSnapshotOrLast.index === 0
				? INITIAL_SNAPSHOT
				: data[currentSnapshotOrLast.index - 1],
		[data, currentSnapshotOrLast]
	);

	return (
		<StyledMenuModal onDismiss={onDismiss} isOpen={isOpened} title={t('modals.staked-value.title')}>
			<Title>{value}</Title>

			<AreaChartContainer>
				<AreaChart
					width={383}
					height={94}
					data={data}
					id={'staked-value-chart'}
					onMouseMove={(e: any) => {
						const currentRate = get(e, 'activePayload[0].payload', null);
						if (currentRate) {
							setCurrentSnapshot(currentRate);
						} else {
							setCurrentSnapshot(null);
						}
					}}
					onMouseLeave={(e: any) => {
						setCurrentSnapshot(null);
					}}
				>
					<defs>
						<linearGradient id={linearGradientId} x1="0" y1="0" x2="0" y2="1">
							<stop offset="0%" stopColor={chartColor} stopOpacity={0.5} />
							<stop offset="100%" stopColor={chartColor} stopOpacity={0} />
						</linearGradient>
					</defs>

					<XAxis
						type="number"
						dataKey="timestamp"
						domain={['auto', 'auto']}
						hide
						axisLine={false}
						tickLine={false}
						allowDataOverflow={true}
					/>
					<YAxis
						type="number"
						allowDataOverflow={true}
						domain={['dataMin', 'dataMax']}
						hide
						axisLine={false}
						tickLine={false}
					/>

					<Area
						dataKey="issuanceDebt"
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

			{!(currentSnapshotOrLast && prevSnapshot) ? null : (
				<Footer>
					<FooterItem>
						{t('modals.staked-value.total-snx')}
						<FooterItemChange>
							<div>
								{formatCurrency('sUSD', prevSnapshot.issuanceDebt, {
									sign: '$',
								})}
							</div>
							<Svg src={ArrowForwardBlue} />
							<div>
								{' '}
								{formatCurrency('sUSD', currentSnapshotOrLast.issuanceDebt, {
									sign: '$',
								})}
							</div>
						</FooterItemChange>
					</FooterItem>
					<FooterItem>
						{t('modals.staked-value.transferrable-snx')}
						<FooterItemChange>
							<div>
								{formatCurrency('sUSD', prevSnapshot.issuanceDebt, {
									sign: '$',
								})}
							</div>
							<Svg src={ArrowForwardBlue} />
							<div>
								{' '}
								{formatCurrency('sUSD', currentSnapshotOrLast.issuanceDebt, {
									sign: '$',
								})}
							</div>
						</FooterItemChange>
					</FooterItem>
					<FooterItem>
						{t('modals.staked-value.locked-snx')}
						<FooterItemChange>
							<div>
								{formatCurrency('sUSD', prevSnapshot.issuanceDebt, {
									sign: '$',
								})}
							</div>
							<Svg src={ArrowForwardBlue} />
							<div>
								{' '}
								{formatCurrency('sUSD', currentSnapshotOrLast.issuanceDebt, {
									sign: '$',
								})}
							</div>
						</FooterItemChange>
					</FooterItem>
					<FooterItem>
						{t('modals.staked-value.staked-snx')}
						<FooterItemChange>
							<div>
								{formatCurrency('sUSD', prevSnapshot.issuanceDebt, {
									sign: '$',
								})}
							</div>
							<Svg src={ArrowForwardBlue} />
							<div>
								{' '}
								{formatCurrency('sUSD', currentSnapshotOrLast.issuanceDebt, {
									sign: '$',
								})}
							</div>
						</FooterItemChange>
					</FooterItem>
				</Footer>
			)}
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
			payload: {
				timestamp: number;
				issuanceDebt: number;
			};
		}
	];
	label: Date;
}) => {
	if (!(active && payload && payload[0])) return null;
	const {
		payload: { timestamp, issuanceDebt },
	} = payload[0];
	return (
		<TooltipContentStyle>
			<LabelStyle>{formatDate(new Date(timestamp), 'MMM d yyyy')}</LabelStyle>
			<LabelStyle orange>
				STAKED:{' '}
				{formatCurrency('sUSD', issuanceDebt, {
					sign: '$',
				})}
			</LabelStyle>
		</TooltipContentStyle>
	);
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

const FooterItemChange = styled.div`
	display: flex;
	grid-gap: 10px;
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
