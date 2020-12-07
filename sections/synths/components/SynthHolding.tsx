import React from 'react';
import styled from 'styled-components';
import { BigNumber } from 'bignumber.js';

import ProgressBar from 'components/ProgressBar';
import { FlexDivCol } from 'styles/common';
import { formatPercent } from 'utils/formatters/number';

interface SynthHoldingProps {
	usdBalance: BigNumber;
	totalUSDBalance: BigNumber;
}

const SynthHolding: React.FC<SynthHoldingProps> = ({ usdBalance, totalUSDBalance }) => {
	const percent = usdBalance.dividedBy(totalUSDBalance);

	return (
		<Container>
			<StyledProgressBar
				percentage={percent.toNumber()}
				borderColor={'transparent'}
				fillColor={'#00D1FF'}
			/>
			<StyledPercentage>{formatPercent(percent)}</StyledPercentage>
		</Container>
	);
};

const Container = styled(FlexDivCol)`
	width: 100%;
`;

const StyledPercentage = styled.span`
	color: ${(props) => props.theme.colors.silver};
	font-family: ${(props) => props.theme.fonts.condensedMedium};
`;

const StyledProgressBar = styled(ProgressBar)`
	margin-bottom: 4px;
`;

export default SynthHolding;
