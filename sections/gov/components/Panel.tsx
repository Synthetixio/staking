import React, { useMemo, useEffect } from 'react';
import styled from 'styled-components';
import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';
import { useRecoilState, useRecoilValue } from 'recoil';

import useProposals from 'queries/gov/useProposals';

import ROUTES from 'constants/routes';
import { SPACE_KEY } from 'constants/snapshot';

import { isWalletConnectedState } from 'store/wallet';
import { panelState, PanelType, proposalState } from 'store/gov';

import useActiveTab from '../hooks/useActiveTab';
import { FlexDivCol, Row } from 'styles/common';

import StructuredTab from 'components/StructuredTab';
import CouncilBoard from './List/CouncilBoard';
import Info from './Proposal/Info';
import Proposal from './Proposal';
import List from './List';
import Options from './Create/Options';
import Create from './Create';

type PanelProps = {
	currentTab: string;
};

const Panel: React.FC<PanelProps> = ({ currentTab }) => {
	const { t } = useTranslation();
	const router = useRouter();

	const councilProposals = useProposals(SPACE_KEY.COUNCIL, true);
	const govProposals = useProposals(SPACE_KEY.PROPOSAL, true);
	const grantsProposals = useProposals(SPACE_KEY.GRANTS, true);

	const isWalletConnected = useRecoilValue(isWalletConnectedState);
	const [proposal, setProposal] = useRecoilState(proposalState);
	const [panelType, setPanelType] = useRecoilState(panelState);
	const activeTab = useActiveTab();

	useEffect(() => {
		if (
			councilProposals.data &&
			govProposals.data &&
			grantsProposals.data &&
			isWalletConnected &&
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
		isWalletConnected,
		councilProposals,
		govProposals,
		grantsProposals,
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
				title: t('gov.panel.grants.title'),
				tabChildren: (
					<List data={grantsProposals.data ?? []} isLoaded={!grantsProposals.isLoading} />
				),
				blue: true,
				key: SPACE_KEY.GRANTS,
			},
			{
				title: t('gov.panel.proposals.title'),
				tabChildren: <List data={govProposals.data ?? []} isLoaded={!govProposals.isLoading} />,
				blue: true,
				key: SPACE_KEY.PROPOSAL,
			},
		],
		[t, councilProposals, govProposals, grantsProposals]
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
								boxWidth={750}
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
					<Row>
						<LeftCol>
							<Proposal
								spaceKey={activeTab}
								proposal={proposal}
								onBack={() => {
									setProposal(null);
									setPanelType(PanelType.LIST);
									router.push(ROUTES.Gov.Space(activeTab));
								}}
							/>
						</LeftCol>
						<RightCol>
							<Info />
						</RightCol>
					</Row>
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
								boxWidth={750}
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

const LeftCol = styled(FlexDivCol)`
	width: 700px;
	margin-right: 8px;
`;

const RightCol = styled(FlexDivCol)`
	width: 200px;
	margin-left: 8px;
`;
