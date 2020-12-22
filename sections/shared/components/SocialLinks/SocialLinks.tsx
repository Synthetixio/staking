import { FC } from 'react';
import styled from 'styled-components';
import { ExternalLink, GridDivCenteredCol } from 'styles/common';

import { Svg } from 'react-optimized-image';

import DiscordIcon from 'assets/svg/social/discord.svg';
import TwitterIcon from 'assets/svg/social/twitter.svg';
import GithubIcon from 'assets/svg/social/github.svg';

import { EXTERNAL_LINKS } from 'constants/links';

import { media } from 'styles/media';

const SOCIAL_LINKS = [
	{
		id: 'discord',
		href: EXTERNAL_LINKS.Social.Discord,
		icon: <Svg src={DiscordIcon} />,
	},
	{
		id: 'twitter',
		href: EXTERNAL_LINKS.Social.Twitter,
		icon: <Svg src={TwitterIcon} />,
	},
	{
		id: 'github',
		href: EXTERNAL_LINKS.Social.GitHub,
		icon: <Svg src={GithubIcon} />,
	},
];

type SocialLinksProps = {
	className?: string;
};

const SocialLinks: FC<SocialLinksProps> = (props) => (
	<Links {...props}>
		{SOCIAL_LINKS.map(({ id, href, icon }) => (
			<StyledExternalLink key={id} href={href}>
				{icon}
			</StyledExternalLink>
		))}
	</Links>
);

const Links = styled(GridDivCenteredCol)`
	grid-gap: 12px;
	position: relative;
	top: 170px;
	${media.lessThan('sm')`
		top: 90px;
	`}
`;

const StyledExternalLink = styled(ExternalLink)`
	color: ${(props) => props.theme.colors.white};
	&:hover {
		color: ${(props) => props.theme.colors.blue};
	}
`;

export default SocialLinks;
