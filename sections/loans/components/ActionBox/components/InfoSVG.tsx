import React from 'react';
import styled from 'styled-components';
import { Tooltip } from 'styles/common';

type SVGProps = {
	tip: string;
};

const SVG: React.FC<SVGProps> = ({ tip }) => (
	<StyledTooltip arrow={true} placement="bottom" content={<TooltipText>{tip}</TooltipText>}>
		<SVGContainer>
			<svg
				width="15"
				height="15"
				viewBox="0 0 10 10"
				fill="none"
				xmlns="http://www.w3.org/2000/svg"
			>
				<circle cx="5" cy="5" r="5" fill="#16166A" />
				<path
					d="M3.59296 6.33676H4.59962V4.49676H3.69296V3.75009H5.62629V6.33676H6.67962V7.08343H3.59296V6.33676ZM5.63962 3.31676H4.46629V2.26343H5.63962V3.31676Z"
					fill="white"
				/>
			</svg>
		</SVGContainer>
	</StyledTooltip>
);

export default SVG;

const SVGContainer = styled.div`
	display: flex;
	align-items: center;
	cursor: pointer;
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
