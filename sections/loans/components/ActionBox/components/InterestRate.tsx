import React from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { FlexDivRow, FlexDivRowCentered } from 'styles/common';
import { toFixed } from 'utils/formatters/big-number';
import { useConfig } from 'sections/loans/hooks/config';

type InterestRateProps = {};

const InterestRate: React.FC<InterestRateProps> = () => {
	const { t } = useTranslation();
	const { interestRate } = useConfig();

	return (
		<Container>
			<Header>{t('loans.interest-rate')}</Header>
			<FlexDivRowCentered>
				<Item>
					<Text>{toFixed(interestRate, 1, 2)}%</Text>
				</Item>
			</FlexDivRowCentered>
		</Container>
	);
};

const Container = styled(FlexDivRow)`
	width: 100%;
	justify-content: space-between;
`;

const Header = styled.p`
	font-family: ${(props) => props.theme.fonts.interBold};
	font-size: 12px;
	color: ${(props) => props.theme.colors.gray};
	text-transform: uppercase;
`;

const Text = styled.span`
	font-family: ${(props) => props.theme.fonts.interBold};
	font-size: 12px;
	color: ${(props) => props.theme.colors.white};
`;

const Item = styled.span`
	display: inline-flex;
	align-items: center;
	cursor: pointer;
	svg {
		margin-left: 5px;
	}
`;

export default InterestRate;
