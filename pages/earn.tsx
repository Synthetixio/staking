import Head from 'next/head';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Column, Row } from 'styles/common';

import { Incentives, ClaimBox } from 'sections/earn';

const Earn = () => {
	const { t } = useTranslation();

	return (
		<>
			<Head>
				<title>{t('earn.page-title')}</title>
			</Head>
			<Row>
				<Column>
					<Incentives />
				</Column>
				<Column>
					<ClaimBox />
				</Column>
			</Row>
		</>
	);
};

export default Earn;
