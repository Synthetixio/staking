import { Trans, useTranslation } from 'react-i18next';
import { CellProps } from 'react-table';
import styled from 'styled-components';
import ExternalLink from '../../components/ExternalLink';
import { InfoContainer, Title, Subtitle } from '../../components/common';
import useGetWithdrawalsDataQuery, {
	WithdrawRecord,
} from 'queries/withdrawals/useGetWithdrawalsDataQuery';
import { FlexDivColCentered, ExternalLink as Link } from 'styles/common';

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
	const withdrawalsDataQuery = useGetWithdrawalsDataQuery();
	const withdrawalHistory = withdrawalsDataQuery?.data ?? null;

	return (
		<InfoContainer>
			<ContainerHeader>
				<Title>{t('layer2.withdraw.info.title')}</Title>
				<StyledSubtitle> {t('layer2.withdraw.info.subtitle')}</StyledSubtitle>
				<StyledSubtitle>
					<Trans
						i18nKey="layer2.withdraw.info.regenesis"
						components={[
							<StyledAnchor href="https://blog.synthetix.io/optimism-mainnet-upgrade-scheduled-downtime-and-regenesis/">
								{' '}
							</StyledAnchor>,
						]}
					/>
				</StyledSubtitle>
				<StyledSubtitle>
					<Trans
						i18nKey="layer2.withdraw.info.view-withdrawals"
						components={[<StyledAnchor href="https://optimism.io/snx-history"> </StyledAnchor>]}
					/>
				</StyledSubtitle>
			</ContainerHeader>
			<ContainerBody>
				{withdrawalHistory && withdrawalHistory.length > 0 ? (
					<StyledTable
						palette="primary"
						columns={[
							{
								Header: <Header>{t('layer2.withdraw.info.table.withdrawal')}</Header>,
								accessor: 'amount',
								Cell: (cellProps: CellProps<WithdrawRecord, number>) => (
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
										{t('layer2.withdraw.info.table.date')}
									</Header>
								),
								accessor: 'timestamp',
								Cell: (cellProps: CellProps<WithdrawRecord, Date>) => (
									<Data>{formatShortDate(cellProps.value)}</Data>
								),
								width: 100,
								sortable: false,
							},
							{
								Header: (
									<Header style={{ textAlign: 'right' }}>
										{t('layer2.withdraw.info.table.status')}
									</Header>
								),
								accessor: 'isConfirmed',
								Cell: (cellProps: CellProps<WithdrawRecord, boolean>) => (
									<Data>
										{t(`layer2.withdraw.info.table.${cellProps.value ? 'confirmed' : 'pending'}`)}
									</Data>
								),
								width: 100,
								sortable: false,
							},
							{
								Header: (
									<Header style={{ textAlign: 'right' }}>
										{t('layer2.withdraw.info.table.view')}
									</Header>
								),
								accessor: 'transactionHash',
								Cell: (cellProps: CellProps<WithdrawRecord, string>) => (
									<ExternalLink transactionHash={cellProps.value} />
								),
								width: 80,
								sortable: false,
							},
						]}
						data={withdrawalHistory ? withdrawalHistory : []}
						isLoading={withdrawalsDataQuery.isLoading}
						showPagination={true}
					/>
				) : (
					<StyledFlexDivColCentered>
						<StyledSubtitle>{t('layer2.withdraw.info.no-withdrawals')}</StyledSubtitle>
					</StyledFlexDivColCentered>
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
	padding: 0 20px;
`;

const StyledAnchor = styled(Link)`
	color: ${(props) => props.theme.colors.gray};
	text-decoration: underline;
	&:hover {
		color: ${(props) => props.theme.colors.white};
		text-decoration: underline;
	}
`;

export default InfoBox;
