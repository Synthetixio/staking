import { FC } from 'react';
import Head from 'next/head';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import StatBox from 'components/StatBox';
import { StatsSection, LineSpacer } from 'styles/common';
import { formatCryptoCurrency } from 'utils/formatters/number';
import { DelegatesProvider } from 'sections/delegate/contexts/delegates';
import Main from 'sections/delegate/index';

const SNX_HEADER_DECIMALS = 2;

type DelegatePageProps = {};

const DelegatePage: FC<DelegatePageProps> = () => {
	const { t } = useTranslation();

	return (
		<DelegatesProvider>
			<Head>
				<title>{t('delegate.page-title')}</title>
			</Head>
			<StatsSection>
				<StakedValue
					title={t('common.stat-box.staked-value')}
					value={formatCryptoCurrency(0, {
						decimals: SNX_HEADER_DECIMALS,
					})}
				/>
				<Earning
					title={t('common.stat-box.earning')}
					value={formatCryptoCurrency(0, {
						decimals: SNX_HEADER_DECIMALS,
					})}
					size="lg"
				/>
				<ActiveDebt
					title={t('common.stat-box.active-debt')}
					value={formatCryptoCurrency(0, {
						decimals: SNX_HEADER_DECIMALS,
					})}
				/>
			</StatsSection>
			<LineSpacer />
			<Main />
		</DelegatesProvider>
	);
};

const StakedValue = styled(StatBox)`
	.title {
		color: ${(props) => props.theme.colors.green};
	}
`;

const Earning = styled(StatBox)`
	.title {
		color: ${(props) => props.theme.colors.green};
	}
	.value {
		text-shadow: ${(props) => props.theme.colors.greenTextShadow};
		color: #073124;
	}
`;

const ActiveDebt = styled(StatBox)`
	.title {
		color: ${(props) => props.theme.colors.green};
	}
`;

export default DelegatePage;
