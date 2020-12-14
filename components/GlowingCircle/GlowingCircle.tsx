import React, { FC, ReactNode } from 'react';
import styled from 'styled-components';
import { FlexDivCentered } from 'styles/common';

type GlowingCircleProps = {
	content: ReactNode;
};
const GlowingCircle: FC<GlowingCircleProps> = ({ content }) => {
	return <Circle>{content}</Circle>;
};

const Circle = styled(FlexDivCentered)`
	border-radius: 50%;
	justify-content: center;
	border: 2px solid ${(props) => props.theme.colors.blue};
	width: 56px;
	height: 56px;
	box-shadow: 0px 0px 15px ${(props) => props.theme.colors.blue};
	margin: 20px 0;
`;

export default GlowingCircle;
