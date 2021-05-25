import React, { useMemo, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';
import { useRecoilState } from 'recoil';

import ROUTES from 'constants/routes';
import { snapshotEndpoint, SPACE_KEY } from 'constants/snapshot';
import { panelState, PanelType, proposalState } from 'store/gov';

import useActiveTab from '../hooks/useActiveTab';
import { Row } from 'styles/common';
import { LeftCol, RightCol } from 'sections/gov/components/common';

import StructuredTab from 'components/StructuredTab';
import CouncilBoard from './List/CouncilBoard';
import Proposal from './Proposal';
import List from './List';
import Create from './Create';
import { Proposal as ProposalType } from 'queries/gov/types';
import request, { gql } from 'graphql-request';

type PanelProps = {
	currentTab: string;
};

const Panel: React.FC<PanelProps> = ({ currentTab }) => {
	const { t } = useTranslation();
	const router = useRouter();

	const [, setProposal] = useRecoilState(proposalState);
	const [panelType, setPanelType] = useRecoilState(panelState);
	const activeTab = useActiveTab();

	const fetchPreloadedProposal = useCallback(() => {
		const fetch = async () => {
			const hash = router && router.query.panel ? router.query?.panel[1] : '';
			const { proposal }: { proposal: ProposalType } = await request(
				snapshotEndpoint,
				gql`
					query Proposals($id: String) {
						proposal(id: $id) {
							id
							title
							body
							choices
							start
							end
							snapshot
							state
							author
							space {
								id
								name
							}
						}
					}
				`,
				{ id: hash }
			);
			setProposal(proposal);
			setPanelType(PanelType.PROPOSAL);
		};
		fetch();
	}, [router, setPanelType, setProposal]);

	useEffect(() => {
		if (Array.isArray(router.query.panel) && router.query.panel[1]) {
			if (router.query.panel[1] === 'create') {
				setPanelType(PanelType.CREATE);
			} else {
				fetchPreloadedProposal();
			}
		} else {
			setPanelType(PanelType.LIST);
			setProposal(null);
		}
	}, [router, fetchPreloadedProposal, setPanelType, setProposal]);

	const tabData = useMemo(
		() => [
			{
				title: t('gov.panel.council.title'),
				tabChildren: <List spaceKey={activeTab} />,
				blue: true,
				key: SPACE_KEY.COUNCIL,
			},
			{
				title: t('gov.panel.proposals.title'),
				tabChildren: <List spaceKey={activeTab} />,
				blue: true,
				key: SPACE_KEY.PROPOSAL,
			},
			{
				title: t('gov.panel.grants.title'),
				tabChildren: <List spaceKey={activeTab} />,
				blue: true,
				key: SPACE_KEY.GRANTS,
			},
			{
				title: t('gov.panel.ambassador.title'),
				tabChildren: <List spaceKey={activeTab} />,
				blue: true,
				key: SPACE_KEY.AMBASSADOR,
			},
		],
		[t, activeTab]
	);

	const returnContent = () => {
		switch (panelType) {
			case PanelType.LIST:
				return (
					<Row>
						<LeftCol>
							<StructuredTab
								boxPadding={20}
								boxHeight={600}
								boxWidth={700}
								tabData={tabData}
								setPanelType={(key) => router.push(`/gov/${key}`)}
								currentPanel={currentTab}
							/>
						</LeftCol>
						<RightCol>
							<CouncilBoard />
						</RightCol>
					</Row>
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
					<Row>
						<LeftCol>
							<StructuredTab
								boxPadding={20}
								boxHeight={600}
								boxWidth={700}
								tabData={tabData}
								setPanelType={(key) => router.push(`/gov/${key}`)}
								currentPanel={currentTab}
							/>
						</LeftCol>
						<RightCol>
							<CouncilBoard />
						</RightCol>
					</Row>
				);
		}
	};

	return returnContent();
};
export default Panel;
