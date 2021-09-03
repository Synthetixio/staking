import { FC } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import { CellProps } from 'react-table';
import styled from 'styled-components';
import { useRouter } from 'next/router';

import { EXTERNAL_LINKS } from 'constants/links';
import useEscrowDataQuery, { EscrowData } from 'queries/escrow/useEscrowDataQuery';
import { CryptoCurrency } from 'constants/currency';
import { formatShortDate } from 'utils/formatters/date';
import { formatCurrency } from 'utils/formatters/number';

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

const NominateInfoBox: FC = () => {
	const { t } = useTranslation();
	const escrowDataQuery = useEscrowDataQuery();
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
					data={schedule ?? []}
					isLoading={escrowDataQuery.isLoading}
					showPagination={true}
				/>
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

export default NominateInfoBox;
