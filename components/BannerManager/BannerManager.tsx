import { FC } from 'react';
import { Trans } from 'react-i18next';
import styled from 'styled-components';

import Banner, { BannerType } from 'sections/shared/Layout/Banner';
import { LOCAL_STORAGE_KEYS } from 'constants/storage';
import { ExternalLink } from 'styles/common';
import useSynthetixQueries from '@synthetixio/queries';
import { EXTERNAL_LINKS } from 'constants/links';
import Connector from 'containers/Connector';
import { isAnyElectionInNomination, isAnyElectionInVoting } from 'utils/governance';
import { useLiquidation, LiquidationBanner } from './Liquidation';

const BannerManager: FC = () => {
	const { subgraph, useGetElectionsPeriodStatus } = useSynthetixQueries();
	const { L2DefaultProvider, isL2, walletAddress } = Connector.useContainer();
	const periodStatusQuery = useGetElectionsPeriodStatus(L2DefaultProvider);

	const electionIsInNomination = isAnyElectionInNomination(periodStatusQuery.data);
	const electionIsInVoting = isAnyElectionInVoting(periodStatusQuery.data);

	const feeClaims = subgraph.useGetFeesClaimeds(
		{ first: 1, where: { account: walletAddress?.toLowerCase() } },
		{ timestamp: true, value: true, rewards: true }
	);
	const hasClaimHistory = !!feeClaims.data?.length;

	const { deadline, hasWarning, ratio } = useLiquidation();

	if (hasWarning) {
		return <LiquidationBanner ratio={ratio} deadline={deadline} />;
	}

	if (electionIsInVoting) {
		return (
			<Banner
				type={BannerType.WARNING}
				message={
					<Trans
						i18nKey={'user-menu.banner.election-in-voting'}
						components={[<StyledExternalLink href={EXTERNAL_LINKS.Synthetix.Governance} />]}
					/>
				}
			/>
		);
	}
	if (electionIsInNomination) {
		return (
			<Banner
				type={BannerType.WARNING}
				message={
					<Trans
						i18nKey={'user-menu.banner.election-in-nomination'}
						components={[<StyledExternalLink href={EXTERNAL_LINKS.Synthetix.Governance} />]}
					/>
				}
			/>
		);
	}

	if (!isL2 && hasClaimHistory) {
		return (
			<Banner
				type={BannerType.INFORMATION}
				localStorageKey={LOCAL_STORAGE_KEYS.THALES_STAKING_INFO_VISIBLE}
				message={
					<Trans
						i18nKey={'user-menu.banner.thales-staking-info'}
						components={[<StyledExternalLink href="https://thalesmarket.io/token?tab=staking" />]}
					/>
				}
			/>
		);
	}
	return (
		<Banner
			type={BannerType.ATTENTION}
			localStorageKey={LOCAL_STORAGE_KEYS.WARNING_URL_BANNER_VISIBLE}
			message={
				<Trans
					i18nKey={'user-menu.banner.url-warning'}
					components={[<StyledExternalLink href="https://staking.synthetix.io" />]}
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

export default BannerManager;
