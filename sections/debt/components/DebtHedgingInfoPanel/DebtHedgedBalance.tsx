import Connector from 'containers/Connector';
import { utils } from 'ethers';
import { useTranslation } from 'react-i18next';
import { useRecoilValue } from 'recoil';
import { dSNXBalance } from 'store/debt';

export default function DebtHedgedBalance() {
	const { t } = useTranslation();
	const balance = useRecoilValue(dSNXBalance);
	return (
		<span>
			{t('debt.actions.manage.info-panel.chart.hedged-balance')} ~
			{utils.formatUnits(balance, 18).slice(0, 12)}$
		</span>
	);
}
