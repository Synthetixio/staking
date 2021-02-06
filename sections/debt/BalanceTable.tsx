import { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { CellProps } from 'react-table';
import styled from 'styled-components';
import { useRecoilValue } from 'recoil';
import { useRouter } from 'next/router';


import Connector from 'containers/Connector';
import Currency from 'components/Currency';
import synthetix from 'lib/synthetix';

import { appReadyState } from 'store/app';
import { isWalletConnectedState } from 'store/wallet';

import Table from 'components/Table';
import Button from 'components/Button';


import useSelectedPriceCurrency from 'hooks/useSelectedPriceCurrency';
import { CryptoBalance } from 'queries/walletBalances/types';
import { Header } from 'sections/debt/components/common';

import {
    TableNoResults,
    TableNoResultsTitle,
	TableNoResultsDesc,
	TableNoResultsButtonContainer,
} from 'styles/common';

import SynthPriceCol from '../synths/components/SynthPriceCol';
import { isSynth } from 'utils/currencies';


import ROUTES from 'constants/routes';

type BalanceTableProps = {
    title: string;
    assets: CryptoBalance[];
    isLoaded: boolean;
};

const BalanceTable: FC<BalanceTableProps> = ({ assets, title, isLoaded }) => {
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
        const columns = [
            {
                Header: <>{t('debt.track.table.yourSynths')}</>,
                accessor: 'currencyKey',
                sortKey: 'basic',
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
                width: 200, 
                sortable: true,
				
            },
            {
				Header: <>{t('debt.track.table.balance')}</>,
				id: 'balance',
				accessor: (originalRow: any) => originalRow.balance.toNumber(),
				sortType: 'basic',
				Cell: (cellProps: CellProps<CryptoBalance, CryptoBalance['balance']>) => (
					<Currency.Amount
						currencyKey={cellProps.row.original.currencyKey}
						amount={cellProps.value}
						totalValue={cellProps.row.original.usdBalance}
						sign={selectedPriceCurrency.sign}
						conversionRate={selectPriceCurrencyRate}
					/>
				),
				width: 200,
				sortable: true,
            },
            {
				Header: <>{t('debt.track.table.price')}</>,
				id: 'price',
				sortType: 'basic',
				Cell: (cellProps: CellProps<CryptoBalance>) => (
					<SynthPriceCol currencyKey={cellProps.row.original.currencyKey} />
				),
				width: 200,
				sortable: false,
			},
        ];
        return columns;
    }, [
		t,
		selectPriceCurrencyRate,
		selectedPriceCurrency.sign,
		isAppReady,
    ]);
    return (
		<Container>
			{isWalletConnected && <Header>{title}</Header>}
			<StyledTable
				palette="primary"
				columns={assetColumns}
				data={assets}
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
		</Container>
	);
};

const Container = styled.div`
	padding-bottom: 20px;
`;

const StyledTable = styled(Table)`
	.table-body-cell {
		height: 70px;
	}
`;




export default BalanceTable;