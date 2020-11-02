import Head from 'next/head';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { MintBurnBox } from 'sections/staking';
import { FlexDivCol, FlexDivRow } from 'styles/common';
import { InfoBox } from 'sections/staking/InfoBox';

const StakingPage = () => {
	const { t } = useTranslation();

	return (
		<>
			<Head>
				<title>{t('staking.page-title')}</title>
			</Head>
			<Row>
				<Column>
					<InfoBox />
				</Column>
				<Column>
					<MintBurnBox />
				</Column>
			</Row>
		</>
	);
};

const Row = styled(FlexDivRow)`
	margin: 20px 0px;
`;

const Column = styled(FlexDivCol)`
	width: 50%;
`;

export default StakingPage;
