import { FC, ReactNode } from 'react';
import Link from 'next/link';
import styled, { css } from 'styled-components';

import { FlexDivColCentered, ExternalLink, Tooltip } from 'styles/common';

export type GridBoxProps = {
	gridLocations: [string, string, string, string];
	title: string;
	copy: string;
	icon: ReactNode;
	link?: string;
	externalLink?: string;
	visible?: boolean;
	tooltip?: string;
	isDisabled?: boolean;
};

export const GridBox: FC<GridBoxProps> = ({
	gridLocations,
	title,
	copy,
	icon,
	link,
	externalLink,
	visible,
	tooltip,
	isDisabled,
}) => {
	if (visible != null && !visible) return <></>;

	const components = (
		<InnerGridContainer>
			<GridBoxIcon>{icon}</GridBoxIcon>
			<GridBoxTitle>{title}</GridBoxTitle>
			<GridBoxCopy>{copy}</GridBoxCopy>
		</InnerGridContainer>
	);

	return (
		<StyledTooltip
			arrow={true}
			placement="bottom"
			content={tooltip}
			disabled={!tooltip}
			hideOnClick={false}
		>
			<GridBoxContainer
				columnStart={gridLocations[0]}
				columnEnd={gridLocations[1]}
				rowStart={gridLocations[2]}
				rowEnd={gridLocations[3]}
				isDisabled={isDisabled}
			>
				{isDisabled ? (
					components
				) : (
					<>
						{link ? <Link href={link}>{components}</Link> : null}
						{externalLink ? <ExternalLink href={externalLink}>{components}</ExternalLink> : null}
					</>
				)}
			</GridBoxContainer>
		</StyledTooltip>
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
	font-family: ${(props) => props.theme.fonts.extended};
	color: ${(props) => props.theme.colors.white};
	margin-top: 20px;
	text-align: center;
`;

export const GridBoxContainer = styled.div<{
	columnStart: string;
	columnEnd: string;
	rowStart: string;
	rowEnd: string;
	isDisabled?: boolean;
}>`
	background: ${(props) => props.theme.colors.darkGradient1};
	box-shadow: 0px 0px 20px ${(props) => props.theme.colors.backgroundBoxShadow};
	border-radius: 2px;
	grid-column: ${(props) => `${props.columnStart} / ${props.columnEnd}`};
	grid-row: ${(props) => `${props.rowStart} / ${props.rowEnd}`};
	transition: transform 0.25s ease-in-out;

	${(props) =>
		props.isDisabled
			? css`
					opacity: 0.35;
					cursor: not-allowed;
			  `
			: css`
					cursor: pointer;
					&:hover {
						background: ${(props) => props.theme.colors.darkGradient2};
						transform: scale(1.03);
					}
			  `}
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

const StyledTooltip = styled(Tooltip)`
	background: ${(props) => props.theme.colors.mediumBlue};
	.tippy-content {
		font-size: 12px;
		padding: 10px;
	}
`;

export default GridBox;
