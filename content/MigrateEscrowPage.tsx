import { FC } from 'react';
import Head from 'next/head';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';

import Main from 'sections/migrate-escrow/migrate';
import StatBox from 'components/StatBox';
import { LineSpacer } from 'styles/common';
import StatsSection from 'components/StatsSection';
import useEscrowCalculations from 'sections/escrow/hooks/useEscrowCalculations';
import { formatCryptoCurrency } from 'utils/formatters/number';

const SNX_HEADER_DECIMALS = 2;

const L2MigratePage: FC = () => {
  const { t } = useTranslation();

  const escrowCalculations = useEscrowCalculations();

  const totalEscrowed = escrowCalculations?.totalEscrowBalance;
  const totalClaimable = escrowCalculations?.totalClaimableBalance;
  const totalVested = escrowCalculations?.totalVestedBalance;

  return (
    <>
      <Head>
        <title>{t('escrow.page-title')}</title>
      </Head>
      <StatsSection>
        <Available
          title={t('common.stat-box.available-snx')}
          value={formatCryptoCurrency(totalClaimable ?? 0, {
            minDecimals: SNX_HEADER_DECIMALS,
            maxDecimals: SNX_HEADER_DECIMALS,
          })}
        />
        <Escrowed
          title={t('common.stat-box.escrowed-snx')}
          value={formatCryptoCurrency(totalEscrowed ?? 0, {
            minDecimals: SNX_HEADER_DECIMALS,
            maxDecimals: SNX_HEADER_DECIMALS,
          })}
          size="lg"
        />
        <Vested
          title={t('common.stat-box.vested-snx')}
          value={formatCryptoCurrency(totalVested ?? 0, {
            minDecimals: SNX_HEADER_DECIMALS,
            maxDecimals: SNX_HEADER_DECIMALS,
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

export default L2MigratePage;
