import { wei } from '@synthetixio/wei';
import { useTranslation } from 'react-i18next';
import { useRecoilValue } from 'recoil';
import { dSNXBalance } from 'store/debt';
import styled from 'styled-components';
import { formatCryptoCurrency } from 'utils/formatters/number';

export default function DebtHedgedBalance() {
	const { t } = useTranslation();
	const balance = useRecoilValue(dSNXBalance);
	return (
		<StyledBalance>
			{t('debt.actions.manage.info-panel.chart.hedged-balance')}&nbsp;~ $
			{formatCryptoCurrency(wei(balance), { maxDecimals: 1, minDecimals: 2 })}
		</StyledBalance>
	);
}

const StyledBalance = styled.span`
	font-size: 12px;
	margin: 4px 0px;
`;
