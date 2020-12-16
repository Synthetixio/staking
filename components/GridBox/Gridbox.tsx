import { FC, ReactNode, ReactElement } from 'react';
import Link from 'next/link';
import styled from 'styled-components';

import { FlexDivColCentered, ExternalLink } from 'styles/common';

export type GridBoxProps = {
	gridLocations: [string, string, string, string];
	title: string;
	copy: string;
	icon: ReactNode | ReactElement;
	link?: string;
	externalLink?: string;
	visible?: boolean;
};

export const GridBox: FC<GridBoxProps> = ({
	gridLocations,
	title,
	copy,
	icon,
	link,
	externalLink,
	visible,
}) => {
	const components = (
		<InnerGridContainer>
			<GridBoxIcon>{icon}</GridBoxIcon>
			<GridBoxTitle>{title}</GridBoxTitle>
			<GridBoxCopy>{copy}</GridBoxCopy>
		</InnerGridContainer>
	);
	if (!visible) return <></>;
	return (
		<GridBoxContainer
			columnStart={gridLocations[0]}
			columnEnd={gridLocations[1]}
			rowStart={gridLocations[2]}
			rowEnd={gridLocations[3]}
		>
			{link ? <Link href={link}>{components}</Link> : null}
			{externalLink ? <ExternalLink href={externalLink}>{components}</ExternalLink> : null}
		</GridBoxContainer>
	);
};

const InnerGridContainer = styled(FlexDivColCentered)`
	width: 100%;
	height: 100%;
	padding: 20px;
	justify-content: center;
`;

const GridBoxTitle = styled.div`
	font-size: 20px;
	font-family: ${(props) => props.theme.fonts.expanded};
	color: ${(props) => props.theme.colors.white};
	margin-bottom: 20px;
`;

export const GridBoxContainer = styled.div<{
	columnStart: string;
	columnEnd: string;
	rowStart: string;
	rowEnd: string;
}>`
	background: ${(props) => props.theme.colors.darkGradient1};
	box-shadow: 0px 0px 20px ${(props) => props.theme.colors.backgroundBoxShadow};
	border-radius: 2px;
	grid-column: ${(props) => `${props.columnStart} / ${props.columnEnd}`};
	grid-row: ${(props) => `${props.rowStart} / ${props.rowEnd}`};
	cursor: pointer;

	&:hover {
		background: ${(props) => props.theme.colors.darkGradient2};
		transition: background-color 0.5s ease-in-out;
		transform: scale(1.03);
		transition: transform 0.25s ease-in-out;
	}
`;

const GridBoxIcon = styled.div`
	/* height: 20px;
	margin: 20px auto 40px auto; */
`;

const GridBoxCopy = styled.p`
	font-family: ${(props) => props.theme.fonts.interSemiBold};
	font-size: 12px;
	max-width: 75%;
	text-align: center;
	color: ${(props) => props.theme.colors.gray};
`;

export default GridBox;
