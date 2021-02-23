import { FC, ReactNode, useMemo } from 'react';
import { CellProps } from 'react-table';
import styled from 'styled-components';
import { Trans, useTranslation } from 'react-i18next';
import BigNumber from 'bignumber.js';
import { useRecoilValue } from 'recoil';
import { useRouter } from 'next/router';

import {
	ExternalLink,
	TableNoResults,
	TableNoResultsTitle,
	TableNoResultsDesc,
	TableNoResultsButtonContainer,
	NoTextTransform,
	FlexDiv,
} from 'styles/common';
import { CryptoBalance } from 'queries/walletBalances/types';
import { SynthsTotalSupplyData } from 'queries/synths/useSynthsTotalSupplyQuery';
import useSelectedPriceCurrency from 'hooks/useSelectedPriceCurrency';

import { EXTERNAL_LINKS } from 'constants/links';
import { CryptoCurrency } from 'constants/currency';
import ROUTES from 'constants/routes';

import useSynthsTotalSupplyQuery from 'queries/synths/useSynthsTotalSupplyQuery';

import Table from 'components/Table';
import Currency from 'components/Currency';
import Button from 'components/Button';
import { formatFiatCurrency, formatPercent, toBigNumber, zeroBN } from 'utils/formatters/number';

import { isSynth } from 'utils/currencies';

import Link from 'next/link';
import { ProgressBarType } from 'components/ProgressBar/ProgressBar';

import synthetix from 'lib/synthetix';

const SynthsTable = ({ synths }) => {
	const { t } = useTranslation();
	const { selectedPriceCurrency, getPriceAtCurrentRate } = useSelectedPriceCurrency();
	// const synthsTotalSupplyQuery = useSynthsTotalSupplyQuery();

	// const synthsTotalSupply = synthsTotalSupplyQuery?.data?.supplyData ?? [];
	// console.log(synthsTotalSupply);

	console.log(synths);

	const assetColumns = useMemo(() => {
		if (!synths) {
			return [];
		}

		const columns = [
			{
				Header: <>{t('synths.assets.synths.table.asset')}</>,
				accessor: 'name',
				Cell: (cellProps: any) => {
					return (
						<Legend>
							<LegendIcon
								strokeColor={cellProps.row.original.strokeColor}
								fillColor={cellProps.row.original.fillColor}
							/>
							<Currency.Name currencyKey={cellProps.value} showIcon={false} />
						</Legend>
					);
				},

				sortable: false,
				width: 100,
			},
			{
				Header: <>{t('synths.assets.synths.table.total')}</>,
				accessor: 'value',
				Cell: (cellProps: CellProps<CryptoBalance>) => (
					<Amount>
						{formatFiatCurrency(cellProps.value, {
							sign: selectedPriceCurrency.sign,
							decimals: 0,
						})}
					</Amount>
				),
				width: 100,
				sortable: false,
			},
			{
				Header: <>{t('synths.assets.synths.table.percentage-of-pool')}</>,
				accessor: 'poolProportion',
				Cell: (cellProps: CellProps<CryptoBalance>) => (
					<Amount>{formatPercent(cellProps.value)}</Amount>
				),
				width: 100,
				sortable: false,
			},
		];

		return columns;
	}, []);
	return (
		<StyledTable
			palette="primary"
			columns={assetColumns}
			data={synths}
			// isLoading={isLoading}
			// noResultsMessage={
			// 	!isWalletConnected ? (
			// 		<TableNoResults>
			// 			<TableNoResultsTitle>{t('common.wallet.no-wallet-connected')}</TableNoResultsTitle>
			// 			<TableNoResultsButtonContainer>
			// 				<Button variant="primary" onClick={connectWallet}>
			// 					{t('common.wallet.connect-wallet')}
			// 				</Button>
			// 			</TableNoResultsButtonContainer>
			// 		</TableNoResults>
			// 	) : isLoaded && assets.length === 0 ? (
			// 		<TableNoResults>
			// 			<TableNoResultsTitle>
			// 				{t('synths.assets.synths.table.no-synths.title')}
			// 			</TableNoResultsTitle>
			// 			<TableNoResultsDesc>
			// 				{t('synths.assets.synths.table.no-synths.desc')}
			// 			</TableNoResultsDesc>
			// 			<TableNoResultsButtonContainer>
			// 				<Button variant="primary" onClick={() => router.push(ROUTES.Staking.Home)}>
			// 					{t('common.stake-snx')}
			// 				</Button>
			// 			</TableNoResultsButtonContainer>
			// 		</TableNoResults>
			// 	) : undefined
			// }
			// showPagination={true}
		/>
	);
};

const Amount = styled.span`
	color: ${(props) => props.theme.colors.white};
	font-family: ${(props) => props.theme.fonts.mono};
`;

const Legend = styled(FlexDiv)`
	align-items: baseline;
`;

const LegendIcon = styled.span<{ strokeColor: string; fillColor: string }>`
	height: 8px;
	width: 8px;
	border: 2px solid ${(props) => props.strokeColor};
	background-color: ${(props) => props.fillColor};
	margin-right: 6px;
`;

const StyledTable = styled(Table)`
	padding: 0 10px;
	.table-body-cell {
		height: 40px;
	}
	.table-body-cell,
	.table-header-cell {
		&:last-child {
			justify-content: flex-end;
		}
	}
`;

export default SynthsTable;
