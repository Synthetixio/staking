import useSynthetixQueries from '@synthetixio/queries';
import React, { useState } from 'react';
import { ModalContent, ModalItem, ModalItemTitle, ModalItemText } from 'styles/common';
import Button from 'components/Button';
import { formatCryptoCurrency } from 'utils/formatters/number';
import TxConfirmationModal from 'sections/shared/modals/TxConfirmationModal';
import Wei from '@synthetixio/wei';
import styled from 'styled-components';
import { Synths } from 'constants/currency';
import { useTranslation } from 'react-i18next';

/**
 * This component is used to burn max, it should only be used when the users balance
 * is less than what's required to fix the c-ratio.
 * The reason we use `burnSynthsToTarget` instead of just burning max is that
 * the Issuer contract "MinStakeTime" check will block the transaction if you not using `burnSynthsToTarget` and have recently minted
 */
const BurnMaxButton: React.FC<{ sUSDBalance: Wei; burnAmountToFixCRatio: Wei }> = ({
	sUSDBalance,
	burnAmountToFixCRatio,
}) => {
	const { useSynthetixTxn } = useSynthetixQueries();
	const { t } = useTranslation();
	const [txModalOpen, setTxModalOpen] = useState<boolean>(false);

	const txn = useSynthetixTxn(
		'Synthetix',
		'burnSynthsToTarget',
		[],
		{},
		{ enabled: sUSDBalance.lt(burnAmountToFixCRatio) }
	);
	if (sUSDBalance.gt(burnAmountToFixCRatio)) {
		// See comment above, this component should only be used if sUSDBalance is less than burnAmountToFixCRatio
		console.error(
			'Only render this BurnMaxButton when sUSDBalance is less than burnAmountToFixCRatio'
		);
		return null;
	}
	return (
		<>
			<StyledButton
				data-testid="burn-max-btn"
				variant={'primary'}
				onClick={() => {
					setTxModalOpen(true);
					txn.mutate();
				}}
			>
				{t('staking.actions.burn.action.burn-all')}
			</StyledButton>
			{txModalOpen && (
				<TxConfirmationModal
					onDismiss={() => setTxModalOpen(false)}
					txError={txn.errorMessage}
					attemptRetry={txn.mutate}
					content={
						<ModalContent>
							<ModalItem>
								<ModalItemTitle>{t('staking.actions.burn.in-progress.burning')}</ModalItemTitle>
								<ModalItemText>
									{formatCryptoCurrency(sUSDBalance, {
										sign: '$',
										currencyKey: Synths.sUSD,
										minDecimals: 2,
									})}
								</ModalItemText>
							</ModalItem>
						</ModalContent>
					}
				/>
			)}
		</>
	);
};

const StyledButton = styled(Button)`
	text-transform: none;
`;
export default BurnMaxButton;
