import React from 'react';
import styled from 'styled-components';
import { Trans, useTranslation } from 'react-i18next';

import Button from 'components/Button';
import { NoTextTransform } from 'styles/common';

type FormButtonProps = {
	collateralAsset: string;
	debtAsset: string;
	error: string | null;
	isWalletConnected: boolean;
	isApproved: boolean;
	hasLessCollateralAmount: boolean;
	minCollateralAmountString: string;
	isApproving: boolean;
	isBorrowing: boolean;
	onClick: () => Promise<void>;
};

const FormButton: React.FC<FormButtonProps> = ({
	collateralAsset,
	debtAsset,
	error,
	isWalletConnected,
	isApproved,
	hasLessCollateralAmount,
	minCollateralAmountString,
	isApproving,
	isBorrowing,
	onClick,
}) => {
	const { t } = useTranslation();

	return (
		<StyledCTA
			variant="primary"
			size="lg"
			disabled={!!error || hasLessCollateralAmount || isApproving || isBorrowing}
			{...{ onClick }}
		>
			{!isWalletConnected ? (
				t('common.wallet.connect-wallet')
			) : error ? (
				t(error.toLowerCase())
			) : isApproving ? (
				<Trans
					i18nKey="loans.tabs.new.button.approving-label"
					values={{
						collateralAsset,
					}}
					components={[<NoTextTransform />]}
				/>
			) : isBorrowing ? (
				<Trans
					i18nKey="loans.tabs.new.button.borrowing-label"
					values={{
						collateralAsset,
					}}
					components={[<NoTextTransform />]}
				/>
			) : hasLessCollateralAmount ? (
				<Trans
					i18nKey="loans.tabs.new.button.less-collateral-label"
					values={{
						collateralAsset,
						minCollateralAmountString,
					}}
					components={[<NoTextTransform />]}
				/>
			) : !isApproved ? (
				<Trans
					i18nKey="loans.tabs.new.button.approve-label"
					values={{
						collateralAsset,
					}}
					components={[<NoTextTransform />]}
				/>
			) : (
				<Trans
					i18nKey="loans.tabs.new.button.borrow-label"
					values={{
						debtAsset,
					}}
					components={[<NoTextTransform />]}
				/>
			)}
		</StyledCTA>
	);
};

export default FormButton;

const StyledCTA = styled(Button)`
	font-size: 14px;
	font-family: ${(props) => props.theme.fonts.condensedMedium};
	box-shadow: 0px 0px 10px rgba(0, 209, 255, 0.9);
	border-radius: 4px;
	width: 100%;
`;
