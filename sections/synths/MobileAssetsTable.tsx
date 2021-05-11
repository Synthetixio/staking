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
import { isWalletConnectedState } from 'store/wallet';

import {
	ExternalLink,
	TableNoResults,
	TableNoResultsTitle,
	TableNoResultsDesc,
	TableNoResultsButtonContainer,
	NoTextTransform,
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

import SynthPriceCol from './components/SynthPriceCol';
import SynthHolding from 'components/SynthHolding';
import Link from 'next/link';

type AssetsTableProps = {
	assets: CryptoBalance[];
	totalValue: BigNumber;
	isLoading: boolean;
	isLoaded: boolean;
	showConvert: boolean;
	showHoldings: boolean;
};

const AssetsTable: FC<AssetsTableProps> = ({
	assets,
	totalValue,
	isLoading,
	isLoaded,
	showHoldings,
	showConvert,
}) => {
	const { t } = useTranslation();
	const { connectWallet } = Connector.useContainer();
	const isAppReady = useRecoilValue(appReadyState);
	const isWalletConnected = useRecoilValue(isWalletConnectedState);
	const router = useRouter();

	const { selectedPriceCurrency, selectPriceCurrencyRate } = useSelectedPriceCurrency();

	const assetColumns = useMemo(() => {
		if (!isAppReady) {
			return [];
		}

		return [
			{
				Header: <>{t('synths.assets.synths.table.asset')}</>,
				accessor: 'currencyKey',
				sortable: true,
				width: 40,
				Cell: (cellProps: CellProps<CryptoBalance, CryptoBalance['currencyKey']>) => {
					return <Currency.Icon currencyKey={cellProps.value} />;
				},
			},
			{
				Header: <RightColHeader>{t('synths.assets.synths.table.balance-mobile')}</RightColHeader>,
				id: 'right',
				Cell: (cellProps: CellProps<CryptoBalance>) => {
					const asset = cellProps.row.original;
					const synthDesc =
						synthetix.synthsMap != null ? synthetix.synthsMap[asset.currencyKey]?.description : '';

					return (
						<RightCol>
							<div>
								{isSynth(asset.currencyKey)
									? t('common.currency.synthetic-currency-name', { currencyName: synthDesc })
									: undefined}
							</div>
							<div>
								<Currency.Amount
									amountCurrencyKey={asset.currencyKey}
									amount={asset.balance}
									valueCurrencyKey={selectedPriceCurrency.name}
									totalValue={asset.usdBalance}
									sign={selectedPriceCurrency.sign}
									conversionRate={selectPriceCurrencyRate}
								/>
							</div>

							<div>{asset.currencyKey}</div>
							<div>
								<SynthPriceCol currencyKey={asset.currencyKey} />
							</div>

							{!showHoldings ? null : (
								<>
									<div>{t('synths.assets.synths.table.holdings')}</div>
									<div>
										<SynthHolding
											usdBalance={asset.usdBalance}
											totalUSDBalance={totalValue ?? zeroBN}
										/>
									</div>
								</>
							)}

							{!showConvert ? null : (
								<>
									<div></div>
									<div>
										{asset.currencyKey === CryptoCurrency.SNX ? (
											<Link href={ROUTES.Staking.Home}>
												<StyledButton>{t('common.stake-snx')}</StyledButton>
											</Link>
										) : (
											<ExternalLink
												href={EXTERNAL_LINKS.Trading.OneInchLink(
													asset.currencyKey,
													CryptoCurrency.SNX
												)}
											>
												<StyledButton>
													<Trans
														i18nKey="common.currency.buy-currency"
														values={{
															currencyKey: CryptoCurrency.SNX,
														}}
														components={[<NoTextTransform />]}
													/>
												</StyledButton>
											</ExternalLink>
										)}
									</div>
								</>
							)}
						</RightCol>
					);
				},
			},
		];
	}, [
		showHoldings,
		showConvert,
		t,
		totalValue,
		selectPriceCurrencyRate,
		selectedPriceCurrency.sign,
		selectedPriceCurrency.name,
		isAppReady,
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
		height: auto;
		align-items: flex-start;
		padding: 10px 0;
		width: unset !important;
	}
`;

const RightCol = styled.div`
	display: grid;
	grid-template-columns: 1fr 1fr;
	grid-row-gap: 1rem;
	flex: 1;

	& > div:nth-child(even) {
		text-align: right;
		justify-content: flex-end;
		display: flex;
	}
`;

const RightColHeader = styled.div`
	text-align: right;
	width: 100%;
`;

const StyledButton = styled(Button).attrs({
	variant: 'secondary',
})`
	text-transform: uppercase;
	width: 120px;
`;

export default AssetsTable;
