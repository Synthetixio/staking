import { FC, useMemo } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import Wei, { wei } from '@synthetixio/wei';

import { formatNumber } from 'utils/formatters/number';
import { FlexDivCentered, FlexDivColCentered, TextButton } from 'styles/common';

import NumericInput from 'components/Input/NumericInput';
import Select from 'components/Select';
import Currency from 'components/Currency';
import { FormLabel } from './common';

export type Asset = {
  currencyKey: string;
  balance: Wei;
};

type MaxBalanceProps = {
  balance: Wei;
  onSetMaxAmount: () => void;
  label?: string;
};

type AssetInputProps = {
  label: string;
  assets: Array<Asset>;
  asset: Asset | null;
  setAsset: (asset: Asset) => void;
  amount: string;
  setAmount: (amount: string) => void;
  onSetMaxAmount: () => void;
  selectDisabled?: boolean;
  inputDisabled?: boolean;
  balanceLabel?: string;
};

const Balance: FC<MaxBalanceProps> = ({
  balance,
  onSetMaxAmount,
  label = 'balance.input-label',
}) => {
  const { t } = useTranslation();
  return (
    <BalanceContainer>
      <BalanceAmount>
        {t(label)} {formatNumber(balance)}
      </BalanceAmount>
      <MaxButton onClick={onSetMaxAmount}>{t('balance.max')}</MaxButton>
    </BalanceContainer>
  );
};

const AssetInput: FC<AssetInputProps> = ({
  label,
  balanceLabel,
  assets,
  asset,
  setAsset,
  amount,
  setAmount,
  onSetMaxAmount,
  selectDisabled,
  inputDisabled,
}) => {
  const { t } = useTranslation();
  const options = useMemo(
    () => assets.map((asset) => ({ label: asset.currencyKey, value: asset })),
    [assets]
  );
  const value = useMemo(
    () => options.find(({ value }: { value: Asset }) => value.currencyKey === asset?.currencyKey),
    [options, asset]
  );

  const balance = useMemo(() => asset?.balance ?? wei(0), [asset]);

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
                setAmount('');
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

      <Balance {...{ balance, onSetMaxAmount, label: balanceLabel }} />
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

const BalanceAmount = styled.div`
  font-size: 12px;
  font-family: ${(props) => props.theme.fonts.condensedMedium};
  margin-right: 8px;
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

const SelectLabel = styled(FormLabel)`
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
  font-family: ${(props) => props.theme.fonts.condensedMedium};
  border: none;
  outline: none;
  color: ${(props) => props.theme.colors.blue};
  cursor: pointer;
  margin-left: 5px;
  font-size: 12px;
  text-transform: uppercase;
`;
