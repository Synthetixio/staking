import { FC } from 'react';
import styled from 'styled-components';
import { FlexDivRowCentered } from 'styles/common';

type ProgressBarProps = {
	percentage: number;
	borderColor: string;
	fillColor: string;
	glowColor?: string;
};

const ProgressBar: FC<ProgressBarProps> = ({
	percentage,
	borderColor,
	fillColor,
	glowColor = 'none',
}) => (
	<ProgressBarWrapper borderColor={borderColor}>
		<Bar percentage={percentage} fillColor={fillColor} glowColor={glowColor} />
		<UnfilledBar percentage={1 - percentage} borderColor={borderColor} />
	</ProgressBarWrapper>
);

const ProgressBarWrapper = styled(FlexDivRowCentered)<{ borderColor: string }>`
	height: 8px;
`;

const Bar = styled.div<{ percentage: number; fillColor: string; glowColor: string }>`
	height: 100%;
	width: ${(props) => props.percentage * 100}%;
	border: none;
	background-color: ${(props) => props.fillColor};
	border: 1px solid ${(props) => props.fillColor};
	box-shadow: ${(props) => props.glowColor};
`;

const UnfilledBar = styled.div<{ percentage: number; borderColor: string }>`
	height: 100%;
	width: ${(props) => props.percentage * 100}%;
	border: 1px solid ${(props) => props.borderColor};
	border-left: none;
`;

export default ProgressBar;
