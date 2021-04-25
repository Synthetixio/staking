import React, { useMemo, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';
import { useRecoilState } from 'recoil';

import useProposals from 'queries/gov/useProposals';

import ROUTES from 'constants/routes';
import { SPACE_KEY } from 'constants/snapshot';
import { panelState, PanelType, proposalState } from 'store/gov';

import useActiveTab from '../hooks/useActiveTab';
import { Grid, Col } from 'sections/gov/components/common';

import StructuredTab from 'components/StructuredTab';
import CouncilBoard from './List/CouncilBoard';
import Proposal from './Proposal';
import List from './List';
import Create from './Create';

type PanelProps = {
	currentTab: string;
};

const Panel: React.FC<PanelProps> = ({ currentTab }) => {
	const { t } = useTranslation();
	const router = useRouter();

	const councilProposals = useProposals(SPACE_KEY.COUNCIL);
	const govProposals = useProposals(SPACE_KEY.PROPOSAL);
	const grantsProposals = useProposals(SPACE_KEY.GRANTS);
	const ambassadorProposals = useProposals(SPACE_KEY.AMBASSADOR);

	const [, setProposal] = useRecoilState(proposalState);
	const [panelType, setPanelType] = useRecoilState(panelState);
	const activeTab = useActiveTab();

	useEffect(() => {
		if (
			councilProposals.data &&
			govProposals.data &&
			grantsProposals.data &&
			ambassadorProposals.data &&
			Array.isArray(router.query.panel) &&
			router.query.panel[1]
		) {
			if (router.query.panel[1] === 'create') {
				setPanelType(PanelType.CREATE);
			} else {
				let data;
				if (activeTab === SPACE_KEY.COUNCIL) {
					data = councilProposals.data;
				} else if (activeTab === SPACE_KEY.GRANTS) {
					data = grantsProposals.data;
				} else if (activeTab === SPACE_KEY.AMBASSADOR) {
					data = ambassadorProposals.data;
				} else {
					data = govProposals.data;
				}
				const hash = router.query.panel[1] ?? '';
				const preloadedProposal = data.filter((e) => e.authorIpfsHash === hash);
				setProposal(preloadedProposal[0]);
				setPanelType(PanelType.PROPOSAL);
			}
		} else {
			setPanelType(PanelType.LIST);
			setProposal(null);
		}
	}, [
		router.query.panel,
		councilProposals,
		govProposals,
		grantsProposals,
		ambassadorProposals,
		activeTab,
		setPanelType,
		setProposal,
	]);

	const tabData = useMemo(
		() => [
			{
				title: t('gov.panel.council.title'),
				tabChildren: (
					<List data={councilProposals.data ?? []} isLoaded={!councilProposals.isLoading} />
				),
				blue: true,
				key: SPACE_KEY.COUNCIL,
			},
			{
				title: t('gov.panel.proposals.title'),
				tabChildren: <List data={govProposals.data ?? []} isLoaded={!govProposals.isLoading} />,
				blue: true,
				key: SPACE_KEY.PROPOSAL,
			},
			{
				title: t('gov.panel.grants.title'),
				tabChildren: (
					<List data={grantsProposals.data ?? []} isLoaded={!grantsProposals.isLoading} />
				),
				blue: true,
				key: SPACE_KEY.GRANTS,
			},
			{
				title: t('gov.panel.ambassador.title'),
				tabChildren: (
					<List data={ambassadorProposals.data ?? []} isLoaded={!ambassadorProposals.isLoading} />
				),
				blue: true,
				key: SPACE_KEY.AMBASSADOR,
			},
		],
		[t, councilProposals, govProposals, grantsProposals, ambassadorProposals]
	);

	const returnContent = () => {
		switch (panelType) {
			case PanelType.LIST:
				return (
					<Grid>
						<Col>
							<StructuredTab
								boxPadding={20}
								boxHeight={600}
								tabData={tabData}
								setPanelType={(key) => router.push(`/gov/${key}`)}
								currentPanel={currentTab}
							/>
						</Col>
						<Col>
							<CouncilBoard />
						</Col>
					</Grid>
				);
			case PanelType.PROPOSAL:
				return (
					<Proposal
						onBack={() => {
							setProposal(null);
							setPanelType(PanelType.LIST);
							router.push(ROUTES.Gov.Space(activeTab));
						}}
					/>
				);
			case PanelType.CREATE:
				return (
					<Create
						onBack={() => {
							setPanelType(PanelType.LIST);
							router.push(ROUTES.Gov.Space(activeTab));
						}}
					/>
				);
			default:
				return (
					<Grid>
						<Col>
							<StructuredTab
								boxPadding={20}
								boxHeight={600}
								tabData={tabData}
								setPanelType={(key) => router.push(`/gov/${key}`)}
								currentPanel={currentTab}
							/>
						</Col>
						<Col>
							<CouncilBoard />
						</Col>
					</Grid>
				);
		}
	};

	return returnContent();
};

export default Panel;
