import Head from 'next/head';
import styled, { useTheme } from 'styled-components';
import { useTranslation } from 'react-i18next';
import {
	FlexDiv,
	FlexDivCentered,
	FlexDivCol,
	FlexDivColCentered,
	FlexDivRowCentered,
} from 'styles/common';
import SNXStatBackground from 'assets/svg/snx-stat-background.svg';
import useGetDebtDataQuery from 'queries/debt/useGetDebtDataQuery';
import useSNXBalanceQuery from 'queries/walletBalances/useSNXBalanceQuery';
import ProgressBar from 'components/ProgressBar';
import Mint from 'assets/inline-svg/app/mint.svg';
import Burn from 'assets/inline-svg/app/burn.svg';
import Stake from 'assets/inline-svg/app/stake.svg';
import Trade from 'assets/inline-svg/app/trade.svg';
import useGetFeePoolDataQuery from 'queries/staking/useGetFeePoolDataQuery';
import useCurrencyRatesQuery from 'queries/rates/useCurrencyRatesQuery';
import useExchangeRatesQuery from 'queries/rates/useExchangeRatesQuery';
import useSNXTotalSupply from 'queries/network/useSNXTotalSupply';
import { formatPercent } from 'utils/formatters/number';
import { format } from 'date-fns';

const DashboardPage = () => {
	const { t } = useTranslation();
	const theme = useTheme();

	const debtDataQuery = useGetDebtDataQuery();
	const snxBalanceQuery = useSNXBalanceQuery();
	const ACTIONS = [
		{
			icon: () => <Mint />,
			copy: 'Mint 2,349 sUSD by Staking 6,371.34 SNX',
			action: 'MINT',
			link: '/',
		},
		{
			icon: () => <Burn />,
			copy: 'Burn 501 sUSD, lowering your debt, so that 468 SNX can be transfered',
			action: 'BURN',
			link: '/',
		},
		{
			icon: () => <Stake />,
			copy: 'Earn 13.49% on your sETH',
			action: 'STAKE IETH',
			link: '/',
		},
		{
			icon: () => <Trade />,
			copy: 'Trade sUSD for sDEFI and gain exposure to DeFi Tokens',
			action: 'TRADE',
			link: '/',
		},
	];

	const returnActionBox = (
		{ icon, copy, link, action }: { icon: any; copy: string; link: string; action: string },
		index: number
	) => (
		<ActionBox key={index}>
			<ActionIcon>{icon()}</ActionIcon>
			<ActionCopy>{copy}</ActionCopy>
			<ActionButton as="a" href={link}>
				{action}
			</ActionButton>
		</ActionBox>
	);

	// @TODO: Remove hardcoded claim value
	const claimed = true;

	const currentCRatio = debtDataQuery.data?.currentCRatio;
	const targetCRatio = debtDataQuery.data?.targetCRatio;
	const activeDebt = debtDataQuery.data?.debtBalance;
	const stakedValue = snxBalanceQuery.data?.balance
		? snxBalanceQuery.data.balance * Math.min(1, currentCRatio / targetCRatio)
		: 0;

	const currencyRates = useCurrencyRatesQuery(['SNX']);
	const exchangeRates = useExchangeRatesQuery();

	const currentFeePeriod = useGetFeePoolDataQuery('0');
	const previousFeePeriod = useGetFeePoolDataQuery('1');

	const ONE_WEEK_EPOCH = 604800;
	const nextFeePeriodStarts = currentFeePeriod.data?.startTime + ONE_WEEK_EPOCH;
	const hoursLeftInPeriod = (nextFeePeriodStarts - new Date().getTime() / 1000) / 60 / 60;

	// const currentFeePeriod = useGetFeePoolDataQuery(1);

	const totalSNXSupplyQuery = useSNXTotalSupply();

	// @TODO: Find how to get these values
	// const percentLocked = snxLocked / snxTotal;
	// const percentLocked = 0.1;

	// const SNXValueStaked = totalSNXSupplyQuery?.data * percentLocked;

	// const stakingApy =
	// 	(((exchangeRates?.data['sUSD'] ?? 0) * currentFeePeriod?.data?.feesToDistribute +
	// 		(currencyRates?.data.SNX ?? 0) * currentFeePeriod?.data?.rewardsToDistribute) *
	// 		52) /
	// 	SNXValueStaked;

	// console.log(nextFeePeriod.data);

	// console.log(format(new Date(nextFeePeriod.data.?startTime), 'MMMM dd'));

	// console.log(new Date())
	// console.log(new Date(newFeePeriod.data?.startTime.sub(currentFeePeriod.data?.startTime)));
	return (
		<>
			<Head>
				<title>{t('dashboard.page-title')}</title>
			</Head>
			<Content>
				<StatsSection>
					{/* @TODO Refactor to StatBox.tsx */}
					<StatBox
						key={'staked-value'}
						style={{
							backgroundImage: `url(${SNXStatBackground})`,
						}}
					>
						<StatTitle titleColor={theme.colors.brightBlue}>
							{t('dashboard.stat-box.staked-value')}
						</StatTitle>
						<StatValue>{stakedValue}</StatValue>
					</StatBox>

					<StatBox
						key={'earning'}
						style={{
							backgroundImage: `url(${SNXStatBackground})`,
						}}
					>
						<StatTitle titleColor={theme.colors.brightGreen}>
							{t('dashboard.stat-box.earning')}
						</StatTitle>
						{/* <StatValue>{formatPercent(stakingApy / 100)}</StatValue> */}
					</StatBox>

					<StatBox
						key={'active-debt'}
						style={{
							backgroundImage: `url(${SNXStatBackground})`,
						}}
					>
						<StatTitle titleColor={theme.colors.brightPink}>
							{t('dashboard.stat-box.active-debt')}
						</StatTitle>
						<StatValue>{activeDebt}</StatValue>
					</StatBox>
				</StatsSection>

				<BarStats>
					<BarStatBox key="CRATIO">
						<BarHeaderSection>
							<BarTitle>{t('dashboard.bar.c-ratio')}</BarTitle>
							<BarValue>{currentCRatio / 100}%</BarValue>
						</BarHeaderSection>
						<ProgressBar
							percentage={currentCRatio / targetCRatio}
							borderColor={theme.colors.brightPink}
							fillColor={theme.colors.brightBlue}
							glowColor={`0px 0px 15px rgba(77, 244, 184, 0.25);`}
						/>
					</BarStatBox>
					<BarStatBox key="PERIOD">
						<BarHeaderSection>
							<BarTitle>
								{t('dashboard.bar.period.title')} &bull;{' '}
								{claimed && <Tag>{t('dashboard.bar.period.tag')}</Tag>}
							</BarTitle>
							<BarValue>{hoursLeftInPeriod}</BarValue>
						</BarHeaderSection>
						<ProgressBar
							percentage={0.8}
							borderColor={theme.colors.brightGreen}
							fillColor={theme.colors.brightGreen}
							glowColor={`0px 0px 15px rgba(77, 244, 184, 0.25);`}
						/>
					</BarStatBox>
				</BarStats>
				<Actions>
					<ActionTitle>{t('dashboard.actions.title')}</ActionTitle>
					{ACTIONS.map((action, i) => returnActionBox(action, i))}
				</Actions>
			</Content>
		</>
	);
};

const Content = styled(FlexDivCol)`
	justify-content: center;
`;

const StatsSection = styled(FlexDivRowCentered)``;

const StatBox = styled(FlexDivColCentered)`
	height: 200px;
	width: 200px;
	background-image: url('assets/svg/snx-stat-background.svg');
	background-position: center;
	background-repeat: no-repeat;
	justify-content: center;
`;

const StatTitle = styled.p<{ titleColor: string }>`
	font-family: ${(props) => props.theme.fonts.condensedMedium};
	font-size: 14px;
	color: ${(props) => props.titleColor};
	margin: 0;
`;

const StatValue = styled.p`
	font-family: ${(props) => props.theme.fonts.expanded};
	font-size: 28px;
	margin: 0;
`;

const BarStats = styled(FlexDiv)``;

const BarStatBox = styled(FlexDivCol)`
	margin-right: 16px;
	width: 400px;
`;

const BarHeaderSection = styled(FlexDivRowCentered)`
	justify-content: space-between;
`;
const BarTitle = styled(FlexDivCentered)`
	font-size: 14px;
	font-family: ${(props) => props.theme.fonts.condensedMedium};
	color: ${(props) => props.theme.colors.silver};
`;
const BarValue = styled.p`
	font-size: 16px;
	color: ${(props) => props.theme.colors.white};
	font-family: ${(props) => props.theme.fonts.mono};
`;

const Tag = styled.div`
	color: ${(props) => props.theme.colors.brightGreen};
	font-size: 14px;
	margin-left: 4px;
`;

const Actions = styled(FlexDivCol)``;

const ActionTitle = styled.p`
	font-size: 14px;
	font-family: ${(props) => props.theme.fonts.condensedMedium};
	color: ${(props) => props.theme.colors.silver};
	text-align: left;
`;

const ActionBox = styled(FlexDivCentered)`
	background: rgba(9, 9, 47, 0.8);
	box-shadow: 0px 0px 20px rgba(0, 0, 0, 0.4);
	border-radius: 4px;
	margin-bottom: 16px;
	padding: 20px;
`;

const ActionIcon = styled(FlexDivRowCentered)`
	width: 100px;
	justify-content: center;
`;

const ActionCopy = styled.p`
	font-family: ${(props) => props.theme.fonts.interSemiBold};
	font-size: 14px;
	width: 75%;
`;

const ActionButton = styled(FlexDivRowCentered)`
	width: 161px;
	height: 48px;
	background: #0c2344;
	border: ${(props) => `1px solid ${props.theme.colors.brightBlue}`};
	box-sizing: border-box;
	box-shadow: 0px 0px 10px rgba(0, 209, 255, 0.9);
	border-radius: 4px;
	color: ${(props) => props.theme.colors.brightBlue};
	font-family: ${(props) => props.theme.fonts.condensedBold};
	font-size: 12px;
	text-decoration: none;
	text-align: center;
	justify-content: center;
`;

export default DashboardPage;
