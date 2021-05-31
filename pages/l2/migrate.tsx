import { FC, useEffect } from 'react';
import Head from 'next/head';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';

import Main from 'sections/layer2/migrate';
import StatBox from 'components/StatBox';
import { LineSpacer } from 'styles/common';
import StatsSection from 'components/StatsSection';
import useEscrowCalculations from 'sections/escrow/hooks/useEscrowCalculations';
import { formatCryptoCurrency } from 'utils/formatters/number';
import UIContainer from 'containers/UI';

const SNX_HEADER_DECIMALS = 2;

const L2Page: FC = () => {
	const { t } = useTranslation();
	const { setTitle } = UIContainer.useContainer();
	const escrowCalculations = useEscrowCalculations();

	const totalEscrowed = escrowCalculations?.totalEscrowBalance;
	const totalClaimable = escrowCalculations?.totalClaimableBalance;
	const totalVested = escrowCalculations?.totalVestedBalance;

	// header title
	useEffect(() => {
		setTitle('l2', 'migrate');
	}, [setTitle]);

	return (
		<>
			<Head>
				<title>{t('escrow.page-title')}</title>
			</Head>
			<StatsSection>
				<Available
					title={t('common.stat-box.available-snx')}
					value={formatCryptoCurrency(totalClaimable ?? 0, {
						decimals: SNX_HEADER_DECIMALS,
					})}
				/>
				<Escrowed
					title={t('common.stat-box.escrowed-snx')}
					value={formatCryptoCurrency(totalEscrowed ?? 0, {
						decimals: SNX_HEADER_DECIMALS,
					})}
					size="lg"
				/>
				<Vested
					title={t('common.stat-box.vested-snx')}
					value={formatCryptoCurrency(totalVested ?? 0, {
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
`;

const Escrowed = styled(StatBox)`
	.title {
		color: ${(props) => props.theme.colors.green};
	}
	.value {
		text-shadow: ${(props) => props.theme.colors.greenTextShadow};
		color: #073124;
	}
`;

export default L2Page;
