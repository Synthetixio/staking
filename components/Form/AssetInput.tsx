import { FC, useMemo } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import BigNumber from 'bignumber.js';

import { formatNumber, zeroBN } from 'utils/formatters/number';
import { FlexDivCentered, FlexDivColCentered, TextButton } from 'styles/common';

import NumericInput from 'components/Input/NumericInput';
import Select from 'components/Select';
import Currency from 'components/Currency';
import { Asset } from 'queries/walletBalances/types';

type MaxBalanceProps = {
	balance: string;
	onSetMaxAmount: () => void;
};

type AssetInputProps = {
	label: string;
	assets: Array<Asset>;
	asset: Asset | null;
	setAsset: (asset: Asset) => void;
	selectDisabled?: boolean;
	amount: string;
	setAmount: (amount: string) => void;
	onSetMaxAmount?: (amount: string) => void;
	balance: BigNumber;
	inputDisabled: boolean;
};

const Balance: FC<MaxBalanceProps> = ({ balance, onSetMaxAmount }) => {
	const { t } = useTranslation();
	return (
		<BalanceContainer>
			{t('balance.input-label')} {formatNumber(balance)}{' '}
			<MaxButton onClick={onSetMaxAmount}>{t('balance.max')}</MaxButton>
		</BalanceContainer>
	);
};

const AssetInput: FC<AssetInputProps> = ({
	label,
	assets,
	asset,
	setAsset,
	selectDisabled,
	amount,
	setAmount,
	onSetMaxAmount,
	inputDisabled,
}) => {
	const { t } = useTranslation();
	const options = useMemo(
		() => assets.map(({ currencyKey }) => ({ label: currencyKey, value: currencyKey })),
		[assets]
	);
	const value = useMemo(() => options.find(({ value }) => value === asset?.currencyKey), [
		options,
		asset,
	]);

	const balance = useMemo(() => asset?.balance ?? zeroBN, [asset]);
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

			<Balance {...{ balance, onSetMaxAmount }} />
		</Container>
	);
};

export default AssetInput;

const BalanceContainer = styled.div`
	display: flex;
	font-size: 12px;
	margin-top: 14px;
	color: ${(props) => props.theme.colors.gray};
`;

const Container = styled(FlexDivColCentered)`
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

const SelectInput = styled.div`
	width: 110px;
`;

const AmountContainer = styled(FlexDivCentered)`
	justify-content: space-between;
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

const MaxButton = styled(TextButton)`
	background: none;
	border: none;
	outline: none;
	color: ${(props) => props.theme.colors.blue};
	cursor: pointer;
	margin-left: 5px;
	text-transform: uppercase;
`;
