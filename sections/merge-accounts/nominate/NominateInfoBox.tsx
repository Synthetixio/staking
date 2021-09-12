import { FC } from 'react';
import { useTranslation, Trans } from 'react-i18next';
import { CellProps } from 'react-table';
import styled from 'styled-components';
import useSynthetixQueries, { EscrowData } from '@synthetixio/queries';
import { useRecoilValue } from 'recoil';

import { EXTERNAL_LINKS } from 'constants/links';
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
import { ExternalLink } from 'styles/common';
import { walletAddressState } from 'store/wallet';

const NominateInfoBox: FC = () => {
	const { t } = useTranslation();
	const { useEscrowDataQuery } = useSynthetixQueries();
	const walletAddress = useRecoilValue(walletAddressState);
	const escrowDataQuery = useEscrowDataQuery(walletAddress);
	const schedule = escrowDataQuery?.data?.schedule;
	const totalBalancePendingMigration = escrowDataQuery?.data?.totalBalancePendingMigration ?? 0;

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

export const StyledLink = styled(ExternalLink)`
	color: ${(props) => props.theme.colors.blue};
`;

export default NominateInfoBox;
