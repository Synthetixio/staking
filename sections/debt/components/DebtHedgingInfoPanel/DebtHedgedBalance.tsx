import { wei } from '@synthetixio/wei';
import useGetDSnxBalance from 'hooks/useGetDSnxBalance';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { formatCryptoCurrency } from 'utils/formatters/number';

export default function DebtHedgedBalance() {
  const { t } = useTranslation();
  const dSNXBalanceQuery = useGetDSnxBalance({ keepPreviousData: true });
  return (
    <StyledBalance>
      {t('debt.actions.manage.info-panel.chart.hedged-balance')}&nbsp;~ $
      {formatCryptoCurrency(dSNXBalanceQuery.data || wei(0), { maxDecimals: 1, minDecimals: 2 })}
    </StyledBalance>
  );
}

const StyledBalance = styled.span`
  font-size: 12px;
  margin: 4px 0px;
`;
