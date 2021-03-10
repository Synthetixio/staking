import { FC } from 'react';
import styled from 'styled-components';
import { BigNumber } from 'bignumber.js';

import ProgressBar from 'components/ProgressBar';
import { ProgressBarType } from 'components/ProgressBar/ProgressBar';
import { FlexDivCol } from 'styles/common';
import { formatPercent } from 'utils/formatters/number';

type SynthHoldingProps = {
	usdBalance: BigNumber;
	totalUSDBalance: BigNumber;
	progressBarVariant?: ProgressBarType;
};

const SynthHolding: FC<SynthHoldingProps> = ({
	usdBalance,
	totalUSDBalance,
	progressBarVariant,
}) => {
	const percent = usdBalance.dividedBy(totalUSDBalance);

	return (
		<Container>
			<StyledProgressBar
				percentage={percent.toNumber()}
				variant={progressBarVariant || 'rainbow'}
			/>
			<StyledPercentage>{formatPercent(percent)}</StyledPercentage>
		</Container>
	);
};

const Container = styled(FlexDivCol)`
	width: 100%;
`;

const StyledPercentage = styled.span`
	color: ${(props) => props.theme.colors.gray};
`;

const StyledProgressBar = styled(ProgressBar)`
	margin-bottom: 4px;
`;

export default SynthHolding;
