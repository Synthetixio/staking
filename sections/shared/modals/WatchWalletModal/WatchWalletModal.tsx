import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { MenuModal } from '../common';
import Button from 'components/Button';
import TextInput from 'components/Input/SearchInput';

type WatchWalletModalProps = {
	onDismiss: () => void;
};

const WatchWalletModal: React.FC<WatchWalletModalProps> = ({ onDismiss }) => {
	const { t } = useTranslation();
	const [address, setAddress] = useState<string>('');

	return (
		<StyledMenuModal
			onDismiss={onDismiss}
			isOpen={true}
			title={t('modals.wallet.watch-wallet.title')}
		>
			<WatchWalletContainer>
				<Subtitle>{t('modals.wallet.watch-wallet.subtitle')}</Subtitle>
				<StyledInput
					value={address}
					onChange={(e) => setAddress(e.target.value)}
					placeholder={t('modals.wallet.watch-wallet.placeholder')}
				/>
				<StyledButton disabled={address.length === 0}>
					{t('modals.wallet.watch-wallet.action')}
				</StyledButton>
			</WatchWalletContainer>
		</StyledMenuModal>
	);
};

const StyledMenuModal = styled(MenuModal)`
	[data-reach-dialog-content] {
		width: 384px;
	}
	.card-body {
		padding: 36px;
		text-align: center;
		margin: 0 auto;
	}
`;

const WatchWalletContainer = styled.div``;

const Subtitle = styled.p`
	font-family: ${(props) => props.theme.fonts.regular};
	font-size: 12px;
`;

const StyledInput = styled(TextInput)`
	text-transform: uppercase;
	font-family: ${(props) => props.theme.fonts.condensedMedium};
	font-size: 12px;
	width: 100%;
	text-align: center;
	margin: 16px 0px;
	margin-bottom: 24px;
`;

const StyledButton = styled(Button).attrs({ variant: 'primary' })`
	text-transform: uppercase;
	width: 100%;
`;

export default WatchWalletModal;
