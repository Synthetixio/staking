import { getdSNXSUSDImmutablesAndPool } from 'constants/uniswap';
import Connector from 'containers/Connector';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function DebtHedgedBalance({ userBalance }: Record<'userBalance', string>) {
	const { t } = useTranslation();
	const [sUSDPrice, setSUSDPrice] = useState('');
	const { provider } = Connector.useContainer();
	const dSNXUserBalance = (Number(userBalance) * Number(sUSDPrice)).toFixed(2);
	useEffect(() => {
		if (provider) {
			getdSNXSUSDImmutablesAndPool(provider).then(([_, pool]) => {
				// setSUSDPrice(pool.priceOf(pool.token1).toSignificant());
			});
		}
	}, [provider]);
	return (
		<span>
			{t('debt.actions.manage.info-panel.chart.hedged-balance')} ~{dSNXUserBalance}$
		</span>
	);
}
