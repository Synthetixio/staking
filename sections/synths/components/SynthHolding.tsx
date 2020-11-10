import React from 'react';
import styled, { useTheme } from 'styled-components';
import ProgressBar from 'components/ProgressBar';
import { FlexDivCol } from 'styles/common';
import { formatPercent } from 'utils/formatters/number';

interface SynthHoldingProps {
	usdBalance: number;
	totalUSDBalance: number;
}

export const SynthHolding: React.FC<SynthHoldingProps> = ({ usdBalance, totalUSDBalance }) => {
	const percent = usdBalance / totalUSDBalance;
	const theme = useTheme();
	return (
		<FlexDivCol>
			<StyledProgressBar percentage={percent} borderColor={'transparent'} fillColor={'#00D1FF'} />
			<StyledPercentage>{formatPercent(percent)}</StyledPercentage>
		</FlexDivCol>
	);
};

const StyledPercentage = styled.span`
	color: ${(props) => props.theme.colors.silver};
	font-family: ${(props) => props.theme.fonts.condensedMedium};
`;

const StyledProgressBar = styled(ProgressBar)`
	width: 800px;
	.filled-bar {
	}
`;
