import { FC } from 'react';
import styled from 'styled-components';
import { FlexDivRowCentered } from 'styles/common';

type ProgressBarProps = {
	percentage: number;
	borderColor: string;
	fillColor: string;
};

const ProgressBar: FC<ProgressBarProps> = ({ percentage, borderColor, fillColor }) => (
	<ProgressBarWrapper borderColor={borderColor}>
		<Bar className="filled-bar" percentage={percentage} fillColor={fillColor} />
		<UnfilledBar percentage={1 - percentage} borderColor={borderColor} />
	</ProgressBarWrapper>
);

const ProgressBarWrapper = styled(FlexDivRowCentered)<{ borderColor: string }>`
	height: 4px;
`;

const Bar = styled.div<{
	percentage: number;
	fillColor: string;
}>`
	height: 100%;
	width: ${(props) => props.percentage * 100}%;
	background-color: ${(props) => props.fillColor};
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
