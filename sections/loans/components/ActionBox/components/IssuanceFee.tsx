import React from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { FlexDivRow, FlexDivRowCentered } from 'styles/common';
import { formatNumber } from 'utils/formatters/number';
import { LOAN_TYPE_ERC20, LOAN_TYPE_ETH } from 'sections/loans/constants';
import { useLoans } from 'sections/loans/contexts/loans';

type IssuanceFeeProps = {
	collateralIsETH: boolean;
};

const IssuanceFee: React.FC<IssuanceFeeProps> = ({ collateralIsETH }) => {
	const { t } = useTranslation();
	const { issueFeeRates } = useLoans();
	const issuanceFee = issueFeeRates[collateralIsETH ? LOAN_TYPE_ETH : LOAN_TYPE_ERC20];

	return (
		<Container>
			<Header>{t('loans.issuance-fee')}</Header>
			<FlexDivRowCentered>
				<Item>
					<Text>{formatNumber(issuanceFee, { decimals: 2 })}%</Text>
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

export default IssuanceFee;
