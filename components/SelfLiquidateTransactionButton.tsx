import { ModalContent, ModalItem, ModalItemTitle, ModalItemText } from 'styles/common';
import TxConfirmationModal from 'sections/shared/modals/TxConfirmationModal';

import { useTranslation } from 'react-i18next';
import Button from 'components/Button';
import useSynthetixQueries from '@synthetixio/queries';

const SelfLiquidateTransactionButton: React.FC<{
	txModalOpen: boolean;
	setTxModalOpen: (open: boolean) => void;
	walletAddress?: string | null;
}> = ({ txModalOpen, setTxModalOpen, walletAddress }) => {
	const { useSynthetixTxn } = useSynthetixQueries();
	const { t } = useTranslation();

	const txn = useSynthetixTxn(
		'Synthetix',
		'liquidateSelf',
		[],
		{},
		{ enabled: Boolean(walletAddress) }
	);
	return (
		<>
			<Button
				variant={'primary'}
				onClick={() => {
					setTxModalOpen(true);
					txn.mutate();
				}}
			>
				{t('staking.flag-warning.self-liquidate')}
			</Button>
			{txModalOpen && (
				<TxConfirmationModal
					onDismiss={() => setTxModalOpen(false)}
					txError={txn.errorMessage}
					attemptRetry={txn.mutate}
					content={
						<ModalContent>
							<ModalItem>
								<ModalItemTitle> {t('staking.flag-warning.self-liquidating')}</ModalItemTitle>
								<ModalItemText>{walletAddress}</ModalItemText>
							</ModalItem>
						</ModalContent>
					}
				/>
			)}
		</>
	);
};
export default SelfLiquidateTransactionButton;
