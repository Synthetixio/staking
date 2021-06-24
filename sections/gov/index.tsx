import { FC } from 'react';
import { useRouter } from 'next/router';
import Panel from 'sections/gov/components/Panel';
import { SPACE_KEY } from 'constants/snapshot';

const Index: FC = () => {
	const router = useRouter();
	const defaultTab = (router.query.panel && router.query.panel[0]) || SPACE_KEY.PROPOSAL;

	return <Panel currentTab={defaultTab} />;
};

export default Index;
