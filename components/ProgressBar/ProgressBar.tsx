import { FC } from 'react';
import styled, { css } from 'styled-components';
import { FlexDivRowCentered } from 'styles/common';

// TODO: add more types
type ProgressBarType = 'rainbow';

type ProgressBarProps = {
	percentage: number;
	borderColor?: string;
	fillColor?: string;
	className?: string;
	variant?: ProgressBarType;
};

const ProgressBar: FC<ProgressBarProps> = ({
	percentage,
	borderColor = 'transparent',
	fillColor = 'transparent',
	variant,
	...rest
}) => (
	<ProgressBarWrapper borderColor={borderColor} variant={variant} {...rest}>
		<Bar className="filled-bar" percentage={percentage} fillColor={fillColor} />
		<UnfilledBar className="unfilled-bar" percentage={1 - percentage} borderColor={borderColor} />
	</ProgressBarWrapper>
);

const ProgressBarWrapper = styled(FlexDivRowCentered)<{
	borderColor: string;
	variant?: ProgressBarType;
}>`
	height: 4px;

	${(props) =>
		props.variant === 'rainbow' &&
		css`
			.filled-bar {
				background: ${(props) => props.theme.colors.rainbowGradient};
				box-shadow: none;
				border: 0;
			}
			.unfilled-bar {
				background: ${(props) => props.theme.colors.white};
				box-shadow: none;
				border: 0;
				opacity: 0.2;
			}
		`}
`;

const Bar = styled.div<{
	percentage: number;
	fillColor: string;
}>`
	height: 100%;
	width: ${(props) => props.percentage * 100}%;
	background: ${(props) => props.fillColor};
	border: 1px solid ${(props) => props.fillColor};
	box-shadow: 0px 0px 15px ${(props) => props.fillColor};
`;

const UnfilledBar = styled.div<{ percentage: number; borderColor: string }>`
	height: 100%;
	width: ${(props) => props.percentage * 100}%;
	border: 1px solid ${(props) => props.borderColor};
	border-left: none;
	box-shadow: 0px 0px 15px ${(props) => props.borderColor};
`;

export default ProgressBar;
