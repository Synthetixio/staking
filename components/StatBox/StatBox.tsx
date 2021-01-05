import { FC, ReactNode } from 'react';
import styled, { css } from 'styled-components';

import SNXStatBackground from 'assets/svg/app/snx-stat-background.svg';

import { FlexDivColCentered } from 'styles/common';

type Size = 'md' | 'lg';

type StatBoxProps = {
	title: ReactNode;
	value: ReactNode;
	size?: Size;
	children?: ReactNode;
};

const StatBox: FC<StatBoxProps> = ({ title, value, size = 'md', children, ...rest }) => (
	<Box {...rest} size={size}>
		<Title className="title">{title}</Title>
		<Value className="value">{value}</Value>
		{children}
	</Box>
);

const Box = styled(FlexDivColCentered)<{ size: Size }>`
	height: 200px;
	width: 400px;
	background-position: center;
	background-repeat: no-repeat;
	justify-content: center;
	margin: 0px 20px;
	background-image: url(${SNXStatBackground.src});
	${(props) =>
		props.size === 'lg' &&
		css`
			background-size: 176px 114px;
			.value {
				font-size: 32px;
			}
		`}
`;

const Title = styled.span`
	font-family: ${(props) => props.theme.fonts.interBold};
	font-size: 12px;
	padding-bottom: 5px;
	text-transform: uppercase;
`;

const Value = styled.span`
	font-family: ${(props) => props.theme.fonts.extended};
	font-size: 24px;
`;

export default StatBox;
