import { FC, ReactNode } from 'react';
import styled, { css } from 'styled-components';

import SNXStatBackground from 'assets/svg/app/snx-stat-background.svg';

import { FlexDivColCentered } from 'styles/common';

type Size = 'md' | 'lg';

type StatBoxProps = {
	title: ReactNode;
	value: ReactNode;
	size?: Size;
};

const StatBox: FC<StatBoxProps> = ({ title, value, size = 'md', ...rest }) => (
	<Box {...rest} size={size}>
		<Title className="title">{title}</Title>
		<Value className="value">{value}</Value>
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
			transform: scale(1.1);
		`}
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
