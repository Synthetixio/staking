import { FC, useState, useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { VerticalSpacer } from 'styles/common';
import { useRecoilValue } from 'recoil';

import AssetsTable from 'sections/synths/components/AssetsTable';
import TransferModal from 'sections/synths/components/TransferModal';

import KwentaBanner from 'components/KwentaBanner';
import TransactionNotifier from 'containers/TransactionNotifier';

import { isWalletConnectedState, walletAddressState } from 'store/wallet';

import useCryptoBalances, { CryptoBalance } from 'hooks/useCryptoBalances';

import { isSynth } from 'utils/currencies';
import { CryptoCurrency } from 'constants/currency';
import { wei } from '@synthetixio/wei';
import useSynthetixQueries from '@synthetixio/queries';
import { Asset } from 'components/Form/AssetInput';

const Index: FC = () => {
	const [assetToTransfer, setAssetToTransfer] = useState<Asset | null>(null);
	const [transferModalOpen, setTransferModalOpen] = useState<boolean>(false);

	const { t } = useTranslation();
	const { monitorTransaction } = TransactionNotifier.useContainer();

	const walletAddress = useRecoilValue(walletAddressState);
	const { useSynthsBalancesQuery } = useSynthetixQueries();

	const synthsBalancesQuery = useSynthsBalancesQuery(walletAddress);
	const cryptoBalances = useCryptoBalances(walletAddress);

	const isWalletConnected = useRecoilValue(isWalletConnectedState);

	const totalSynthValue = synthsBalancesQuery.isSuccess
		? synthsBalancesQuery.data?.totalUSDBalance ?? wei(0)
		: wei(0);

	const synthBalances =
		synthsBalancesQuery.isSuccess && synthsBalancesQuery.data != null
			? synthsBalancesQuery.data
			: null;

	const synthAssets = useMemo(() => synthBalances?.balances ?? [], [
		synthBalances,
	]) as CryptoBalance[];
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
		(key: string) => {
			const selectedAsset = transferableAssets.find(({ currencyKey }) => key === currencyKey);
			setAssetToTransfer(selectedAsset || null);
			setTransferModalOpen(true);
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
				totalValue={totalSynthValue ?? wei(0)}
				isLoading={synthsBalancesQuery.isLoading}
				isLoaded={synthsBalancesQuery.isSuccess}
				showHoldings={true}
				showConvert={false}
				onTransferClick={handleOnTransferClick}
			/>
			{!totalSynthValue.eq(0) ? <KwentaBanner /> : null}
			<VerticalSpacer />
			{isWalletConnected && cryptoBalances.balances.length > 0 && (
				<AssetsTable
					title={t('synths.assets.non-synths.title')}
					assets={cryptoBalances.balances}
					totalValue={wei(0)}
					isLoading={!cryptoBalances.isLoaded}
					isLoaded={cryptoBalances.isLoaded}
					showHoldings={false}
					showConvert={true}
					onTransferClick={handleOnTransferClick}
				/>
			)}
			{transferModalOpen && (
				<TransferModal
					onDismiss={() => setTransferModalOpen(false)}
					assets={transferableAssets}
					currentAsset={assetToTransfer}
					setAsset={(asset) => setAssetToTransfer(asset)}
					onTransferConfirmation={handleTransferConfirmation}
				/>
			)}
		</>
	);
};

export default Index;
