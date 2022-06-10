import React, { useEffect } from 'react';
import Head from 'next/head';
import { useTranslation, Trans } from 'react-i18next';
import StatBox from 'components/StatBox';
import styled from 'styled-components';
import { ExternalLink, LineSpacer } from 'styles/common';
import { formatNumber } from 'utils/formatters/number';
import UIContainer from 'containers/UI';
import StatsSection from 'components/StatsSection';
import MainContent from 'sections/gov';
import { snapshotEndpoint, SPACE_KEY } from 'constants/snapshot';
import { useRecoilValue } from 'recoil';
import useSynthetixQueries from '@synthetixio/queries';
import { EXTERNAL_LINKS } from 'constants/links';
import Connector from 'containers/Connector';
import { isAnyElectionInNomination, isAnyElectionInVoting } from 'utils/governance';
import { walletAddressState } from 'store/wallet';

const Gov: React.FC = () => {
	const { t } = useTranslation();
	const { setTitle } = UIContainer.useContainer();
	const { useGetElectionsPeriodStatus } = useSynthetixQueries();
	const { L2DefaultProvider } = Connector.useContainer();
	const periodStatusQuery = useGetElectionsPeriodStatus(L2DefaultProvider);
	const electionIsInNomination = isAnyElectionInNomination(periodStatusQuery.data);
	const electionIsInVoting = isAnyElectionInVoting(periodStatusQuery.data);
	const newElectionsAreLive = electionIsInNomination || electionIsInVoting;

	const walletAddress = useRecoilValue(walletAddressState);
	const { useVotingWeightQuery } = useSynthetixQueries();
	const walletVotingWeight = useVotingWeightQuery(
		snapshotEndpoint,
		SPACE_KEY.COUNCIL,
		walletAddress,
		{ enabled: !newElectionsAreLive }
	);

	useEffect(() => {
		setTitle('gov');
	}, [setTitle]);

	return (
		<>
			<Head>
				<title>{t('gov.page-title')}</title>
			</Head>
			{newElectionsAreLive ? (
				<NewElectionsContainer>
					<h2>{t('gov.new-governance-site.title')}</h2>
					<p>{t('gov.new-governance-site.subtitle')}</p>
					<Trans
						i18nKey={'gov.new-governance-site.link-text'}
						components={[<StyledExternalLink href={EXTERNAL_LINKS.Synthetix.SIP148Liquidations} />]}
					/>
				</NewElectionsContainer>
			) : (
				<>
					<StatsSection>
						<WalletVotingPower
							title={t('common.stat-box.voting-power.title')}
							value={formatNumber(walletVotingWeight.data ? walletVotingWeight.data[1] : 0)}
						/>
						<TotalVotingPower
							title={t('common.stat-box.delegated-voting-power.title')}
							value={formatNumber(walletVotingWeight.data ? walletVotingWeight.data[0] : 0)}
							tooltipContent={t('common.stat-box.delegated-voting-power.tooltip')}
						/>
					</StatsSection>
				</>
			)}
			<LineSpacer />
			<MainContent />
		</>
	);
};

const StyledExternalLink = styled(ExternalLink)`
	color: ${(props) => props.theme.colors.blue};
`;

const NewElectionsContainer = styled.div`
	padding: 24px 0;
`;
const WalletVotingPower = styled(StatBox)`
	.title {
		color: ${(props) => props.theme.colors.blue};
	}
`;

const TotalVotingPower = styled(StatBox)`
	.title {
		color: ${(props) => props.theme.colors.pink};
	}
`;
export default Gov;
