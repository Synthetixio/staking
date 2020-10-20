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
import ProgressBar from 'components/ProgressBar';

const DashboardPage = () => {
	const { t } = useTranslation();
	const theme = useTheme();

	// const totalValueLocked = 	SNXPercentLocked * SNXTotalSupply * (SNXPrice ?? 0)

	// 	const currentSnxStakingApy = (((sUSDPrice ?? 0) * currentFeePeriod.feesToDistribute +
	// 	(SNXPrice ?? 0) * currentFeePeriod.rewardsToDistribute) *
	// 	52) /
	// SNXValueStaked;

	// const activeDebt =

	const returnActionBox = () => (
		<ActionBox>
			<ActionIcon>{icon}</ActionIcon>
			<ActionCopy>{icon}</ActionCopy>
			<ActionButton href={link}>{copy}</ActionButton>
		</ActionBox>
	);

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
						<StatValue>
							{/* {SNXPercentLocked * SNXTotalSupply * (SNXPrice ?? 0)} */}
							$134,234
						</StatValue>
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
						<StatValue>6.14%</StatValue>
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
						<StatValue>$13,461.23</StatValue>
					</StatBox>
				</StatsSection>

				<BarStats>
					<BarStatBox key="CRATIO">
						<BarHeaderSection>
							<BarTitle>{t('dashboard.bar.c-ratio')}</BarTitle>
							<BarValue>622%</BarValue>
						</BarHeaderSection>
						<ProgressBar
							percentage={0.5}
							borderColor={theme.colors.brightPink}
							fillColor={theme.colors.brightBlue}
							glowColor={`0px 0px 15px rgba(77, 244, 184, 0.25);`}
						/>
					</BarStatBox>
					<BarStatBox key="PERIOD">
						<BarHeaderSection>
							<BarTitle>{t('dashboard.bar.period')}</BarTitle>
							<BarValue>56:35:10</BarValue>
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
	font-family: ${(props) => props.theme.fonts.mono};
	font-size: 14px;
	color: ${(props) => props.titleColor};
	margin: 0;
`;

const StatValue = styled.p`
	font-family: ${(props) => props.theme.fonts.condensedBold};
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
const BarTitle = styled.p`
	font-size: 14px;
	font-family: ${(props) => props.theme.fonts.condensedMedium};
	color: ${(props) => props.theme.colors.silver};
`;
const BarValue = styled.p`
	font-size: 16px;
	color: ${(props) => props.theme.colors.white};
	font-family: ${(props) => props.theme.fonts.mono};
`;

const Actions = styled(FlexDivCol)``;

const ActionTitle = styled.p`
	font-size: 14px;
	font-family: ${(props) => props.theme.fonts.condensedMedium};
	color: ${(props) => props.theme.colors.silver};
	text-align: left;
`;

const ActionBox = styled(FlexDivCentered)``;

const ActionIcon = styled.div``;

const ActionCopy = styled.p``;

const ActionButton = styled.div`
	width: 161px;
	height: 48px;

	background: #0c2344;
	border: 1px solid #00d1ff;
	box-sizing: border-box;
	box-shadow: 0px 0px 10px rgba(0, 209, 255, 0.9);
	border-radius: 4px;

	span {
		font-family: GT America;
		font-style: normal;
		font-weight: bold;
		font-size: 12px;
		line-height: 24px;

		display: flex;
		align-items: center;
		text-align: center;
		text-transform: uppercase;

		color: #00d1ff;
	}
`;

export default DashboardPage;
