import React, { FC } from 'react';
import { Trans } from 'react-i18next';
import styled from 'styled-components';

import Banner, { BannerType } from 'sections/shared/Layout/Banner';
import { ExternalLink } from 'styles/common';
import { formatShortDateWithTime } from 'utils/formatters/date';
import { EXTERNAL_LINKS } from 'constants/links';

type LiquidationBannerProps = {
	ratio: number;
	deadline: number;
};

export const LiquidationBanner: FC<LiquidationBannerProps> = ({ ratio, deadline }) => {
	return (
		<Banner
			type={BannerType.WARNING}
			message={
				<Trans
					i18nKey={'user-menu.banner.liquidation-warning'}
					values={{
						liquidationRatio: ratio,
						liquidationDeadline: formatShortDateWithTime(deadline),
					}}
					components={[
						<Strong />,
						<Strong />,
						<StyledExternalLink href={EXTERNAL_LINKS.Synthetix.SIP148Liquidations} />,
					]}
				/>
			}
		/>
	);
};

const Strong = styled.strong`
	font-family: ${(props) => props.theme.fonts.condensedBold};
`;

const StyledExternalLink = styled(ExternalLink)`
	color: ${(props) => props.theme.colors.white};
	text-decoration: underline;
	&:hover {
		text-decoration: underline;
	}
`;
