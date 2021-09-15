import { useTranslation } from 'react-i18next';
import { CellProps } from 'react-table';
import styled, { css } from 'styled-components';
import { Svg } from 'react-optimized-image';

import { InfoContainer, Title, Subtitle } from '../../components/common';
import ExternalLink from '../../components/ExternalLink';
import { FlexDivColCentered } from 'styles/common';

import { formatShortDate } from 'utils/formatters/date';
import { formatCurrency } from 'utils/formatters/number';
import { CryptoCurrency } from 'constants/currency';

import Warning from 'assets/svg/app/warning.svg';

// This needs to be put somewhere else
import {
	ContainerHeader,
	ContainerBody,
	Header,
	StyledTable,
} from 'sections/escrow/components/common';
import { useRecoilValue } from 'recoil';
import { walletAddressState } from 'store/wallet';
import useSynthetixQueries, { DepositHistory } from '@synthetixio/queries';

const InfoBox = () => {
	const { t } = useTranslation();

	const walletAddress = useRecoilValue(walletAddressState);

	const { useGetBridgeDataQuery } = useSynthetixQueries();

	const depositsDataQuery = useGetBridgeDataQuery(
		process.env.NEXT_PUBLIC_INFURA_PROJECT_ID!,
		walletAddress
	);

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
											minDecimals: 2,
											maxDecimals: 2,
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
					<StyledFlexDivColCentered>
						<Svg src={Warning} />
						<WarningHeading>{t('layer2.deposit.info.warning')}</WarningHeading>
						<WarningBody>{t('layer2.deposit.info.metamask-only')}</WarningBody>
						<WarningBody>{t('layer2.deposit.info.layer2-withdraw-delay')}</WarningBody>
						<WarningBody>{t('layer2.deposit.info.layer2-limited-synths')}</WarningBody>
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

const Bold = css`
	font-family: ${(props) => props.theme.fonts.condensedBold};
`;

const WarningHeading = styled.h2`
	color: ${(props) => props.theme.colors.pink};
	font-size: 20px;
	margin: 4px 0;
	${Bold};
`;

const WarningBody = styled.p`
	margin: 0;
	font-size: 14px;
	text-align: left;
	&:not(:first-child) {
		margin-top: 6px;
	}
`;
export default InfoBox;
