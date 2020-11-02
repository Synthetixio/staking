import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { FlexDivCol, FlexDivRow } from 'styles/common';

interface InfoBoxProps {}

export const InfoBox: React.FC<InfoBoxProps> = ({}) => {
	const { t } = useTranslation();

	const Rows = [
		{
			title: t('staking.info.mint.table.not-staked'),
			value: 3415.0081,
		},
		{
			title: t('staking.info.mint.table.staked'),
			value: 3415.0081,
		},
		{
			title: t('staking.info.mint.table.transferable'),
			value: 3415.0081,
		},
		{
			title: t('staking.info.mint.table.locked'),
			value: 3415.0081,
		},
		{
			title: t('staking.info.mint.table.c-ratio'),
			value: 3415.0081,
		},
		{
			title: t('staking.info.mint.table.debt'),
			value: 3415.0081,
		},
	];

	return (
		<FlexDivCol>
			<Title>{t('staking.info.mint.title')}</Title>
			<Subtitle>{t('staking.info.mint.subtitle')}</Subtitle>
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
