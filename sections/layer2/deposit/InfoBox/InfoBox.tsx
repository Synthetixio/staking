import { useTranslation } from 'react-i18next';
import { CellProps } from 'react-table';
import styled from 'styled-components';

import { InfoContainer, Title, Subtitle } from '../../components/common';
import ExternalLink from '../../components/ExternalLink';
import useGetDepositsDataQuery, { DepositHistory } from 'queries/deposits/useGetDepositsDataQuery';

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
	console.log(depositHistory);
	return (
		<InfoContainer>
			<ContainerHeader>
				<Title>{t('layer2.deposit.info.title')}</Title>
				<Subtitle> {t('layer2.deposit.info.subtitle')}</Subtitle>
			</ContainerHeader>
			<ContainerBody>
				{
					depositHistory && depositHistory.length > 0 ? (
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
					) : null
					// <CallToActionContainer>
					// 	<FlexDivColCentered>
					// 		<Svg src={CallToActionIcon} />
					// 		<CallToActionInfo>{t('escrow.actions.stake.no-escrowed-snx')}</CallToActionInfo>
					// 		<StyledButton
					// 			size="lg"
					// 			variant="primary"
					// 			onClick={() => router.push(ROUTES.Staking.Home)}
					// 		>
					// 			{t('escrow.actions.stake.stake-now')}
					// 		</StyledButton>
					// 	</FlexDivColCentered>
					// </CallToActionContainer>
				}
			</ContainerBody>
		</InfoContainer>
	);
};

export const Data = styled.span`
	font-family: ${(props) => props.theme.fonts.interBold};
	font-size: 12px;
	color: ${(props) => props.theme.colors.white};
`;

export default InfoBox;
