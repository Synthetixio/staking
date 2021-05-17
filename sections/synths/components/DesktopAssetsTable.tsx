import { FC, useMemo } from 'react';
import { CellProps } from 'react-table';
import styled from 'styled-components';
import { Trans, useTranslation } from 'react-i18next';
import BigNumber from 'bignumber.js';
import { useRecoilValue } from 'recoil';
import { useRouter } from 'next/router';

import Connector from 'containers/Connector';

import synthetix from 'lib/synthetix';

import { appReadyState } from 'store/app';
import { isWalletConnectedState, isL2State } from 'store/wallet';

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

import { EXTERNAL_LINKS } from 'constants/links';
import { CryptoCurrency } from 'constants/currency';
import ROUTES from 'constants/routes';

import useSelectedPriceCurrency from 'hooks/useSelectedPriceCurrency';

import Table from 'components/Table';
import Currency from 'components/Currency';
import Button from 'components/Button';

import { zeroBN } from 'utils/formatters/number';
import { isSynth } from 'utils/currencies';

import SynthPriceCol from './SynthPriceCol';
import SynthHolding from 'components/SynthHolding';
import Link from 'next/link';

type AssetsTableProps = {
	assets: CryptoBalance[];
	totalValue: BigNumber;
	isLoading: boolean;
	isLoaded: boolean;
	showConvert: boolean;
	showHoldings: boolean;
	onTransferClick: (currencyKey: string) => void;
};

const AssetsTable: FC<AssetsTableProps> = ({
	assets,
	totalValue,
	isLoading,
	isLoaded,
	showHoldings,
	showConvert,
	onTransferClick,
}) => {
	const { t } = useTranslation();
	const { connectWallet } = Connector.useContainer();
	const isAppReady = useRecoilValue(appReadyState);
	const isWalletConnected = useRecoilValue(isWalletConnectedState);
	const isL2 = useRecoilValue(isL2State);
	const router = useRouter();

	const { selectedPriceCurrency, selectPriceCurrencyRate } = useSelectedPriceCurrency();

	const assetColumns = useMemo(() => {
		if (!isAppReady) {
			return [];
		}

		const columns = [
			{
				Header: <>{t('synths.assets.synths.table.asset')}</>,
				accessor: 'currencyKey',
				Cell: (cellProps: CellProps<CryptoBalance, CryptoBalance['currencyKey']>) => {
					const synthDesc =
						synthetix.synthsMap != null ? synthetix.synthsMap[cellProps.value]?.description : '';

					return (
						<Currency.Name
							currencyKey={cellProps.value}
							name={
								isSynth(cellProps.value)
									? t('common.currency.synthetic-currency-name', { currencyName: synthDesc })
									: undefined
							}
							showIcon={true}
						/>
					);
				},

				sortable: true,
				width: 180,
			},
			{
				Header: <>{t('synths.assets.synths.table.balance')}</>,
				id: 'balance',
				accessor: (originalRow: any) => originalRow.balance.toNumber(),
				sortType: 'basic',
				Cell: (cellProps: CellProps<CryptoBalance, CryptoBalance['balance']>) => (
					<Currency.Amount
						amountCurrencyKey={cellProps.row.original.currencyKey}
						amount={cellProps.value}
						valueCurrencyKey={selectedPriceCurrency.name}
						totalValue={cellProps.row.original.usdBalance}
						sign={selectedPriceCurrency.sign}
						conversionRate={selectPriceCurrencyRate}
					/>
				),
				width: 180,
				sortable: true,
			},
			{
				Header: <>{t('synths.assets.synths.table.price')}</>,
				id: 'price',
				sortType: 'basic',
				Cell: (cellProps: CellProps<CryptoBalance>) => (
					<SynthPriceCol currencyKey={cellProps.row.original.currencyKey} />
				),
				width: 180,
				sortable: false,
			},
		];
		if (showHoldings) {
			columns.push({
				Header: <>{t('synths.assets.synths.table.holdings')}</>,
				id: 'holdings',
				accessor: (originalRow: any) => originalRow.usdBalance.toNumber(),
				sortType: 'basic',
				Cell: (cellProps: CellProps<CryptoBalance>) => (
					<FlexDiv style={{ width: '50%' }}>
						<SynthHolding
							usdBalance={cellProps.row.original.usdBalance}
							totalUSDBalance={totalValue ?? zeroBN}
						/>
					</FlexDiv>
				),
				width: 180,
				sortable: true,
			});
		}
		if (showConvert) {
			columns.push({
				Header: <></>,
				id: 'convert',
				sortType: 'basic',
				Cell: ({
					row: {
						original: { currencyKey },
					},
				}: CellProps<CryptoBalance>) => {
					if (currencyKey === CryptoCurrency.SNX) {
						return (
							<Link href={ROUTES.Staking.Home}>
								<StyledButtonPink>{t('common.stake-snx')}</StyledButtonPink>
							</Link>
						);
					}
					return (
						<ExternalLink
							href={EXTERNAL_LINKS.Trading.OneInchLink(currencyKey, CryptoCurrency.SNX)}
						>
							<StyledButtonPink>
								<Trans
									i18nKey="common.currency.buy-currency"
									values={{
										currencyKey: CryptoCurrency.SNX,
									}}
									components={[<NoTextTransform />]}
								/>
							</StyledButtonPink>
						</ExternalLink>
					);
				},
				width: 180,
				sortable: false,
			});
		}
		if (!isL2) {
			columns.push({
				Header: <></>,
				id: 'transfer',
				sortType: 'basic',
				Cell: ({
					row: {
						original: { currencyKey },
					},
				}: CellProps<CryptoBalance>) => {
					return isSynth(currencyKey) || currencyKey === CryptoCurrency.SNX ? (
						<StyledButtonBlue onClick={() => onTransferClick(currencyKey)}>
							{t('synths.assets.synths.table.transfer')}
						</StyledButtonBlue>
					) : (
						<></>
					);
				},
				width: 180,
				sortable: false,
			});
		}
		return columns;
	}, [
		showHoldings,
		showConvert,
		t,
		totalValue,
		selectPriceCurrencyRate,
		selectedPriceCurrency.sign,
		selectedPriceCurrency.name,
		isAppReady,
		onTransferClick,
		isL2,
	]);

	return (
		<StyledTable
			palette="primary"
			columns={assetColumns}
			data={assets}
			isLoading={isLoading}
			noResultsMessage={
				!isWalletConnected ? (
					<TableNoResults>
						<TableNoResultsTitle>{t('common.wallet.no-wallet-connected')}</TableNoResultsTitle>
						<TableNoResultsButtonContainer>
							<Button variant="primary" onClick={connectWallet}>
								{t('common.wallet.connect-wallet')}
							</Button>
						</TableNoResultsButtonContainer>
					</TableNoResults>
				) : isLoaded && assets.length === 0 ? (
					<TableNoResults>
						<TableNoResultsTitle>
							{t('synths.assets.synths.table.no-synths.title')}
						</TableNoResultsTitle>
						<TableNoResultsDesc>
							{t('synths.assets.synths.table.no-synths.desc')}
						</TableNoResultsDesc>
						<TableNoResultsButtonContainer>
							<Button variant="primary" onClick={() => router.push(ROUTES.Staking.Home)}>
								{t('common.stake-snx')}
							</Button>
						</TableNoResultsButtonContainer>
					</TableNoResults>
				) : undefined
			}
			showPagination={true}
		/>
	);
};

const StyledTable = styled(Table)`
	.table-body-cell {
		height: 70px;
	}
`;

const StyledButton = styled(Button)`
	text-transform: uppercase;
	width: 120px;
`;

const StyledButtonBlue = styled(StyledButton).attrs({ variant: 'secondary' })``;
const StyledButtonPink = styled(StyledButton).attrs({ variant: 'tertiary' })``;

export default AssetsTable;
