import { FC, ReactNode } from 'react';
import styled, { css } from 'styled-components';
import Svg from 'react-optimized-image';

import SNXStatBackground from 'assets/svg/app/snx-stat-background.svg';
import media from 'styles/media';
import { FlexDivRowCentered, FlexDivColCentered, Tooltip } from 'styles/common';
import InfoIcon from 'assets/svg/app/info.svg';

type Size = 'md' | 'lg';

type StatBoxProps = {
	title: ReactNode;
	value: ReactNode;
	size?: Size;
	children?: ReactNode;
	tooltipContent?: string;
};

const StatBox: FC<StatBoxProps> = ({
	title,
	value,
	tooltipContent,
	size = 'md',
	children,
	...rest
}) => {
	return (
		<Box {...rest} size={size}>
			<FlexDivRowCentered>
				<Title className="title">{title}</Title>
				{tooltipContent && (
					<StyledTooltip
						arrow={true}
						placement="bottom"
						content={tooltipContent}
						hideOnClick={false}
					>
						<IconContainer>
							<Svg src={InfoIcon} />
						</IconContainer>
					</StyledTooltip>
				)}
			</FlexDivRowCentered>
			<Value className="value">{value}</Value>
			{children}
		</Box>
	);
};

const IconContainer = styled.div`
	margin-left: 4px;
	margin-bottom: 4px;
`;

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

	&:first-child,
	&:last-child {
		${media.lessThan('mdUp')`
			position: relative;
			top: 50px;
			background-image: none;
			margin: auto;

			.title,
			.value {
				font-size: 12px;
				white-space: pre;
			}
		`}
	}

	&:first-child {
		${media.lessThan('mdUp')`
			align-items: flex-start;
		`}
	}

	&:last-child {
		${media.lessThan('mdUp')`
			align-items: flex-end;
			text-align: right;
		`}
	}
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

const StyledTooltip = styled(Tooltip)`
	background: ${(props) => props.theme.colors.mediumBlue};
	.tippy-content {
		font-size: 12px;
		padding: 10px;
	}
`;

export default StatBox;
