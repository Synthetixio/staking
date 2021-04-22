import { FC } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';

import BaseModal from 'components/BaseModal';
import { FormContainer, InputsContainer, InputsDivider } from 'sections/loans/components/common';
import AssetInput from 'sections/loans/components/ActionBox/BorrowSynthsTab/AssetInput';

import { CryptoBalance } from 'queries/walletBalances/types';

type TransferModalProps = {
	onDismiss: () => void;
	assets: Array<string>;
};

const TransferModal: FC<TransferModalProps> = ({
	onDismiss,
	assets,
	setAsset,
	currentAsset,
	amount,
	setAmount,
	onSetMaxAmount,
}) => {
	const { t } = useTranslation();
	return (
		<StyledModal onDismiss={onDismiss} isOpen={true} title={t('synths.transfer.modal-title')}>
			<FormContainer>
				<InputsContainer>
					<AssetInput
						label="synths.transfer.input-label"
						assets={assets}
						asset={currentAsset}
						setAsset={setAsset}
						amount={amount}
						setAmount={setAmount}
						onSetMaxAmount={onSetMaxAmount}
					/>
					<InputsDivider />
					<div>there</div>
				</InputsContainer>
			</FormContainer>
		</StyledModal>
	);
};

const StyledModal = styled(BaseModal)`
	.card-header {
		border-top: 2px solid ${(props) => props.theme.colors.blue};
		font-size: 12px;
		font-family: ${(props) => props.theme.fonts.interBold};
		background-color: ${(props) => props.theme.colors.navy};
		border-bottom: 1px solid ${(props) => props.theme.colors.grayBlue};
		text-transform: uppercase;
	}
`;

export default TransferModal;
