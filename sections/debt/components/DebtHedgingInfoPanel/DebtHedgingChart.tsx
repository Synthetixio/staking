import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Svg } from 'react-optimized-image';
import { ResponsiveContainer, YAxis, Line, LineChart, XAxis } from 'recharts';
import { useTranslation } from 'react-i18next';
import { FlexDivCol, FlexDivColCentered } from 'styles/common';
import useGlobalHistoricalDebtData from 'hooks/useGlobalHistoricalDebtData';
import colors from 'styles/theme/colors';
import SpinnerIcon from 'assets/svg/app/loader.svg';
import ChartLabel from './ChartLabel';
import { format } from 'date-fns';
import fonts from 'styles/theme/fonts';
import DebtHedgedBalance from './DebtHedgedBalance';
import { useRecoilValue } from 'recoil';
import { walletAddressState } from 'store/wallet';
import { BigNumber, Contract, utils } from 'ethers';
import Connector from 'containers/Connector';
import { abi } from 'contracts/erc20';

const dSNXContract = new Contract('0x5f7f94a1dd7b15594d17543beb8b30b111dd464c', abi);

const DebtHedgingChart: React.FC = () => {
	const { t } = useTranslation();
	const { data, isLoading } = useGlobalHistoricalDebtData();
	const address = useRecoilValue(walletAddressState);
	const { provider } = Connector.useContainer();
	const [dSNXUserBalance, setdSNXUserBalance] = useState('0');

	useEffect(() => {
		if (address && provider) {
			dSNXContract
				.connect(provider)
				.balanceOf(address)
				.then((balance: BigNumber) => setdSNXUserBalance(utils.formatUnits(balance, 18)));
		}
	}, [provider]);

	if (isLoading) {
		return (
			<SpinnerContainer>
				<Spinner src={SpinnerIcon} />
			</SpinnerContainer>
		);
	}

	return (
		<ChartContainer>
			<ChartTitleContainer>
				<p>{t('debt.actions.manage.info-panel.chart.title')}</p>
				<StyledChartLabelsWrapper>
					<ChartLabel labelColor={colors.mutedBlue} labelBorderColor={colors.blue}>
						{t('debt.actions.manage.info-panel.chart.debt-mirror-label')}
					</ChartLabel>
					<ChartLabel labelColor={colors.mutedPink} labelBorderColor={colors.pink}>
						{t('debt.actions.manage.info-panel.chart.debtPool-label')}
					</ChartLabel>
					<DebtHedgedBalance userBalance={dSNXUserBalance} />
				</StyledChartLabelsWrapper>
			</ChartTitleContainer>
			<ResponsiveContainer width="100%" height={270}>
				<LineChart margin={{ left: 0, top: 20, bottom: 0, right: 0 }} data={data}>
					<YAxis width={0} domain={['auto', 'auto']} tickLine={false} />
					<XAxis
						height={30}
						dataKey="debtPool.timestamp"
						interval="preserveEnd"
						tick={{ fontSize: 10, fill: colors.white, fontFamily: fonts.mono }}
						tickLine={false}
						tickFormatter={(tick) => format(new Date(tick * 1000), 'd MMM yy').toUpperCase()}
					/>
					<Line
						type="monotone"
						dataKey="mirrorPool.value"
						stroke={colors.blue}
						strokeWidth={2}
						dot={false}
					/>
					<Line
						type="monotone"
						dataKey="debtPool.value"
						stroke={colors.pink}
						strokeWidth={2}
						dot={false}
					/>
				</LineChart>
			</ResponsiveContainer>
		</ChartContainer>
	);
};

const ChartContainer = styled(FlexDivColCentered)`
	height: 100%;
	width: 100%;
`;

const ChartTitleContainer = styled(FlexDivCol)`
	border-top: 1px solid ${(props) => props.theme.colors.mediumBlue};
	border-bottom: 1px solid ${(props) => props.theme.colors.mediumBlue};
	font-family: ${(props) => props.theme.fonts.extended};
	width: 100%;
	font-size: 13px;
	padding-left: 30px;
	padding-right: 30px;
`;

const SpinnerContainer = styled(FlexDivColCentered)`
	height: 100%;
	justify-content: center;
`;

const Spinner = styled(Svg)`
	display: block;
	margin: 30px auto;
`;

const StyledChartLabelsWrapper = styled.div`
	margin-bottom: 8px;
`;

export default DebtHedgingChart;
