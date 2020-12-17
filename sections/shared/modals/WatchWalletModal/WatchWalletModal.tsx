import Button from 'components/Button';
import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { GridDivCenteredCol, FlexDiv, GridDivCenteredRow, Tooltip } from 'styles/common';
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

const StyledButton = styled(Button).attrs({
	variant: 'outline',
	size: 'xl',
})`
	font-size: 14px;
	font-family: ${(props) => props.theme.fonts.condensedBold};

	width: 150px;
	display: inline-grid;
	grid-template-columns: auto 1fr;
	align-items: center;
	justify-items: center;

	svg {
		margin-right: 5px;
		color: ${(props) => props.theme.colors.gray};
	}
`;

const WatchWalletContainer = styled.div`
	padding-bottom: 22px;
`;

const SelectedWallet = styled.div`
	padding-bottom: 18px;
	img {
		width: 44px;
	}
`;

const WalletAddress = styled(GridDivCenteredCol)`
	display: grid;
	justify-content: center;
	align-items: center;
	grid-gap: 10px;
	padding-bottom: 18px;
	font-family: ${(props) => props.theme.fonts.extended};
`;

const CopyClipboardContainer = styled(FlexDiv)`
	cursor: pointer;
	color: ${(props) => props.theme.colors.gray};
`;

const Network = styled(GridDivCenteredCol)`
	display: inline-grid;
	grid-gap: 8px;
	text-transform: uppercase;
	font-family: ${(props) => props.theme.fonts.condensedMedium};
`;

const Buttons = styled(GridDivCenteredRow)`
	grid-gap: 16px;
	grid-template-rows: 1fr 1fr;
	grid-template-columns: 1fr 1fr;
`;

const StyledTooltip = styled(Tooltip)`
	background: ${(props) => props.theme.colors.mediumBlue};
	.tippy-content {
		font-size: 12px;
		padding: 10px;
	}
`;

export default WatchWalletModal;
