import { FC } from 'react';
import styled, { css } from 'styled-components';

import { FlexDivRowCentered } from 'styles/common';

type ProgressBarType = 'rainbow' | 'blue-pink' | 'green';

type ProgressBarProps = {
	percentage: number;
	className?: string;
	variant: ProgressBarType;
};

const ProgressBar: FC<ProgressBarProps> = ({ percentage, variant, ...rest }) => (
	<ProgressBarWrapper variant={variant} {...rest}>
		<Bar className="filled-bar" percentage={percentage} />
		<Bar className="unfilled-bar" percentage={1 - percentage} />
	</ProgressBarWrapper>
);

const ProgressBarWrapper = styled(FlexDivRowCentered)<{
	variant?: ProgressBarType;
}>`
	height: 4px;
	> div {
		height: 100%;
	}

	${(props) =>
		props.variant === 'rainbow' &&
		css`
			.filled-bar {
				background: ${(props) => props.theme.colors.rainbowGradient};
			}
			.unfilled-bar {
				background: ${(props) => props.theme.colors.white};
				opacity: 0.2;
			}
		`}

	${(props) =>
		props.variant === 'blue-pink' &&
		css`
			.filled-bar {
				background: ${(props) => props.theme.colors.blue};
				border: 1px solid ${(props) => props.theme.colors.blue};
				box-shadow: 0px 0px 10px rgba(0, 209, 255, 0.6);
			}

			.unfilled-bar {
				border: 1px solid ${(props) => props.theme.colors.pink};
				box-shadow: 0px 0px 15px ${(props) => props.theme.colors.pink};
			}
		`}

	${(props) =>
		props.variant === 'green' &&
		css`
			.filled-bar {
				background: ${(props) => props.theme.colors.green};
				border: 1px solid ${(props) => props.theme.colors.green};
				box-shadow: 0px 0px 10px rgba(77, 244, 184, 0.25);
			}

			.unfilled-bar {
				border: 1px solid ${(props) => props.theme.colors.green};
				border-left: none;
				box-shadow: 0px 0px 15px ${(props) => props.theme.colors.green};
			}
		`}		
`;

const Bar = styled.div<{ percentage: number }>`
	width: ${(props) => props.percentage * 100}%;
`;

export default ProgressBar;
