import { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { truncateAddress } from 'utils/formatters/string';
import { CellProps } from 'react-table';
import Table from 'components/Table';
import useMediaQuery from 'hooks/useMediaQuery';
import { ExternalLink, FlexDivRow, Tooltip } from 'styles/common';
import WalletIcon from 'assets/svg/app/wallet-yellow.svg';
import ToggleDelegateApproval from './ToggleDelegateApproval';
import useSynthetixQueries, { DELEGATE_ENTITY_ATTRS } from '@synthetixio/queries';
import { DelegationWallet } from '@synthetixio/queries';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import Refresh from 'assets/svg/app/arrows-change.svg';
import Connector from 'containers/Connector';

const DelegateTable: FC = () => {
  const { t } = useTranslation();

  const { useGetDelegateWallets } = useSynthetixQueries();

  const { walletAddress } = Connector.useContainer();

  const delegateWalletsQuery = useGetDelegateWallets(walletAddress || '', {
    enabled: Boolean(walletAddress),
  });
  const delegateWallets = delegateWalletsQuery?.data ?? [];

  const isSM = useMediaQuery('sm');

  const columns = useMemo(
    () => [
      {
        Header: <>{t('delegate.list.cols.address')}</>,
        accessor: 'address',
        width: isSM ? 70 : 100,
        sortable: true,
        Cell: (cellProps: CellProps<DelegationWallet>) => {
          const delegateAddress = cellProps.value;
          return (
            <Tooltip
              content={
                <AddressToolTip>
                  <NoMarginP>{delegateAddress}</NoMarginP> ({t('delegate.list.click-to-copy')})
                </AddressToolTip>
              }
            >
              <NoMarginP>
                <CopyToClipboard text={delegateAddress || ''}>
                  <NoMarginP>
                    {truncateAddress(delegateAddress, isSM ? 4 : 5, isSM ? 2 : 3)}
                  </NoMarginP>
                </CopyToClipboard>
              </NoMarginP>
            </Tooltip>
          );
        },
      },
      ...Array.from(DELEGATE_ENTITY_ATTRS.entries()).map(([action, attr]) => ({
        Header: <>{t(`delegate.list.cols.${attr}`)}</>,
        accessor: attr,
        width: isSM ? 40 : 50,
        sortable: true,
        Cell: (cellProps: CellProps<DelegationWallet>) => {
          return (
            <ToggleDelegateApproval
              onDelegateToggleSuccess={async () => {
                delegateWalletsQuery.refetch();
              }}
              account={cellProps.row.original}
              action={action}
              value={cellProps.value}
            />
          );
        },
      })),
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [t, isSM]
  );

  const noResultsMessage =
    !delegateWalletsQuery.isFetching && delegateWallets.length === 0 ? (
      <ListTableEmptyMessage>
        <WalletIcon width={38} />
        {t('delegate.list.empty')}
      </ListTableEmptyMessage>
    ) : null;

  return (
    <Root data-testid="table">
      <Container>
        <ContainerHeader>
          <Title>{t('delegate.info.title')}</Title>
          <Subtitle>
            {t('delegate.info.subtitle')}{' '}
            <ExternalLink href="https://sips.synthetix.io/sips/sip-14">
              {t('delegate.info.learn-more')}
            </ExternalLink>
          </Subtitle>
        </ContainerHeader>
      </Container>

      <Container>
        <ContainerHeader>
          <ListTitle>
            <FlexDivRow>
              {t('delegate.list.title')}{' '}
              <Tooltip content={t('delegate.list.refresh-tooltip')}>
                <NoMarginP>
                  <Refresh
                    width="16"
                    style={{ cursor: 'pointer' }}
                    onClick={() => delegateWalletsQuery.refetch()}
                  />
                </NoMarginP>
              </Tooltip>
            </FlexDivRow>
          </ListTitle>

          <ListTable
            palette="primary"
            isLoading={delegateWalletsQuery.isFetching}
            /* @ts-ignore TODO: replace with chakra table */
            columns={columns}
            data={delegateWallets}
            noResultsMessage={noResultsMessage}
            showPagination={true}
          />
        </ContainerHeader>
      </Container>
    </Root>
  );
};

export default DelegateTable;

export const Root = styled.div`
  & > div {
    margin-bottom: 32px;
  }

  a,
  a:visited {
    color: ${(props) => props.theme.colors.blue};
    text-decoration: none;
  }
`;

export const Container = styled.div`
  background: ${(props) => props.theme.colors.navy};
`;

export const ContainerHeader = styled.div`
  padding: 16px;
`;

export const Title = styled.div`
  font-family: ${(props) => props.theme.fonts.extended};
  color: ${(props) => props.theme.colors.white};
  font-size: 14px;
`;
export const Subtitle = styled.div`
  font-family: ${(props) => props.theme.fonts.regular};
  color: ${(props) => props.theme.colors.gray};
  font-size: 14px;
  margin-top: 12px;
`;

const NoMarginP = styled.p`
  margin: 0;
  padding: 0;
`;
const AddressToolTip = styled(NoMarginP)`
  text-align: center;
`;

const ListTable = styled(Table)`
  .table-row,
  .table-body-row {
    & > :last-child {
      justify-content: flex-end;
    }
  }

  .table-body {
    min-height: 300px;
  }

  .table-header-cell,
  .table-body-cell {
    padding: 0;
  }
`;

const ListTitle = styled(Title)`
  text-transform: uppercase;
`;

const ListTableEmptyMessage = styled.div`
  font-size: 12px;
  padding: 20px 0 0;
  display: flex;
  flex-direction: column;
  justify-items: space-around;
  align-items: center;
  color: white;

  svg {
    margin-bottom: 10px;
  }
`;
