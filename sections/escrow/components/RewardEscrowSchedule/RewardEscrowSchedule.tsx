import React from 'react';
import { useTranslation, Trans } from 'react-i18next';
import styled from 'styled-components';
import { useRouter } from 'next/router';

import { EXTERNAL_LINKS } from 'constants/links';
import { CryptoCurrency } from 'constants/currency';
import { formatShortDate } from 'utils/formatters/date';
import { formatCurrency } from 'utils/formatters/number';
import ROUTES from 'constants/routes';

import CallToActionIcon from 'assets/svg/app/call-to-action.svg';

import {
  Container,
  ContainerHeader,
  ContainerBody,
  Data,
  Header,
  StyledTable,
  Subtitle,
  Title,
} from 'sections/escrow/components/common';
import Button from 'components/Button';
import { FlexDivCentered, FlexDivColCentered, ExternalLink } from 'styles/common';
import useSynthetixQueries from '@synthetixio/queries';
import Connector from 'containers/Connector';

const RewardEscrowSchedule: React.FC = () => {
  const { t } = useTranslation();
  const { walletAddress } = Connector.useContainer();

  const { useEscrowDataQuery } = useSynthetixQueries();

  const escrowDataQuery = useEscrowDataQuery(walletAddress);
  const schedule = escrowDataQuery?.data?.schedule;
  const totalBalancePendingMigration = escrowDataQuery?.data?.totalBalancePendingMigration ?? 0;
  const router = useRouter();
  return (
    <Container>
      <ContainerHeader>
        <Title>
          {totalBalancePendingMigration > 0
            ? t('escrow.staking.info.title-migrate-l1')
            : t('escrow.staking.info.title')}
        </Title>
        <Subtitle>
          {totalBalancePendingMigration > 0 ? (
            <Trans
              i18nKey="escrow.staking.info.subtitle-migrate-l1"
              components={[<StyledLink href={EXTERNAL_LINKS.Synthetix.SIP60} />]}
            />
          ) : (
            t('escrow.staking.info.subtitle')
          )}
        </Subtitle>
      </ContainerHeader>
      <ContainerBody>
        {(schedule ?? []).length > 0 || escrowDataQuery.isLoading ? (
          <StyledTable
            palette="primary"
            /* @ts-ignore TODO: replace with chakra table */
            columns={[
              {
                Header: <Header>{t('escrow.table.vesting-date')}</Header>,
                accessor: 'date',
                Cell: (cellProps) => <Data>{formatShortDate(cellProps.value)}</Data>,
                sortable: false,
              },
              {
                Header: (
                  <Header style={{ textAlign: 'right' }}>{t('escrow.table.snx-amount')}</Header>
                ),
                accessor: 'quantity',
                Cell: (cellProps) => (
                  <Data style={{ textAlign: 'right' }}>
                    {formatCurrency(CryptoCurrency.SNX, cellProps.value)}
                  </Data>
                ),
                sortable: false,
              },
            ]}
            options={{ autoResetPage: false }}
            data={schedule ? schedule.filter((e: any) => e.quantity.gt(0)) : []}
            isLoading={escrowDataQuery.isLoading}
            showPagination={true}
          />
        ) : (
          <CallToActionContainer>
            <FlexDivColCentered>
              <CallToActionIcon width="72" />
              <CallToActionInfo>{t('escrow.actions.stake.no-escrowed-snx')}</CallToActionInfo>
              <StyledButton
                size="lg"
                variant="primary"
                onClick={() => router.push(ROUTES.Staking.Home)}
              >
                {t('escrow.actions.stake.stake-now')}
              </StyledButton>
            </FlexDivColCentered>
          </CallToActionContainer>
        )}
      </ContainerBody>
    </Container>
  );
};

const CallToActionContainer = styled(FlexDivCentered)`
  justify-content: center;
  padding: 16px 0 32px 0;
`;

const CallToActionInfo = styled(Subtitle)`
  margin-top: 0;
`;

const StyledButton = styled(Button)`
  width: 100%;
`;

export const StyledLink = styled(ExternalLink)`
  color: ${(props) => props.theme.colors.blue};
`;

export default RewardEscrowSchedule;
