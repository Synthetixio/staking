import { FC, ReactNode } from 'react';
import Head from 'next/head';
import { useTranslation } from 'react-i18next';
import styled, { createGlobalStyle } from 'styled-components';
import { Svg } from 'react-optimized-image';

import SynthetixIcon from 'assets/svg/app/synthetix.svg';

import { EXTERNAL_LINKS } from 'constants/links';

import {
	FlexDivColCentered,
	FullScreenContainer,
	resetHeadingMixin,
	FlexDivCol,
	ExternalLink,
} from 'styles/common';

import { DesktopOnlyView, MobileOrTabletView } from 'components/Media';

import SocialLinks from '../components/SocialLinks';

type MobileUnsupportedProps = {
	children: ReactNode;
};

const MobileUnsupported: FC<MobileUnsupportedProps> = ({ children }) => {
	const { t } = useTranslation();

	return (
		<>
			<DesktopOnlyView>{children}</DesktopOnlyView>
			<MobileOrTabletView>
				<Head>
					<title>{t('system-status.page-title')}</title>
				</Head>
				<GlobalStyle />
				<FullScreenContainer>
					<Content>
						<Container>
							<Title>
								{t('system-status.title-line1')}
								<span>{t('system-status.title-line2')}</span>
							</Title>
							<SNXLogoContainer>
								<StyledSocialLinks />
								<ExternalLink href={EXTERNAL_LINKS.Synthetix.Home}>
									<Svg src={SynthetixIcon} />
								</ExternalLink>
							</SNXLogoContainer>
						</Container>
					</Content>
				</FullScreenContainer>
			</MobileOrTabletView>
		</>
	);
};

const GlobalStyle = createGlobalStyle`
  body {
		background: ${(props) => props.theme.colors.darkGradient1};
  }
`;

const Content = styled(FlexDivCol)`
	position: relative;
	margin: 0 auto;
	padding: 0 24px;
	width: 100%;
	flex-grow: 1;
`;

const Container = styled(FlexDivColCentered)`
	flex-grow: 1;
	justify-content: center;
	text-align: center;
`;

const Title = styled.h1`
	${resetHeadingMixin};
	text-align: center;
	text-transform: uppercase;
	color: ${(props) => props.theme.colors.black};
	font-family: ${(props) => props.theme.fonts.extended};
	-webkit-text-stroke: 1px ${(props) => props.theme.colors.blue};
	font-size: 40px;
	line-height: 40px;
	padding-bottom: 30px;
	margin-top: -24px;
	span {
		display: block;
		font-size: 32px;
		line-height: 32px;
		padding-top: 10px;
	}
`;

const StyledSocialLinks = styled(SocialLinks)`
	top: unset;
	margin-bottom: 24px;
`;

const SNXLogoContainer = styled.div`
	position: absolute;
	bottom: 60px;
	a {
		color: ${(props) => props.theme.colors.white};
		&:hover {
			color: ${(props) => props.theme.colors.blue};
		}
	}
`;

export default MobileUnsupported;
