import React from 'react';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import { Trans } from 'react-i18next';
import Button from 'components/Button';
import { NoTextTransform } from 'styles/common';
import { Svg } from 'react-optimized-image';
import NavigationBack from 'assets/svg/app/navigation-back.svg';
import { IconButton, FlexDivRowCentered } from 'styles/common';
import GasSelector from 'components/GasSelector';
import {
	FormContainer,
	InputsContainer,
	InputsDivider,
	SettingsContainer,
	SettingContainer,
} from 'sections/loans/components/common';
import AssetInput from 'sections/loans/components/ActionBox/BorrowSynthsTab/AssetInput';
import { Loan } from 'queries/loans/types';
import AccruedInterest from 'sections/loans/components/ActionBox/components/AccruedInterest';
import CRatio from 'sections/loans/components/ActionBox/components/LoanCRatio';

type WrapperProps = {
	aLabel: string;
	aAsset: string;
	aAmountNumber: string;
	onSetAAmount?: (amount: string) => void;
	onSetAMaxAmount?: (amount: string) => void;

	bLabel: string;
	bAsset: string;
	bAmountNumber: string;
	onSetBAmount?: (amount: string) => void;
	onSetBMaxAmount?: (amount: string) => void;

	buttonLabel: string;
	buttonIsDisabled: boolean;
	onButtonClick: () => void;

	loan: Loan;
	loanTypeIsETH: boolean;

	showCRatio?: boolean;
	showInterestAccrued?: boolean;
};

const Wrapper: React.FC<WrapperProps> = ({
	aLabel,
	aAsset,
	aAmountNumber,
	onSetAAmount,
	onSetAMaxAmount,

	bLabel,
	bAsset,
	bAmountNumber,
	onSetBAmount,
	onSetBMaxAmount,

	buttonLabel,
	buttonIsDisabled,
	onButtonClick,

	loan,
	loanTypeIsETH,

	showCRatio,
	showInterestAccrued,
}) => {
	const router = useRouter();

	const [gasLimitEstimate, setGasLimitEstimate] = React.useState<number | null>(null);
	const [gasPrice, setGasPrice] = React.useState<number>(0);

	const onGoBack = () => router.back();
	const onSetAAsset = () => {};
	const onSetBAsset = () => {};

	return (
		<>
			<FormContainer>
				<Header>
					<IconButton onClick={onGoBack}>
						<Svg src={NavigationBack} />
					</IconButton>
				</Header>

				<InputsContainer>
					<AssetInput
						label={aLabel}
						asset={aAsset}
						setAsset={onSetAAsset}
						amount={aAmountNumber}
						setAmount={onSetAAmount || noop}
						assets={[aAsset]}
						selectDisabled={true}
						inputDisabled={!onSetAAmount}
						onSetMaxAmount={onSetAMaxAmount}
					/>
					<InputsDivider />
					<AssetInput
						label={bLabel}
						asset={bAsset}
						setAsset={onSetBAsset}
						amount={bAmountNumber}
						setAmount={onSetBAmount || noop}
						assets={[bAsset]}
						selectDisabled={true}
						inputDisabled={!onSetBAmount}
						onSetMaxAmount={onSetBMaxAmount}
					/>
				</InputsContainer>

				<SettingsContainer>
					{!showCRatio ? null : (
						<SettingContainer>
							<CRatio {...{ loan, loanTypeIsETH }} />
						</SettingContainer>
					)}
					{!showInterestAccrued ? null : (
						<SettingContainer>
							<AccruedInterest {...{ loan }} />
						</SettingContainer>
					)}
					<SettingContainer>
						<GasSelector gasLimitEstimate={gasLimitEstimate} setGasPrice={setGasPrice} />
					</SettingContainer>
				</SettingsContainer>
			</FormContainer>

			<FormButton onClick={onButtonClick} variant="primary" size="lg" disabled={buttonIsDisabled}>
				<Trans i18nKey={buttonLabel} values={{}} components={[<NoTextTransform />]} />
			</FormButton>
		</>
	);
};

function noop() {}

const Header = styled(FlexDivRowCentered)`
	justify-content: space-between;
	width: 100%;
	padding: 8px;
`;

const FormButton = styled(Button)`
	font-size: 14px;
	font-family: ${(props) => props.theme.fonts.condensedMedium};
	box-shadow: 0px 0px 10px rgba(0, 209, 255, 0.9);
	border-radius: 4px;
	width: 100%;
	text-transform: uppercase;
`;

export default Wrapper;
