import React from 'react';
import styled from 'styled-components';

import { Svg } from 'react-optimized-image';
import { useTranslation, Trans } from 'react-i18next';
import { FlexDivCol, FlexDivColCentered, FlexDivRowCentered } from 'styles/common';
import { Subtitle, Title, StyledLink } from './components/common';
// @TODO: Import proper svgs
import curvesUSD from 'assets/svg/incentives/curvesUSD.svg';

const Incentives: React.FC = () => {
	const { t } = useTranslation();

	const incentives = [
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
	];

	return (
		<FlexDivCol>
			<Title>{t('earn.incentives.title')}</Title>
			<Subtitle>
				<Trans i18nKey="earn.incentives.subtitle" components={[<StyledLink />]} />
			</Subtitle>
			{incentives.map(({ icon, title, apr }, i) => (
				<IncentiveCard key={i}>
					{icon}
					<CardTitle>{title}</CardTitle>
					<APRSection>
						<APRSubtitle>{t('earn.incentives.est-apr')}</APRSubtitle>
						<APRValue>{apr}%</APRValue>
					</APRSection>
				</IncentiveCard>
			))}
		</FlexDivCol>
	);
};

const IncentiveCard = styled(FlexDivRowCentered)`
	background: ${(props) => props.theme.colors.mediumBlue};
	width: 400px;
	padding: 16px;
	margin: 8px 0px;
`;
const CardTitle = styled.p`
	color: ${(props) => props.theme.colors.white};
	font-family: ${(props) => props.theme.fonts.condensedBold};
	width: 150px;
	font-size: 14px;
`;
const APRSection = styled(FlexDivColCentered)`
	border: ${(props) => `1px solid ${props.theme.colors.borderSilver}`};
	padding: 16px;
	border-radius: 4px;
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
