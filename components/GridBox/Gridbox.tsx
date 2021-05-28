import { FC, ReactNode } from 'react';
import Link from 'next/link';
import styled, { css } from 'styled-components';
import media from 'styles/media';
import { FlexDivColCentered, ExternalLink, Tooltip } from 'styles/common';

export type GridBoxProps = {
	title: string;
	copy: string;
	icon: ReactNode;
	link?: string;
	externalLink?: string;
	visible?: boolean;
	tooltip?: string;
	isDisabled?: boolean;
	gridArea?: string;
};

export const GridBox: FC<GridBoxProps> = ({
	title,
	copy,
	icon,
	link,
	externalLink,
	visible,
	tooltip,
	isDisabled,
	gridArea,
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
			<GridBoxContainer isDisabled={isDisabled} {...{ gridArea }}>
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
	padding: 40px 20px 20px;

	${media.lessThan('md')`
		padding: 20px 0;
	`}
`;

const GridBoxTitle = styled.div`
	font-size: 20px;
	font-family: ${(props) => props.theme.fonts.extended};
	color: ${(props) => props.theme.colors.white};
	margin-top: 20px;
	text-align: center;
`;

export const GridBoxContainer = styled.div<{
	isDisabled?: boolean;
	gridArea?: string;
}>`
	background: ${(props) => props.theme.colors.darkGradient1};
	box-shadow: 0px 0px 20px ${(props) => props.theme.colors.backgroundBoxShadow};
	border-radius: 2px;
	grid-area: ${(props) => props.gridArea};
	transition: transform 0.25s ease-in-out;

	${media.greaterThan('mdUp')`
		max-width: 500px;
	`}

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
	margin: 0 auto;
`;

const GridBoxCopy = styled.p`
	font-family: ${(props) => props.theme.fonts.regular};
	font-size: 12px;
	max-width: 75%;
	text-align: center;
	color: ${(props) => props.theme.colors.white};
	opacity: 0.75;
`;

const StyledTooltip = styled(Tooltip)`
	background: ${(props) => props.theme.colors.mediumBlue};
	.tippy-content {
		font-size: 12px;
		padding: 10px;
	}
`;

export default GridBox;
