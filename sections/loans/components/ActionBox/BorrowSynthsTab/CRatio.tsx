import React from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { FlexDivRow, FlexDivRowCentered, Tooltip } from 'styles/common';
import { Big, toFixed, isZero } from 'utils/formatters/big-number';

type CRatioProps = {
	hasLowCRatio: boolean;
	cratio: Big;
};

const CRatio: React.FC<CRatioProps> = ({ cratio, hasLowCRatio }) => {
	const { t } = useTranslation();

	return isZero(cratio) ? null : (
		<Container>
			<Header>{t('loans.cratio')}</Header>
			<FlexDivRowCentered>
				<Item>
					<StyledTooltip
						arrow={true}
						placement="bottom"
						content={
							<TooltipText>
								{hasLowCRatio
									? `You can only short at 150% or higher. Your position will be
						eligible for liquidation if it falls below 120%.`
									: `Ensure your position stays above 120% to prevent liquidation.`}
							</TooltipText>
						}
						hideOnClick={true}
					>
						<Text {...{ hasLowCRatio }}>
							{toFixed(cratio, 1, 0)}% <SVG {...{ hasLowCRatio }} />
						</Text>
					</StyledTooltip>
				</Item>
			</FlexDivRowCentered>
		</Container>
	);
};

type SVGProps = {
	hasLowCRatio: boolean;
};

const SVG: React.FC<SVGProps> = ({ hasLowCRatio }) => (
	<SVGContainer {...{ hasLowCRatio }}>
		<svg focusable="false" viewBox="0 0 24 24" aria-hidden="true">
			<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z"></path>
		</svg>
	</SVGContainer>
);

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
	cursor: pointer;

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

const SVGContainer = styled.div<{ hasLowCRatio: boolean }>`
	width: 24px;
	height: 24px;
	display: flex;
	align-items: center;

	path {
		fill: ${(props) => (props.hasLowCRatio ? props.theme.colors.red : props.theme.colors.green)};
	}
`;

const StyledTooltip = styled(Tooltip)`
	background: ${(props) => props.theme.colors.mediumBlue};
	.tippy-content {
		font-size: 12px;
		padding: 10px;
	}
`;

const TooltipText = styled.div`
	text-align: center;
`;

export default CRatio;
