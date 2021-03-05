import { FC, ReactNode } from 'react';
import styled from 'styled-components';
import Link from 'next/link';
import { Svg } from 'react-optimized-image';

import ArrowRightLongIcon from 'assets/svg/app/arrow-right-long.svg';

import { ExternalLink, FlexDivCentered } from 'styles/common';

import { NotificationType } from './types';

type NotificationProps = {
	type: NotificationType;
	children: ReactNode;
	link?: string;
	isExternal?: boolean;
};

const arrowIcon = <Svg src={ArrowRightLongIcon} />;

const Notification: FC<NotificationProps> = ({ type, children, link, isExternal }) => {
	const hasLink = link != null;

	const notification = (
		<Container>
			<Indicator type={type} />
			<Content>{children}</Content>
			{link && <LinkContainer>{arrowIcon}</LinkContainer>}
		</Container>
	);

	return hasLink ? (
		<>
			{isExternal ? (
				<ExternalLink href={link}>{notification}</ExternalLink>
			) : (
				<Link href={link!}>
					<a>{notification}</a>
				</Link>
			)}
		</>
	) : (
		notification
	);
};

const Container = styled(FlexDivCentered)`
	border-radius: 4px;
	font-size: 12px;
	background-color: ${(props) => props.theme.colors.mediumBlue};
	font-family: ${(props) => props.theme.fonts.condensedMedium};
	height: 32px;
	line-height: 32px;
	color: ${(props) => props.theme.colors.white};
`;

const Indicator = styled.div<{ type: NotificationType }>`
	width: 4px;
	height: 100%;
	background-color: ${(props) => {
		switch (props.type) {
			case 'info': {
				return props.theme.colors.blue;
			}
			case 'warning': {
				return props.theme.colors.pink;
			}
			default: {
				return props.theme.colors.blue;
			}
		}
	}};
	box-shadow: 0px 0px 15px rgba(237, 30, 255, 0.4);
`;

const Content = styled.div`
	padding: 0 15px;
`;

const LinkContainer = styled.div`
	margin-left: auto;
	display: flex;
	padding-right: 15px;
	svg {
		color: ${(props) => props.theme.colors.white};
	}
`;

export default Notification;
