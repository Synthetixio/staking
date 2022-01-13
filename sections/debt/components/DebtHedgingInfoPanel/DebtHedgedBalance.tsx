import useUniswapSUSDdSNXPool from 'hooks/uniswapDebtMirrorIndex';
import { useTranslation } from 'react-i18next';

export default function DebtHedgedBalance({ userBalance }: Record<'userBalance', string>) {
	const { t } = useTranslation();
	const uniswapPool = useUniswapSUSDdSNXPool();
	const sUSDPrice = uniswapPool.data?.token0Price.toFixed();
	const dSNXUserBalance = (Number(userBalance) * Number(sUSDPrice)).toFixed(2);
	return (
		<span>
			{t('debt.actions.manage.info-panel.chart.hedged-balance')} ~{dSNXUserBalance}$
		</span>
	);
}
