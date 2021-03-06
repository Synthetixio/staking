import { FC, useState, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { VerticalSpacer } from 'styles/common';
import { useRecoilValue } from 'recoil';

import AssetsTable from 'sections/synths/components/AssetsTable';
import TransferModal from 'sections/synths/components/TransferModal';

import KwentaBanner from 'components/KwentaBanner';
import TransactionNotifier from 'containers/TransactionNotifier';

import { isWalletConnectedState } from 'store/wallet';

import useCryptoBalances from 'hooks/useCryptoBalances';
import useSynthsBalancesQuery from 'queries/walletBalances/useSynthsBalancesQuery';
import useSNXBalanceQuery from 'queries/walletBalances/useSNXBalanceQuery';

import { zeroBN } from 'utils/formatters/number';
import { Asset } from 'queries/walletBalances/types';
import { isSynth } from 'utils/currencies';
import { CryptoCurrency } from 'constants/currency';

const Index: FC = () => {
	const [assetToTransfer, setAssetToTransfer] = useState<Asset | null>(null);

	const { t } = useTranslation();
	const { monitorTransaction } = TransactionNotifier.useContainer();
	const synthsBalancesQuery = useSynthsBalancesQuery();
	const SNXBalanceQuery = useSNXBalanceQuery();
	const cryptoBalances = useCryptoBalances();

	const isWalletConnected = useRecoilValue(isWalletConnectedState);

	const totalSynthValue = synthsBalancesQuery.isSuccess
		? synthsBalancesQuery.data?.totalUSDBalance ?? zeroBN
		: zeroBN;

	const synthBalances =
		synthsBalancesQuery.isSuccess && synthsBalancesQuery.data != null
			? synthsBalancesQuery.data
			: null;

	const synthAssets = useMemo(() => synthBalances?.balances ?? [], [synthBalances]);
	const cryptoAssets = useMemo(() => cryptoBalances?.balances ?? [], [cryptoBalances]);

	const transferableAssets = useMemo(
		() =>
			synthAssets
				.concat(cryptoAssets)
				.map(({ currencyKey, balance, transferrable }) => ({
					currencyKey,
					balance: transferrable || balance,
				}))
				.filter(({ currencyKey }) => isSynth(currencyKey) || currencyKey === CryptoCurrency.SNX),
		[synthAssets, cryptoAssets]
	);
	const handleOnTransferClick = useCallback(
		(key) => {
			const selectedAsset = transferableAssets.find(({ currencyKey }) => key === currencyKey);
			setAssetToTransfer(selectedAsset || null);
		},
		[transferableAssets]
	);

	const handleTransferConfirmation = (txHash: string) => {
		setAssetToTransfer(null);
		monitorTransaction({
			txHash,
			onTxConfirmed: () => {
				setTimeout(() => {
					synthsBalancesQuery.refetch();
					SNXBalanceQuery.refetch();
				}, 1000 * 5);
			},
			onTxFailed: (error) => {
				console.log(`Transaction failed: ${error}`);
			},
		});
	};

	return (
		<>
			<AssetsTable
				title={t('synths.assets.synths.title')}
				assets={synthAssets}
				totalValue={totalSynthValue ?? zeroBN}
				isLoading={synthsBalancesQuery.isLoading}
				isLoaded={synthsBalancesQuery.isSuccess}
				showHoldings={true}
				showConvert={false}
				onTransferClick={handleOnTransferClick}
			/>
			{!totalSynthValue.isZero() ? <KwentaBanner /> : null}
			<VerticalSpacer />
			{isWalletConnected && cryptoBalances.balances.length > 0 && (
				<AssetsTable
					title={t('synths.assets.non-synths.title')}
					assets={cryptoBalances.balances}
					totalValue={zeroBN}
					isLoading={!cryptoBalances.isLoaded}
					isLoaded={cryptoBalances.isLoaded}
					showHoldings={false}
					showConvert={true}
					onTransferClick={handleOnTransferClick}
				/>
			)}
			{assetToTransfer ? (
				<TransferModal
					onDismiss={() => setAssetToTransfer(null)}
					assets={transferableAssets}
					currentAsset={assetToTransfer}
					setAsset={(asset) => setAssetToTransfer(asset)}
					onTransferConfirmation={handleTransferConfirmation}
				/>
			) : null}
		</>
	);
};

export default Index;
