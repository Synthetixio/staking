import React, { useMemo, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'react-i18next';
import { useRecoilState } from 'recoil';

import { snapshotEndpoint, SPACE_KEY } from 'constants/snapshot';
import { panelState, PanelType, proposalState } from 'store/gov';

import { Grid, Col } from 'sections/gov/components/common';

import UnstructuredTab from 'components/UnstructuredTab';
import CouncilBoard from './List/CouncilBoard';
import Proposal from './Proposal';
import List from './List';
import Create from './Create';
import ROUTES from 'constants/routes';

type PanelProps = {
	currentTab: string;
};

const Panel = () => {
	const { t } = useTranslation();
	const router = useRouter();
	
	const proposalsData = useMemo(
		() => ({
			title: t('gov.panel.proposals.title'),
			description: t('gov.panel.proposals.description'),
			tabChildren: <List spaceKey={SPACE_KEY.PROPOSAL} />, // Static list now
			blue: true,
			key: SPACE_KEY.PROPOSAL,
		}),

		[t]
	);
	switch (panelType) {
		case PanelType.PROPOSAL:
			return (
				<Proposal
					onBack={() => {
						router.push(ROUTES.Gov.Home);
					}}
				/>
			);
		case PanelType.CREATE:
			return (
				<Create
					onBack={() => {
						router.push(ROUTES.Gov.Home);
					}}
				/>
			);
		default:
			return (
				<Grid>
					<Col>
						<UnstructuredTab tabData={proposalsData} />
					</Col>
					<Col>
						<CouncilBoard />
					</Col>
				</Grid>
			);
	}
};

export default Panel;
