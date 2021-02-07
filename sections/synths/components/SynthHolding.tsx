import { FC, forwardRef } from 'react';
import styled from 'styled-components';
import { BigNumber } from 'bignumber.js';
import { Img } from 'react-optimized-image';

import ProgressBar from 'components/ProgressBar';
import { FlexDivCol, Tooltip } from 'styles/common';
import { formatPercent } from 'utils/formatters/number';
import WarningIcon from 'assets/svg/app/warning.svg';

type SynthHoldingProps = {
	debtPoolProportion: BigNumber;
	usdBalance: BigNumber;
	totalUSDBalance: BigNumber;
};

// If holding percentage deviates from pool holding by more
// than this number of percentage points, show hedging warning.
const HEDGE_WARNING_THRESHOLD_PCT = new BigNumber(5);

const SynthHolding: FC<SynthHoldingProps> = ({
	debtPoolProportion,
	usdBalance,
	totalUSDBalance,
}) => {
	const percent = usdBalance.dividedBy(totalUSDBalance);

	return (
		<>
			<Container>
				<StyledProgressBar percentage={percent.toNumber()} variant="rainbow" />
				<StyledPercentage>{formatPercent(percent)}</StyledPercentage>
			</Container>
			{debtPoolProportion
				.minus(percent)
				.abs()
				.isGreaterThan(HEDGE_WARNING_THRESHOLD_PCT.div(100)) && (
				<Tooltip
					hideOnClick={false}
					arrow={true}
					placement="bottom"
					content={`Your holdings in this synth are significantly different from the overall debt pool holdings (${formatPercent(
						debtPoolProportion
					)}).`}
				>
					<TooltipContainer tabIndex={0}>
						<Img src={WarningIcon} width={16} />
					</TooltipContainer>
				</Tooltip>
			)}
		</>
	);
};

const Container = styled(FlexDivCol)`
	width: 85%;
`;

const TooltipContainer = styled.span`
	margin-left: 8px;
	margin-bottom: 4px;
`;

const StyledPercentage = styled.span`
	color: ${(props) => props.theme.colors.gray};
`;

const StyledProgressBar = styled(ProgressBar)`
	margin-bottom: 4px;
`;

export default SynthHolding;
