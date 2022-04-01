import React from 'react';
import styled from 'styled-components';
import { Trans, useTranslation } from 'react-i18next';
import { Svg } from 'react-optimized-image';
import DebtChart from '../DebtChart';
import useHistoricalDebtData from 'hooks/useHistoricalDebtData';
import { FlexDivCol, FlexDiv, Tooltip } from 'styles/common';

import Info from 'assets/svg/app/info.svg';
import { useRecoilValue } from 'recoil';
import { walletAddressState } from 'store/wallet';

const OverviewTab = () => {
	const { t } = useTranslation();

	const walletAddress = useRecoilValue(walletAddressState);

	const historicalDebt = useHistoricalDebtData(walletAddress);
	const dataIsLoading = historicalDebt?.isLoading ?? true;

	return (
		<>
			<Container>
				<ContainerHeader>
					<ContainerHeaderSection>
						{t('debt.actions.track.chart.title')}
						<DebtInfoTooltip
							arrow={false}
							content={
								<Trans
									i18nKey="debt.actions.track.info.tooltip"
									components={[<Strong />, <br />, <Strong />]}
								></Trans>
							}
						>
							<TooltipIconContainer>
								<ResizedInfoIcon src={Info} />
							</TooltipIconContainer>
						</DebtInfoTooltip>
					</ContainerHeaderSection>
				</ContainerHeader>
				<ContainerBody>
					<DebtChart data={historicalDebt.data} isLoading={false} />
				</ContainerBody>
			</Container>
		</>
	);
};

const Container = styled(FlexDivCol)`
	background: ${(props) => props.theme.colors.navy};
`;

const ContainerHeader = styled(FlexDiv)`
	width: 100%;
	padding: 14px 24px;
	border-bottom: 1px solid ${(props) => props.theme.colors.grayBlue};
	font-family: ${(props) => props.theme.fonts.extended};
	text-transform: uppercase;
	font-size: 12px;
	align-items: center;
	justify-content: space-between;
`;

const ContainerHeaderSection = styled(FlexDiv)``;

const ContainerBody = styled.div`
	padding: 24px;
`;

const DebtInfoTooltip = styled(Tooltip)`
	background: ${(props) => props.theme.colors.navy};
	.tippy-arrow {
		color: ${(props) => props.theme.colors.navy};
	}
	.tippy-content {
		font-size: 14px;
	}
`;

const TooltipIconContainer = styled(FlexDiv)`
	margin-left: 10px;
	opacity: 0.6;
	align-items: center;
`;

const ResizedInfoIcon = styled(Svg)`
	transform: scale(1.4);
`;

const Strong = styled.strong`
	font-family: ${(props) => props.theme.fonts.interBold};
`;

export default OverviewTab;
