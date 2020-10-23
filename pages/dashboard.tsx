import Head from 'next/head';
import styled from 'styled-components';

import { useTranslation } from 'react-i18next';

import { FlexDivCol } from 'styles/common';
import PossibleActions from 'sections/dashboard';

const DashboardPage = () => {
	const { t } = useTranslation();

	return (
		<Content>
			<Head>
				<title>{t('dashboard.page-title')}</title>
			</Head>
			<PossibleActions claimAmount={20} sUSDAmount={2000} SNXAmount={400} earnPercent={0.15} />
		</Content>
	);
};

const Content = styled(FlexDivCol)`
	width: 100%;
	max-width: 1200px;
`;

export default DashboardPage;
