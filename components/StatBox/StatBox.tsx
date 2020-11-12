import React from 'react';
import styled from 'styled-components';
import SNXStatBackground from 'assets/svg/app/snx-stat-background.svg';
import { FlexDivColCentered } from 'styles/common';

type StatBoxProps = {
	title: string;
	value: string;
};

const StatBox: React.FC<StatBoxProps> = ({ title, value, ...rest }) => {
	return (
		<Box
			{...rest}
			key={`stat-box-${title}`}
			style={{
				backgroundImage: `url(${SNXStatBackground})`,
			}}
		>
			<Title className="title">{title}</Title>
			<Value className="value">{value}</Value>
		</Box>
	);
};

const Box = styled(FlexDivColCentered)`
	height: 200px;
	width: 400px;
	background-position: center;
	background-repeat: no-repeat;
	justify-content: center;
	margin: 0px 20px;
`;
const Title = styled.span`
	font-family: ${(props) => props.theme.fonts.condensedMedium};
	font-size: 14px;
	margin: 0;
`;
const Value = styled.span`
	font-family: ${(props) => props.theme.fonts.expanded};
	font-size: 42px;
	margin: 0;
`;

export default StatBox;
