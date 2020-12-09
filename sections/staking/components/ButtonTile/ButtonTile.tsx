import React from 'react';
import styled, { css } from 'styled-components';
import { FlexDivColCentered } from 'styles/common';

type ButtonTileProps = {
	title: string;
	icon: Function;
	subtext: string;
	onAction: () => void;
	disabled?: boolean;
};

const ButtonTile: React.FC<ButtonTileProps> = ({
	title,
	icon,
	subtext,
	onAction,
	disabled = false,
	...rest
}) => {
	return (
		<Container disabled={disabled} onClick={() => !disabled && onAction()} {...rest}>
			<Title disabled={disabled} className="tile-title">
				{title}
			</Title>
			{icon()}
			<Subtext disabled={disabled} className="tile-subtext">
				{subtext}
			</Subtext>
		</Container>
	);
};

const Container = styled(FlexDivColCentered)<{ disabled: boolean }>`
	text-align: center;
	justify-content: center;
	width: 100%;
	background: ${(props) =>
		props.disabled ? props.theme.colors.black : props.theme.colors.mediumBlue};
	padding: 16px;
	flex: 1;
	margin: 8px 0px;
	cursor: pointer;
	${(props) =>
		!props.disabled &&
		css`
			&:hover {
				background: ${(props) => props.theme.colors.mediumBlue};
				transition: background-color 0.5s;
			}
		`}
`;

const Title = styled.p<{ disabled: boolean }>`
	font-family: ${(props) => props.theme.fonts.expanded};
	font-size: 12px;
	text-transform: uppercase;
	color: ${(props) => (props.disabled ? props.theme.colors.gray : props.theme.colors.white)};
`;

const Subtext = styled.p<{ disabled: boolean }>`
	font-size: 12px;
	font-family: ${(props) => props.theme.fonts.regular};
	color: ${(props) => (props.disabled ? props.theme.colors.gray : props.theme.colors.white)};
`;

export default ButtonTile;
