import React from 'react';
import styled from 'styled-components';
import { FlexDivColCentered } from 'styles/common';

type ButtonTileProps = {
	title: string;
	icon: Function;
	subtext: string;
	onAction: () => void;
};

const ButtonTile: React.FC<ButtonTileProps> = ({ title, icon, subtext, onAction, ...rest }) => {
	return (
		<Container onClick={() => onAction()} {...rest}>
			<Title className="tile-title">{title}</Title>
			{icon()}
			<Subtext className="tile-subtext">{subtext}</Subtext>
		</Container>
	);
};

const Container = styled(FlexDivColCentered)`
	text-align: center;
	justify-content: center;
	background: ${(props) => props.theme.colors.tooltipBlue};
	cursor: pointer;
	&:hover {
		background: ${(props) => props.theme.colors.hoverTooltipBlue};
		transition: background-color 0.5s;
	}
`;

const Title = styled.p`
	font-family: ${(props) => props.theme.fonts.expanded};
	font-size: 12px;
`;

const Subtext = styled.p`
	font-size: 12px;
	font-family: ${(props) => props.theme.fonts.regular};
`;

export default ButtonTile;
