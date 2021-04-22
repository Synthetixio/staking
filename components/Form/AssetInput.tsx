import { FC } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';

import { formatNumber } from 'utils/formatters/number';
import { FlexDivCentered } from 'styles/common';

type MaxBalanceProps = {
	balance: string;
	handleSetMaxAmount: () => void;
};

type AssetInputProps = {
	label: string;
};

const Balance: FC<MaxBalanceProps> = ({ balance, handleSetMaxAmount }) => {
	const { t } = useTranslation();
	return (
		<Container>
			{t('balance.input-label')} {formatNumber(balance)}{' '}
			<StyleMaxButton onClick={handleSetMaxAmount} />
		</Container>
	);
};

const AssetInput: FC<AssetInputProps> = ({ label }) => {
	const { t } = useTranslation();
	return (
		<Container>
			<SelectContainer>
				<SelectLabel>{t(label)}</SelectLabel>
				<SelectInput data-testid="select">
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
					data-testid="input"
				/>
			</AmountContainer>

			{/* <Balance {...{ asset, onSetMaxAmount }} /> */}
		</Container>
	);
};

export default AssetInput;

const Container = styled.div`
	display: flex;
	font-size: 12px;
	margin-top: 14px;
	color: ${(props) => props.theme.colors.gray};
`;

const SelectContainer = styled(FlexDivCentered)``;

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

const StyleMaxButton = styled.button`
	color: ${(props) => props.theme.colors.blue};
	cursor: pointer;
	margin-left: 5px;
	text-transform: uppercase;
`;
