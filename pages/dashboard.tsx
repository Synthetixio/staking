import Head from 'next/head';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { FlexDivCol, FlexDivRow } from 'styles/common';

const DashboardPage = () => {
	const { t } = useTranslation();

	return (
		<>
			<Head>
				<title>{t('dashboard.page-title')}</title>
			</Head>
			<Content>
				<StatsSection></StatsSection>
			</Content>
		</>
	);
};

const Content = styled(FlexDivCol)``;

const StatsSection = styled(FlexDivRow)``;

export default DashboardPage;
