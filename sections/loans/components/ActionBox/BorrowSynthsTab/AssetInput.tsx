import React from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';

import Select from 'components/Select';
import Currency from 'components/Currency';
import NumericInput from 'components/Input/NumericInput';
import { FlexDivCentered, FlexDivColCentered } from 'styles/common';
import Balance from 'sections/loans/components/ActionBox/components/Balance';

type AssetInputProps = {
	label: string;
	asset: string;
	setAsset: (asset: string) => void;
	amount: string;
	setAmount: (amount: string) => void;
	assets: Array<string>;
	selectDisabled?: boolean;
	inputDisabled?: boolean;
	onSetMaxAmount?: (amount: string) => void;
};

const AssetInput: React.FC<AssetInputProps> = ({
	label,
	asset,
	setAsset,
	amount,
	setAmount,
	assets,
	selectDisabled,
	inputDisabled,
	onSetMaxAmount,
}) => {
	const { t } = useTranslation();
	const options = React.useMemo(() => assets.map((value) => ({ label: value, value })), [assets]);
	const value = React.useMemo(() => options.find(({ value }) => value === asset), [options, asset]);

	return (
		<Container>
			<SelectContainer>
				<SelectLabel>{t(label)}</SelectLabel>
				<SelectInput>
					<Select
						inputId={`${label}-asset-options`}
						formatOptionLabel={(option) => (
							<Currency.Name currencyKey={option.label} showIcon={true} />
						)}
						{...{ options, value }}
						onChange={(option: any) => {
							if (option) {
								setAsset(option.value);
							}
						}}
						variant="outline"
						isDisabled={selectDisabled}
					/>
				</SelectInput>
			</SelectContainer>

			<AmountContainer>
				<AmountInput
					value={amount}
					placeholder="0.00"
					onChange={(e) => setAmount(e.target.value)}
					disabled={!!inputDisabled}
				/>
			</AmountContainer>

			<Balance {...{ asset, onSetMaxAmount }} />
		</Container>
	);
};

export default AssetInput;

export const Container = styled(FlexDivColCentered)`
	margin: 24px auto;
	padding-right: 12px;
	justify-content: center;

	.react-select--is-disabled {
		opacity: 1;
	}
	input:disabled {
		color: ${(props) => props.theme.colors.white};
	}
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
	width: 110px;
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
