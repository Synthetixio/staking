import React from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';

import media from 'styles/media';
import Select from 'components/Select';
import Currency from 'components/Currency';
import NumericInput from 'components/Input/NumericInput';
import { FlexDivCentered, FlexDivColCentered } from 'styles/common';
import { DesktopOnlyView, MobileOrTabletView } from 'components/Media';

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
  testId?: string;
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
  testId,
}) => {
  const { t } = useTranslation();
  const options = React.useMemo(() => assets.map((value) => ({ label: value, value })), [assets]);
  const value = React.useMemo(() => options.find(({ value }) => value === asset), [options, asset]);

  const selectLabel = <SelectLabel>{t(label)}</SelectLabel>;

  const selectInput = (
    <SelectInput data-testid="select">
      <Select
        hideArrow={true}
        inputId={`${label}-asset-options`}
        formatOptionLabel={(option) => <Currency.Name currencyKey={option.label} showIcon={true} />}
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
  );

  const amountInput = (
    <AmountContainer>
      <AmountInput
        allowEmpty={true}
        value={amount}
        placeholder="0.00"
        onChange={(e) => setAmount(e.target.value)}
        disabled={!!inputDisabled}
        data-testid="input"
      />
    </AmountContainer>
  );

  const balanceLabel = (
    <BalanceContainer>
      <Balance asset={asset} onSetMaxAmount={onSetMaxAmount} />
    </BalanceContainer>
  );

  return (
    <>
      <DesktopOnlyView>
        <Container data-testid={testId}>
          <SelectContainer>
            {selectLabel}
            {selectInput}
          </SelectContainer>

          {amountInput}
          {balanceLabel}
        </Container>
      </DesktopOnlyView>
      <MobileOrTabletView>
        <Container data-testid={testId}>
          {selectLabel}
          {amountInput}
          {selectInput}
          {balanceLabel}
        </Container>
      </MobileOrTabletView>
    </>
  );
};

export default AssetInput;

export const Container = styled(FlexDivColCentered)`
  .react-select--is-disabled {
    opacity: 1;
  }
  input:disabled {
    color: ${(props) => props.theme.colors.white};
  }

  ${media.greaterThan('mdUp')`
    margin: 24px auto;
    padding-right: 12px;
    justify-content: center;
  `}

  ${media.lessThan('mdUp')`
    display: grid;
    grid-template-areas:
      'tile-1 tile-2'
      'tile-3 tile-4';
    grid-template-columns: 1fr 1fr;
    grid-gap: 1rem;
  `}
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

  ${media.lessThan('mdUp')`
    grid-area: tile-1;
    align-items: flex-end;
    height: 40px;
    display: flex;
  `}
`;

const SelectContainer = styled.div`
  display: flex;
  align-items: center;
`;

const SelectInput = styled.div`
  width: 110px;

  ${media.lessThan('mdUp')`
    grid-area: tile-3;
    width: auto;
  `}
`;

const AmountContainer = styled(FlexDivCentered)`
  ${media.greaterThan('mdUp')`
  justify-content: space-between;
`}

  ${media.lessThan('mdUp')`
    grid-area: tile-2;
    text-align: right;
  `}
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

  ${media.lessThan('mdUp')`
    text-align: right;
  `}
`;

const BalanceContainer = styled.div`
  min-height: 30px;
  & > div {
    ${media.greaterThan('mdUp')`
      margin-top: 14px;
    `}

    ${media.lessThan('mdUp')`
      grid-area: tile-4;
      text-align: right;
      justify-content: flex-end;
      white-space: pre;
    `}
  }
`;
