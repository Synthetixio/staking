import React, { useMemo } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { FlexDivCol, FlexDivRow, linkCSS } from 'styles/common';

interface InfoBoxProps {
	unstakedCollateral: number;
	stakedCollateral: number;
	currentCRatio: number;
	transferableCollateral: number;
	debtBalance: number;
	lockedCollateral: number;
}

export const InfoBox: React.FC<InfoBoxProps> = ({
	unstakedCollateral,
	stakedCollateral,
	transferableCollateral,
	currentCRatio,
	debtBalance,
	lockedCollateral,
}) => {
	const { t } = useTranslation();

	const Rows = useMemo(
		() => [
			{
				title: t('staking.info.mint.table.not-staked'),
				value: unstakedCollateral,
			},
			{
				title: t('staking.info.mint.table.staked'),
				value: stakedCollateral,
			},
			{
				title: t('staking.info.mint.table.transferable'),
				value: transferableCollateral,
			},
			{
				title: t('staking.info.mint.table.locked'),
				value: lockedCollateral,
			},
			{
				title: t('staking.info.mint.table.c-ratio'),
				value: 100 / currentCRatio,
			},
			{
				title: t('staking.info.mint.table.debt'),
				value: debtBalance,
			},
		],
		[unstakedCollateral, stakedCollateral, transferableCollateral, currentCRatio]
	);

	return (
		<FlexDivCol>
			<Title>{t('staking.info.mint.title')}</Title>
			<Subtitle>
				<Trans i18nKey="staking.info.mint.subtitle" components={[<ExternalLink />]} />
			</Subtitle>
			<DataContainer>
				{Rows.map((row, i) => (
					<DataRow key={i}>
						<RowTitle>{row.title}</RowTitle>
						<RowValue>{row.value}</RowValue>
					</DataRow>
				))}
			</DataContainer>
		</FlexDivCol>
	);
};

const Title = styled.p`
	font-family: ${(props) => props.theme.fonts.condensedBold};
	color: ${(props) => props.theme.colors.white};
	font-size: 16px;
`;
const Subtitle = styled.p`
	font-family: ${(props) => props.theme.fonts.regular};
	color: ${(props) => props.theme.colors.lightFont};
	font-size: 14px;
`;
const DataContainer = styled.div`
	background: ${(props) => props.theme.colors.mediumBlue};
`;
const DataRow = styled(FlexDivRow)`
	justify-content: space-between;
	margin: 16px 32px;
	border-bottom: ${(props) => `1px solid ${props.theme.colors.linedBlue}`};
`;
const RowTitle = styled.p`
	font-family: ${(props) => props.theme.fonts.condensedMedium};
	font-size: 14px;
	color: ${(props) => props.theme.colors.silver};
	text-transform: uppercase;
`;
const RowValue = styled.p`
	font-family: ${(props) => props.theme.fonts.condensedMedium};
	font-size: 16px;
	color: ${(props) => props.theme.colors.white};
	text-transform: uppercase;
`;
const ExternalLink = styled.span`
	${linkCSS}
	color: ${(props) => props.theme.colors.brightBlue}
`;
