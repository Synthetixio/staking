import Head from 'next/head';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';

import StatBox from 'components/StatBox';
import { StatsSection, LineSpacer } from 'styles/common';

import useEscrowDataQuery from 'queries/escrow/useEscrowDataQuery';
import { formatCryptoCurrency } from '../utils/formatters/number';

import Main from 'sections/escrow/index';

const SNX_HEADER_DECIMALS = 2;

const EscrowPage = () => {
	const { t } = useTranslation();

	const escrowDataQuery = useEscrowDataQuery();
	const escrowData = escrowDataQuery?.data;

	return (
		<>
			<Head>
				<title>{t('escrow.page-title')}</title>
			</Head>
			<StatsSection>
				<Available
					title={t('common.stat-box.available-snx')}
					value={formatCryptoCurrency(escrowData?.canVest ?? 0, {
						decimals: SNX_HEADER_DECIMALS,
					})}
				/>
				<Vested
					title={t('common.stat-box.vested-snx')}
					value={formatCryptoCurrency(escrowData?.totalVested ?? 0, {
						decimals: SNX_HEADER_DECIMALS,
					})}
					size="lg"
				/>
				<Escrowed
					title={t('common.stat-box.escrowed-snx')}
					value={formatCryptoCurrency(escrowData?.totalEscrowed ?? 0, {
						decimals: SNX_HEADER_DECIMALS,
					})}
				/>
			</StatsSection>
			<LineSpacer />
			<Main />
		</>
	);
};

const Available = styled(StatBox)`
	.title {
		color: ${(props) => props.theme.colors.green};
	}
`;

const Vested = styled(StatBox)`
	.title {
		color: ${(props) => props.theme.colors.green};
	}
	.value {
		text-shadow: ${(props) => props.theme.colors.greenTextShadow};
		color: #073124;
	}
`;

const Escrowed = styled(StatBox)`
	.title {
		color: ${(props) => props.theme.colors.green};
	}
`;

export default EscrowPage;
