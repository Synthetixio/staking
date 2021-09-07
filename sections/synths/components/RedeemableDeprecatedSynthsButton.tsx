import { FC, useState } from 'react';
import styled from 'styled-components';
import { Trans } from 'react-i18next';
import { ethers } from 'ethers';

import { NoTextTransform } from 'styles/common';
import Button from 'components/Button';
import { formatCryptoCurrency, toBigNumber } from 'utils/formatters/number';
import TransactionNotifier from 'containers/TransactionNotifier';
import RedeemableDeprecatedSynthsModal from 'sections/synths/components/RedeemableDeprecatedSynthsModal';
import { CryptoBalance } from 'queries/walletBalances/types';

const RedeemableDeprecatedSynthsButton: FC<{ redeemableDeprecatedSynthsQuery: any }> = ({
	redeemableDeprecatedSynthsQuery,
}) => {
	const [isRedeemingDeprecatedSynths, setIsRedeemingDeprecatedSynths] = useState(false);
	const { monitorTransaction } = TransactionNotifier.useContainer();

	const redeemAmount = redeemableDeprecatedSynthsQuery?.data.totalUsdBalance ?? toBigNumber(0);
	const redeemableDeprecatedSynths: string[] = redeemableDeprecatedSynthsQuery?.data?.balances?.map(
		(s: CryptoBalance) => ethers.utils.formatBytes32String(s.currencyKey)
	);

	const handleTransferConfirmation = (txHash: string) => {
		setIsRedeemingDeprecatedSynths(false);
		monitorTransaction({
			txHash,
			onTxConfirmed: () => {
				setTimeout(() => {
					redeemableDeprecatedSynthsQuery.refetch();
				}, 1000 * 5);
			},
			onTxFailed: (error) => {
				console.log(`Transaction failed: ${error}`);
			},
		});
	};

	return (
		<>
			<StyledButtonBlue onClick={() => setIsRedeemingDeprecatedSynths(true)}>
				<Trans i18nKey="synths.redeemable-deprecated-synths.redeem" values={{}} components={[]} />
			</StyledButtonBlue>

			{isRedeemingDeprecatedSynths ? (
				<RedeemableDeprecatedSynthsModal
					{...{ redeemAmount, redeemableDeprecatedSynths }}
					onDismiss={() => setIsRedeemingDeprecatedSynths(false)}
					onTransferConfirmation={handleTransferConfirmation}
				/>
			) : null}
		</>
	);
};

export const StyledButtonBlue = styled(Button).attrs({ variant: 'secondary' })``;

export default RedeemableDeprecatedSynthsButton;
