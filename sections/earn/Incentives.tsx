import { FC, useState, useEffect } from 'react';
import styled, { css } from 'styled-components';
import BigNumber from 'bignumber.js';
import { Svg } from 'react-optimized-image';
import { useTranslation } from 'react-i18next';
import { ethers } from 'ethers';

import Connector from 'containers/Connector';
import { curvepoolRewards, iEthRewards, iBtcRewards } from 'contracts';
import { CRYPTO_CURRENCY_MAP } from 'constants/currency';
import { FlexDivCol, FlexDivColCentered, FlexDivRowCentered, Row, Column } from 'styles/common';
// @TODO: Import proper svgs
import curvesUSD from 'assets/svg/incentives/curvesUSD.svg';

import ClaimTab from './ClaimTab';
import LPTab from './LPTab';

type IncentivesProps = {
	tradingRewards: BigNumber;
	stakingRewards: BigNumber;
	totalRewards: BigNumber;
	refetch: Function;
};

const Incentives: FC<IncentivesProps> = ({
	tradingRewards,
	stakingRewards,
	totalRewards,
	refetch,
}) => {
	const { t } = useTranslation();
	const [activeTab, setActiveTab] = useState<number>(0);
	const [distributions, setDistributions] = useState<{ [address: string]: number } | null>(null);
	const { provider } = Connector.useContainer();

	useEffect(() => {
		if (provider) {
			const curvepoolContract = new ethers.Contract(
				curvepoolRewards.address,
				curvepoolRewards.abi,
				provider
			);
			const iEthRewardsContract = new ethers.Contract(
				iEthRewards.address,
				iEthRewards.abi,
				provider
			);
			const iBtcRewardsContract = new ethers.Contract(
				iBtcRewards.address,
				iBtcRewards.abi,
				provider
			);
			async function getDistributions() {
				const contracts = [curvepoolContract, iEthRewardsContract, iBtcRewardsContract];
				const rewardsData = await Promise.all(
					contracts.map((contract) => {
						const getDuration = contract.DURATION || contract.rewardsDuration;
						return Promise.all([getDuration(), contract.rewardRate(), contract.periodFinish()]);
					})
				);
				let contractRewards = {};
				rewardsData.forEach(([duration, rate, periodFinish], i) => {
					const durationInWeeks = Number(duration) / 3600 / 24 / 7;
					const isPeriodFinished = new Date().getTime() > Number(periodFinish) * 1000;
					// @ts-ignore
					contractRewards[contracts[i].address] = isPeriodFinished
						? 0
						: Math.trunc(Number(duration) * (rate / 1e18)) / durationInWeeks;
				});
				setDistributions(contractRewards);
			}
			getDistributions();
		}
	}, [provider]);

	const incentives = [
		{
			icon: <Svg src={curvesUSD} />,
			title: t('earn.incentives.options.staking', { asset: CRYPTO_CURRENCY_MAP.SNX }),
			apr: 0.14,
		},
		{
			icon: <Svg src={curvesUSD} />,
			title: t('earn.incentives.options.curve'),
			apr: 0.14,
		},
		{
			icon: <Svg src={curvesUSD} />,
			title: t('earn.incentives.options.ieth'),
			apr: 0.32,
		},
		{
			icon: <Svg src={curvesUSD} />,
			title: t('earn.incentives.options.ibtc'),
			apr: 0.14,
		},
	];

	return (
		<Row>
			<StyledColumnLeft>
				<FlexDivCol>
					{incentives.map(({ icon, title, apr }, i) => (
						<IncentiveCard onClick={() => setActiveTab(i)} isActive={i === activeTab} key={i}>
							<IconWrap>{icon}</IconWrap>
							<CardTitle>{title}</CardTitle>
							<APRSection>
								<APRSubtitle>{t('earn.incentives.est-apr')}</APRSubtitle>
								<APRValue>{apr}%</APRValue>
							</APRSection>
						</IncentiveCard>
					))}
				</FlexDivCol>
			</StyledColumnLeft>
			<StyledColumnRight>
				{activeTab === 0 ? (
					<ClaimTab
						refetch={refetch}
						tradingRewards={tradingRewards}
						stakingRewards={stakingRewards}
						totalRewards={totalRewards}
					/>
				) : null}
				{activeTab === 1 ? (
					<LPTab
						title={t('earn.actions.lp.title-curve')}
						weeklyRewards={distributions != null ? distributions[curvepoolRewards.address] : null}
					/>
				) : null}
				{activeTab === 2 ? (
					<LPTab
						title={t('earn.actions.lp.title-ieth')}
						weeklyRewards={distributions != null ? distributions[iEthRewards.address] : null}
					/>
				) : null}
				{activeTab === 3 ? (
					<LPTab
						title={t('earn.actions.lp.title-ibtc')}
						weeklyRewards={distributions != null ? distributions[iBtcRewards.address] : null}
					/>
				) : null}
			</StyledColumnRight>
		</Row>
	);
};

const StyledColumnLeft = styled(Column)`
	padding: 0;
	width: 40%;
`;

const StyledColumnRight = styled(Column)`
	padding: 20px;
	border: 24px solid ${(props) => props.theme.colors.mediumBlue};
	width: 60%;
`;

const IncentiveCard = styled(FlexDivRowCentered)<{ isActive: boolean }>`
	background: ${(props) =>
		props.isActive ? props.theme.colors.tooltipBlue : props.theme.colors.mediumBlue};
	width: 100%;
	padding: 16px 0;
	margin: 4px 0px;
	cursor: pointer;
	&:first-child {
		margin-top: 0;
	}
	&:hover {
		background: ${(props) => props.theme.colors.tooltipBlue};
	}
	${(props) =>
		props.isActive &&
		css`
			border-right: 1px solid ${(props) => props.theme.colors.brightBlue};
		`}
`;

const CardTitle = styled.p`
	color: ${(props) => props.theme.colors.white};
	font-family: ${(props) => props.theme.fonts.condensedBold};
	width: 150px;
	font-size: 14px;
`;

const IconWrap = styled.div`
	margin-left: 16px;
`;

const APRSection = styled(FlexDivColCentered)`
	border: ${(props) => `1px solid ${props.theme.colors.borderSilver}`};
	padding: 16px;
	border-radius: 4px;
	margin-right: 16px;
`;

const APRSubtitle = styled.p`
	text-transform: uppercase;
	color: ${(props) => props.theme.colors.lightFont};
	font-family: ${(props) => props.theme.fonts.condensedBold};
	font-size: 12px;
	margin: 0;
`;

const APRValue = styled.p`
	color: ${(props) => props.theme.colors.white};
	font-family: ${(props) => props.theme.fonts.condensedMedium};
	font-size: 18px;
	margin: 0;
`;

export default Incentives;
