import React, { useMemo } from 'react';
import styled from 'styled-components';
import { CellProps, Row } from 'react-table';
import { FlexDivCol } from 'styles/common';
import media from 'styles/media';
import Button from 'components/Button';
import useSynthetixQueries, { Proposal as ProposalType } from '@synthetixio/queries';
import Table from 'components/Table';
import { useTranslation } from 'react-i18next';
import Countdown from 'react-countdown';
import { useRouter } from 'next/router';
import ROUTES from 'constants/routes';
import { DURATION_SEPARATOR } from 'constants/date';
import { getCurrentTimestampSeconds } from 'utils/formatters/date';
import { DesktopOrTabletView, MobileOnlyView } from 'components/Media';
import { snapshotEndpoint, SPACE_KEY } from 'constants/snapshot';
import Connector from 'containers/Connector';

type IndexProps = {
  spaceKey: SPACE_KEY;
};

const Index: React.FC<IndexProps> = ({ spaceKey }) => {
  return (
    <>
      <DesktopOrTabletView>
        <ResponsiveTable spaceKey={spaceKey} />
      </DesktopOrTabletView>
      <MobileOnlyView>
        <ResponsiveTable spaceKey={spaceKey} mobile />
      </MobileOnlyView>
    </>
  );
};

type ResponsiveTableProps = {
  mobile?: boolean;
  spaceKey: SPACE_KEY;
};

const ResponsiveTable: React.FC<ResponsiveTableProps> = ({ mobile, spaceKey }) => {
  const { t } = useTranslation();
  const router = useRouter();

  const { isWalletConnected, isL2 } = Connector.useContainer();

  const { useProposalsQuery } = useSynthetixQueries();

  const proposals = useProposalsQuery(snapshotEndpoint, spaceKey);

  const columns = useMemo(() => {
    const widths = mobile ? ['auto', 70, 70, 50] : [200, 75, 100, 75];
    return [
      {
        Header: <>{t('gov.table.description')}</>,
        accessor: 'description',
        Cell: (cellProps: CellProps<ProposalType>) => (
          <CellContainer>
            <Title>{cellProps.row.original.title}</Title>
          </CellContainer>
        ),
        sortable: false,
      },
      {
        Header: <>{t('gov.table.status.title')}</>,
        accessor: 'status',
        Cell: (cellProps: CellProps<ProposalType>) => {
          const currentTimestampSeconds = getCurrentTimestampSeconds();
          const closed = cellProps.row.original.end < currentTimestampSeconds ? true : false;
          const pending = currentTimestampSeconds < cellProps.row.original.start ? true : false;
          return (
            <CellContainer>
              <Status closed={closed} pending={pending}>
                {closed
                  ? `${t('gov.table.status.closed')}`
                  : pending
                  ? `${t('gov.table.status.pending')}`
                  : `${t('gov.table.status.open')}`}
              </Status>
            </CellContainer>
          );
        },
        sortable: false,
      },
      {
        Header: <>{t('gov.table.time')}</>,
        accessor: 'timeLeft',
        Cell: (cellProps: CellProps<ProposalType>) => (
          <CellContainer>
            <Title isNumeric={true}>
              <Countdown
                autoStart={true}
                date={cellProps.row.original.end * 1000}
                renderer={({ days, hours, minutes }) => {
                  if (mobile) {
                    const duration = [days, hours, minutes];
                    return <span>{duration.join(':')}</span>;
                  }

                  const duration = [
                    `${days}${t('common.time.days')}`,
                    `${hours}${t('common.time.hours')}`,
                    `${minutes}${t('common.time.minutes')}`,
                  ];

                  return <span>{duration.join(DURATION_SEPARATOR)}</span>;
                }}
              />
            </Title>
          </CellContainer>
        ),
        sortable: false,
      },
    ].map((c, i) => ({ ...c, width: widths[i] }));
  }, [t, mobile]);

  return (
    <Container>
      <StyledTable
        palette="primary"
        /* @ts-ignore TODO: replace with chakra table */
        columns={columns}
        data={proposals.data ?? []}
        maxRows={10}
        isLoading={proposals.isLoading}
        showPagination={true}
        onTableRowClick={(row: Row<ProposalType>) => {
          router.push(ROUTES.Gov.Proposal(spaceKey, row.original.id));
        }}
        minHeight={false}
      />
      {isWalletConnected &&
        (spaceKey === SPACE_KEY.PROPOSAL ? (
          isL2 ? (
            <AbsoluteContainer
              onClick={() => {
                router.push(ROUTES.Gov.Create(spaceKey));
              }}
            >
              <CreateButton variant="secondary">{t('gov.table.create')}</CreateButton>
            </AbsoluteContainer>
          ) : (
            <AbsoluteContainer>
              <CreateButton disabled variant="secondary">
                {t('gov.table.switch')}
              </CreateButton>
            </AbsoluteContainer>
          )
        ) : (
          <AbsoluteContainer
            onClick={() => {
              router.push(ROUTES.Gov.Create(spaceKey));
            }}
          >
            <CreateButton variant="secondary">{t('gov.table.create')}</CreateButton>
          </AbsoluteContainer>
        ))}
    </Container>
  );
};
export default Index;

const Container = styled.div`
  position: relative;
  height: 100%;
`;

const StyledTable = styled(Table)<{ minHeight: boolean }>`
  min-height: ${(props) => (props.minHeight ? '400px' : '0px')};
  .table-body-row {
    height: 50px;
    align-items: center;
    &:hover {
      background-color: ${(props) => props.theme.colors.mediumBlue};
    }
    &.active-row {
      border-right: 1px solid ${(props) => props.theme.colors.blue};
    }
  }
  .table-body-cell {
    &:first-child {
      ${media.lessThan('md')`
        padding-left: 0;
      `}
    }
    &:last-child {
      padding-left: 0;
    }
  }
`;

const CellContainer = styled(FlexDivCol)`
  width: 100%;
  margin-right: 15px;
`;

const Title = styled.div<{ isNumeric?: boolean }>`
  font-family: ${(props) =>
    props.isNumeric ? props.theme.fonts.mono : props.theme.fonts.interBold};
  color: ${(props) => props.theme.colors.white};
  font-size: 12px;
  ${media.lessThan('mdUp')`
    overflow-x: hidden;
  `}
`;

const Status = styled.div<{ closed: boolean; pending: boolean }>`
  color: ${(props) =>
    props.closed
      ? props.theme.colors.gray
      : props.pending
      ? props.theme.colors.yellow
      : props.theme.colors.green};
  text-transform: uppercase;
  font-family: ${(props) => props.theme.fonts.interBold};
  font-size: 12px;
`;

const AbsoluteContainer = styled.div`
  width: 100%;
  bottom: 0px;
  margin-bottom: 24px;
  padding: 0px 16px;
  margin-top: 24px;
`;

const CreateButton = styled(Button)`
  text-transform: uppercase;
  width: 100%;
`;
