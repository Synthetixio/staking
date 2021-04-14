import React from 'react';
import styled from 'styled-components';
import Big from 'bignumber.js';
import { useTranslation } from 'react-i18next';
import { FlexDivRow, FlexDivRowCentered } from 'styles/common';
import { formatNumber } from 'utils/formatters/number';
import InfoSVG from 'sections/loans/components/ActionBox/components/InfoSVG';

type CRatioProps = {
	hasLowCRatio: boolean;
	cratio: Big;
};

const CRatio: React.FC<CRatioProps> = ({ cratio, hasLowCRatio }) => {
	const { t } = useTranslation();

	return (
		<Container>
			<Header>{t('loans.cratio')}</Header>
			<FlexDivRowCentered>
				<Item>
					<Text {...{ hasLowCRatio }}>
						{cratio.isZero() ? (
							'-'
						) : (
							<>
								{formatNumber(cratio, { decimals: 0 })}%{' '}
								<InfoSVG
									tip={
										hasLowCRatio
											? t('loans.tabs.new.low-cratio-tip')
											: t('loans.tabs.new.healthy-cratio-tip')
									}
								/>
							</>
						)}
					</Text>
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

const Item = styled.div`
	display: inline-flex;
	align-items: center;

	svg {
		margin-left: 5px;
	}
`;

const Text = styled.div<{ hasLowCRatio: boolean }>`
	display: flex;
	align-items: center;
	font-family: ${(props) => props.theme.fonts.interBold};
	font-size: 12px;
	color: ${(props) => (props.hasLowCRatio ? props.theme.colors.red : props.theme.colors.green)};
`;

export default CRatio;
