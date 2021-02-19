import React from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';

import { FlexDivCentered, FlexDivColCentered } from 'styles/common';
import NumericInput from 'components/Input/NumericInput';
import Select from 'components/Select';

type AssetInputProps = {
	label: string;

	asset: string;
	setAsset: (tx: string) => void;

	amount: string;
	setAmount: (tx: string) => void;

	assets: Array<string>;
};

const AssetInput: React.FC<AssetInputProps> = ({
	label,
	asset,
	setAsset,

	amount,
	setAmount,

	assets,
}) => {
	const { t } = useTranslation();
	const options = assets.map((value) => ({ label: value, value }));

	return (
		<Container>
			<SelectContainer>
				<SelectLabel>{t(`loans.tabs.form.${label}.label`)}</SelectLabel>
				<SelectInput>
					<Select
						inputId="debt-asset-options"
						formatOptionLabel={(option) => <span>{option.label}</span>}
						options={options}
						value={options.find(({ value }) => value === asset)}
						onChange={(option: any) => {
							if (option) {
								setAsset(option.value);
							}
						}}
						variant="outline"
					/>
				</SelectInput>
			</SelectContainer>

			<AmountContainer>
				<AmountInput
					value={amount}
					placeholder="0.00"
					onChange={(e) => setAmount(e.target.value)}
				/>
			</AmountContainer>
		</Container>
	);
};

export default AssetInput;

export const Container = styled(FlexDivColCentered)`
	margin: 24px auto;
	padding-right: 12px;
	justify-content: center;
`;

const SelectContainer = styled.div`
	display: flex;
	align-items: center;
`;

const SelectLabel = styled.div`
	font-family: ${(props) => props.theme.fonts.condensedBold};
	font-style: normal;
	font-weight: 500;
	font-size: 12px;
	line-height: 120%;
	text-transform: uppercase;
	color: #828295;
	margin-right: 10px;
`;

const SelectInput = styled.div`
	width: 90px;
`;

const AmountContainer = styled(FlexDivCentered)`
	justify-content: space-between;
`;

const AmountInput = styled(NumericInput)`
	padding: 0;
	font-size: 24px;
	background: transparent;
	font-family: ${(props) => props.theme.fonts.extended};
	text-align: center;
	margin-top: 15px;

	&:disabled {
		color: ${(props) => props.theme.colors.gray};
	}
`;
