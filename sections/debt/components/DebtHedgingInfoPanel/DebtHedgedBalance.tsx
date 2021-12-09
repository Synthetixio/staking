import useUniswapSUSDdSNXPool from 'hooks/uniswapDebtMirrorIndex';
import { useTranslation } from 'react-i18next';

export default function DebtHedgedBalance({ userBalance }: Record<'userBalance', number>) {
	const { t } = useTranslation();
	const uniswapPool = useUniswapSUSDdSNXPool();
	// multiply the userBalance with the token Balance to get the value in USD?

	return <span>{t('debt.actions.manage.info-panel.chart.hedged-balance')} ~1234$</span>;
}
