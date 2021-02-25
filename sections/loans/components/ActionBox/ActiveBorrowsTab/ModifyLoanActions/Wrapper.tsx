import React from 'react';
import { useRouter } from 'next/router';
import styled from 'styled-components';
import { Svg } from 'react-optimized-image';
import NavigationBack from 'assets/svg/app/navigation-back.svg';
import { IconButton, FlexDivRowCentered, FlexDivColCentered } from 'styles/common';
import GasSelector from 'components/GasSelector';
import {
	FormContainer,
	InputsContainer,
	InputsDivider,
	SettingsContainer,
	SettingContainer,
} from 'sections/loans/components/common';
import AssetInput from 'sections/loans/components/ActionBox/BorrowSynthsTab/AssetInput';
import FormButton from './components/FormButton';

type WrapperProps = {
	aLabel: string;
	aAsset: string;
	aAmountNumber: string;
	onSetAAmount: (amount: string) => void;

	bLabel: string;
	bAsset: string;
	bAmountNumber: string;
	onSetBAmount: (amount: string) => void;

	buttonLabel: string;
};

const Wrapper: React.FC<WrapperProps> = ({
	aLabel,
	aAsset,
	aAmountNumber,
	onSetAAmount,

	bLabel,
	bAsset,
	bAmountNumber,
	onSetBAmount,

	buttonLabel,
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
						setAmount={onSetAAmount}
						assets={[aAsset]}
						disabled={true}
					/>
					<InputsDivider />
					<AssetInput
						label={bLabel}
						asset={bAsset}
						setAsset={onSetBAsset}
						amount={bAmountNumber}
						setAmount={onSetBAmount}
						assets={[bAsset]}
						disabled={true}
					/>
				</InputsContainer>

				<SettingsContainer>
					{/*
          <SettingContainer>
						<InterestRate />
          </SettingContainer>
          */}
					<SettingContainer>
						<GasSelector gasLimitEstimate={gasLimitEstimate} setGasPrice={setGasPrice} />
					</SettingContainer>
				</SettingsContainer>
			</FormContainer>

			<FormButton label={buttonLabel} />
		</>
	);
};

const Header = styled(FlexDivRowCentered)`
	justify-content: space-between;
	width: 100%;
	padding: 8px;
`;

export default Wrapper;
