import { useTranslation } from 'react-i18next';
import { CellProps } from 'react-table';
import styled from 'styled-components';

import { InfoContainer, Title, Subtitle } from '../../components/common';
import ExternalLink from '../../components/ExternalLink';
import useGetDepositsDataQuery, { DepositHistory } from 'queries/deposits/useGetDepositsDataQuery';
import { FlexDivColCentered } from 'styles/common';

import { formatShortDate } from 'utils/formatters/date';
import { formatCurrency } from 'utils/formatters/number';
import { CryptoCurrency } from 'constants/currency';

// This needs to be put somewhere else
import {
	ContainerHeader,
	ContainerBody,
	Header,
	StyledTable,
} from 'sections/escrow/components/common';

const InfoBox = () => {
	const { t } = useTranslation();
	const depositsDataQuery = useGetDepositsDataQuery();
	const depositHistory = depositsDataQuery?.data ?? null;

	return (
		<InfoContainer>
			<ContainerHeader>
				<Title>{t('layer2.deposit.info.title')}</Title>
				<StyledSubtitle> {t('layer2.deposit.info.subtitle')}</StyledSubtitle>
			</ContainerHeader>
			<ContainerBody>
				{depositHistory && depositHistory.length > 0 ? (
					<StyledTable
						palette="primary"
						columns={[
							{
								Header: <Header>{t('layer2.deposit.info.table.deposit')}</Header>,
								accessor: 'amount',
								Cell: (cellProps: CellProps<DepositHistory, number>) => (
									<Data>
										{formatCurrency(CryptoCurrency.SNX, cellProps.value, {
											currencyKey: CryptoCurrency.SNX,
											decimals: 2,
										})}
									</Data>
								),
								width: 100,
								sortable: false,
							},
							{
								Header: (
									<Header style={{ textAlign: 'right' }}>
										{t('layer2.deposit.info.table.date')}
									</Header>
								),
								accessor: 'timestamp',
								Cell: (cellProps: CellProps<DepositHistory, Date>) => (
									<Data>{formatShortDate(cellProps.value)}</Data>
								),
								width: 100,
								sortable: false,
							},
							{
								Header: (
									<Header style={{ textAlign: 'right' }}>
										{t('layer2.deposit.info.table.status')}
									</Header>
								),
								accessor: 'isConfirmed',
								Cell: (cellProps: CellProps<DepositHistory, boolean>) => (
									<Data>
										{t(`layer2.deposit.info.table.${cellProps.value ? 'confirmed' : 'pending'}`)}
									</Data>
								),
								width: 100,
								sortable: false,
							},
							{
								Header: (
									<Header style={{ textAlign: 'right' }}>
										{t('layer2.deposit.info.table.view')}
									</Header>
								),
								accessor: 'transactionHash',
								Cell: (cellProps: CellProps<DepositHistory, string>) => (
									<ExternalLink transactionHash={cellProps.value} />
								),
								width: 80,
								sortable: false,
							},
						]}
						data={depositHistory ? depositHistory : []}
						isLoading={depositsDataQuery.isLoading}
						showPagination={true}
					/>
				) : (
					<StyledFlexDivColCentered>{t('layer2.deposit.info.no-deposit')}</StyledFlexDivColCentered>
				)}
			</ContainerBody>
		</InfoContainer>
	);
};

const Data = styled.span`
	font-family: ${(props) => props.theme.fonts.interBold};
	font-size: 12px;
	color: ${(props) => props.theme.colors.white};
`;

const StyledSubtitle = styled(Subtitle)`
	height: auto;
`;

const StyledFlexDivColCentered = styled(FlexDivColCentered)`
	margin: 20px 0;
`;

export default InfoBox;
