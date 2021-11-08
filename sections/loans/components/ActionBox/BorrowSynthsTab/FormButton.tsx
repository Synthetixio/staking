import React from 'react';
import styled from 'styled-components';
import { Trans, useTranslation } from 'react-i18next';
import Button from 'components/Button';
import { NoTextTransform } from 'styles/common';

type FormButtonProps = {
	collateralAsset: string;
	debtAsset: string;
	isWalletConnected: boolean;
	isApproved: boolean;
	hasLowCollateralAmount: boolean;
	hasLowCRatio: boolean;
	minCollateralAmountString: string;
	isBorrowing: boolean;
	hasInsufficientCollateral: boolean;
	onClick: () => Promise<void>;
	hasBothInputsSet: boolean;
};

const FormButton: React.FC<FormButtonProps> = ({
	collateralAsset,
	debtAsset,
	isWalletConnected,
	isApproved,
	hasLowCollateralAmount,
	hasLowCRatio,
	minCollateralAmountString,
	isBorrowing,
	hasInsufficientCollateral,
	onClick,
	hasBothInputsSet,
}) => {
	const { t } = useTranslation();
	if (!isWalletConnected) {
		return (
			<StyledCTA variant="primary" size="lg" onClick={onClick}>
				{t('common.wallet.connect-wallet')}
			</StyledCTA>
		);
	}
	return (
		<StyledCTA
			variant="primary"
			size="lg"
			disabled={
				!hasBothInputsSet ||
				hasLowCollateralAmount ||
				hasLowCRatio ||
				isBorrowing ||
				hasInsufficientCollateral
			}
			data-testid="loans-form-button"
			{...{ onClick }}
		>
			{isBorrowing ? (
				<Trans
					i18nKey="loans.tabs.new.button.borrowing-label"
					values={{
						collateralAsset,
					}}
					components={[<NoTextTransform />]}
				/>
			) : hasLowCollateralAmount ? (
				<Trans
					i18nKey="loans.tabs.new.button.low-collateral-label"
					values={{
						collateralAsset,
						minCollateralAmountString,
					}}
					components={[<NoTextTransform />]}
				/>
			) : hasInsufficientCollateral ? (
				<Trans
					i18nKey="loans.tabs.new.button.insufficient-label"
					values={{}}
					components={[<NoTextTransform />]}
				/>
			) : hasLowCRatio ? (
				<Trans
					i18nKey="loans.tabs.new.button.low-cratio-label"
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
	text-transform: uppercase;
`;
