import { FC, useState } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { ethers } from 'ethers';

import BaseModal from 'components/BaseModal';
import { FormContainer, InputsContainer, InputsDivider } from 'sections/loans/components/common';
import AssetInput from 'components/Form/AssetInput';

import { Asset } from 'queries/walletBalances/types';
import { zeroBN } from 'utils/formatters/number';

type TransferModalProps = {
	onDismiss: () => void;
	assets: Array<Asset>;
	currentAsset: Asset | null;
	setAsset: (asset: Asset) => void;
};

const TransferModal: FC<TransferModalProps> = ({ onDismiss, assets, setAsset, currentAsset }) => {
	const { t } = useTranslation();
	const [amount, setAmount] = useState<string>('');

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
						onSetMaxAmount={() =>
							setAmount(
								ethers.utils.formatUnits(ethers.BigNumber.from(currentAsset?.balance ?? zeroBN))
							)
						}
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
