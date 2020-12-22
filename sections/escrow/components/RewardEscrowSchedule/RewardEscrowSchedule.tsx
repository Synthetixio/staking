import React from 'react';
import { useTranslation } from 'react-i18next';
import { CellProps } from 'react-table';
import { Svg } from 'react-optimized-image';
import styled from 'styled-components';
import { useRouter } from 'next/router';

import useEscrowDataQuery, { EscrowData } from 'queries/escrow/useEscrowDataQuery';
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
import { FlexDivCentered, FlexDivColCentered } from 'styles/common';

const RewardEscrowSchedule: React.FC = () => {
	const { t } = useTranslation();
	const escrowDataQuery = useEscrowDataQuery();
	const escrowData = escrowDataQuery.data;
	const data = escrowData?.schedule;
	const router = useRouter();
	return (
		<Container>
			<ContainerHeader>
				<Title>{t('escrow.staking.info.title')}</Title>
				<Subtitle>{t('escrow.staking.info.subtitle')}</Subtitle>
			</ContainerHeader>
			<ContainerBody>
				{(data && data.length > 0) || escrowDataQuery.isLoading ? (
					<StyledTable
						palette="primary"
						columns={[
							{
								Header: <Header>{t('escrow.table.vesting-date')}</Header>,
								accessor: 'date',
								Cell: (cellProps: CellProps<EscrowData['schedule'], Date>) => (
									<Data>{formatShortDate(cellProps.value)}</Data>
								),
								sortable: false,
							},
							{
								Header: (
									<Header style={{ textAlign: 'right' }}>{t('escrow.table.snx-amount')}</Header>
								),
								accessor: 'quantity',
								Cell: (cellProps: CellProps<EscrowData['schedule'], number>) => (
									<Data style={{ textAlign: 'right' }}>
										{formatCurrency(CryptoCurrency.SNX, cellProps.value)}
									</Data>
								),
								sortable: false,
							},
						]}
						data={data ? data : []}
						isLoading={escrowDataQuery.isLoading}
						showPagination={true}
					/>
				) : (
					<CallToActionContainer>
						<FlexDivColCentered>
							<Svg src={CallToActionIcon} />
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

export default RewardEscrowSchedule;
