import { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { VerticalSpacer } from 'styles/common';
import { useRecoilValue } from 'recoil';

import AssetsTable from 'sections/synths/components/AssetsTable';
import TransferModal from 'sections/synths/components/TransferModal';

import KwentaBanner from 'components/KwentaBanner';

import { isWalletConnectedState } from 'store/wallet';

import useCryptoBalances from 'hooks/useCryptoBalances';
import useSynthsBalancesQuery from 'queries/walletBalances/useSynthsBalancesQuery';

import { zeroBN } from 'utils/formatters/number';

const Index: FC = () => {
	const [assetToTransfer, setAssetToTransfer] = useState<string | null>(null);
	const [balanceToTransfer, setBalanceToTransfer] = useState<string>('');

	const { t } = useTranslation();
	const synthsBalancesQuery = useSynthsBalancesQuery();
	const cryptoBalances = useCryptoBalances();

	const isWalletConnected = useRecoilValue(isWalletConnectedState);

	const totalSynthValue = synthsBalancesQuery.isSuccess
		? synthsBalancesQuery.data?.totalUSDBalance ?? zeroBN
		: zeroBN;

	const synthBalances =
		synthsBalancesQuery.isSuccess && synthsBalancesQuery.data != null
			? synthsBalancesQuery.data
			: null;

	const synthAssets = synthBalances?.balances ?? [];

	const assetsHeld = synthAssets.concat(cryptoBalances.balances).map((asset) => asset.currencyKey);
	console.log(assetToTransfer);

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
				onTransferClick={(asset) => setAssetToTransfer(asset)}
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
					onTransferClick={(asset) => setAssetToTransfer(asset)}
				/>
			)}
			{assetToTransfer ? (
				<TransferModal
					onDismiss={() => setAssetToTransfer(null)}
					assets={assetsHeld}
					currentAsset={assetToTransfer}
					setAsset={(asset) => setAssetToTransfer(asset)}
					amount={balanceToTransfer}
					setAmount={(balance) => setBalanceToTransfer(balance)}
					onSetMaxAmount={() => setBalanceToTransfer('1000')}
				/>
			) : null}
		</>
	);
};

export default Index;
