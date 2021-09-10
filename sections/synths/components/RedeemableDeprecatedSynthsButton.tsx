import { FC, useState } from 'react';
import styled from 'styled-components';
import { Trans } from 'react-i18next';
import { ethers } from 'ethers';
import { wei } from '@synthetixio/wei';
import { SynthBalance, Balances } from '@synthetixio/queries';

import { NoTextTransform } from 'styles/common';
import Button from 'components/Button';
import { formatCryptoCurrency } from 'utils/formatters/number';
import TransactionNotifier from 'containers/TransactionNotifier';
import RedeemableDeprecatedSynthsModal from 'sections/synths/components/RedeemableDeprecatedSynthsModal';

const RedeemableDeprecatedSynthsButton: FC<{
	redeemableDeprecatedSynthsQuery: any;
	synthBalances: Balances | null;
}> = ({ redeemableDeprecatedSynthsQuery, synthBalances }) => {
	const [isRedeemingDeprecatedSynths, setIsRedeemingDeprecatedSynths] = useState(false);
	const { monitorTransaction } = TransactionNotifier.useContainer();

	const redeemAmount = redeemableDeprecatedSynthsQuery?.data.totalUSDBalance ?? wei(0);
	const redeemBalances = redeemableDeprecatedSynthsQuery?.data?.balances ?? [];
	const redeemableDeprecatedSynths: string[] = redeemBalances.map((s: SynthBalance) =>
		ethers.utils.formatBytes32String(s.currencyKey)
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
					{...{ redeemAmount, redeemableDeprecatedSynths, redeemBalances, synthBalances }}
					onDismiss={() => setIsRedeemingDeprecatedSynths(false)}
					onTransferConfirmation={handleTransferConfirmation}
				/>
			) : null}
		</>
	);
};

export const StyledButtonBlue = styled(Button).attrs({ variant: 'secondary' })``;

export default RedeemableDeprecatedSynthsButton;
