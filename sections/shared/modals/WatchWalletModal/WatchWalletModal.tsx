import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { MenuModal } from '../common';

type WatchWalletModalProps = {
	onDismiss: () => void;
};

const WatchWalletModal: React.FC<WatchWalletModalProps> = ({ onDismiss }) => {
	const { t } = useTranslation();
	return (
		<StyledMenuModal onDismiss={onDismiss} isOpen={true} title={t('modals.wallet.title')}>
			<WatchWalletContainer></WatchWalletContainer>
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

const WatchWalletContainer = styled.div`
	padding-bottom: 22px;
`;

export default WatchWalletModal;
