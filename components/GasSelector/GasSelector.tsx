import { useEffect } from 'react';

import styled from 'styled-components';
import { useRecoilState } from 'recoil';
import Tippy from '@tippyjs/react';

import { gasSpeedState } from 'store/wallet';
import { GasLimitEstimate } from 'constants/network';

import useSynthetixQueries, { GasPrice, GAS_SPEEDS } from '@synthetixio/queries';
import useSelectedPriceCurrency from 'hooks/useSelectedPriceCurrency';
import { getTotalGasPrice, getTransactionPrice } from 'utils/network';
import { getExchangeRatesForCurrencies } from 'utils/currencies';

import { Synths } from 'constants/currency';
import { formatCurrency } from 'utils/formatters/number';
import Button from 'components/Button';
import { useTranslation } from 'react-i18next';
import { FlexDivRow, FlexDivRowCentered, NumericValue } from 'styles/common';
import Info from 'assets/svg/app/info.svg';
import Wei from '@synthetixio/wei';
import GasPriceDisplay from './GasPriceDisplay';
import Connector from 'containers/Connector';

type GasSelectorProps = {
  gasLimitEstimate: GasLimitEstimate;
  optimismLayerOneFee: Wei | null;
  onGasPriceChange: (gasPrice: GasPrice) => void;
  altVersion?: boolean;
};

const GasSelector: React.FC<GasSelectorProps> = ({
  gasLimitEstimate,
  onGasPriceChange,
  optimismLayerOneFee,
  altVersion = false,
  ...rest
}) => {
  const { t } = useTranslation();
  const { isL2 } = Connector.useContainer();

  const [gasSpeed, setGasSpeed] = useRecoilState(gasSpeedState);

  const { useExchangeRatesQuery, useEthGasPriceQuery } = useSynthetixQueries();

  const { selectedPriceCurrency } = useSelectedPriceCurrency();
  const exchangeRatesQuery = useExchangeRatesQuery();
  const gasPriceQuery = useEthGasPriceQuery();

  const gasPrices = gasPriceQuery.data;
  const exchangeRates = exchangeRatesQuery.data ?? null;

  const gasPrice = gasPriceQuery.data != null ? gasPriceQuery.data[gasSpeed] : null;

  useEffect(() => {
    if (gasPrice) {
      const gasPriceForTransaction =
        'gasPrice' in gasPrice
          ? { gasPrice: gasPrice.gasPrice }
          : {
              maxPriorityFeePerGas: gasPrice.maxPriorityFeePerGas,
              maxFeePerGas: gasPrice.maxFeePerGas,
            };
      onGasPriceChange(gasPriceForTransaction);
    }

    // eslint-disable-next-line
  }, [gasPrice]);

  const ethPriceRate = getExchangeRatesForCurrencies(
    exchangeRates,
    Synths.sETH,
    selectedPriceCurrency.name
  );

  const transactionFee = getTransactionPrice(
    gasPrice,
    gasLimitEstimate,
    ethPriceRate,
    optimismLayerOneFee
  );
  const content = (
    <GasSelectContainer>
      {GAS_SPEEDS.map((speed) => (
        <StyedGasButton
          key={speed}
          variant="solid"
          onClick={() => {
            setGasSpeed(speed);
          }}
          isActive={gasSpeed === speed}
        >
          <GasPriceTextDropDown>{t(`common.gas-prices.${speed}`) + ' '} </GasPriceTextDropDown>
          <NumericValue>
            {getTotalGasPrice(gasPrices ? gasPrices[speed] : null).toNumber()}
          </NumericValue>
        </StyedGasButton>
      ))}
    </GasSelectContainer>
  );

  if (altVersion) {
    return (
      <GasPriceContainer>
        <GasPriceTooltip trigger="click" arrow={false} content={content} interactive={true}>
          <div>
            {t('common.gas-prices.est', {
              amount:
                transactionFee != null
                  ? `(${formatCurrency(selectedPriceCurrency.name, transactionFee, {
                      sign: selectedPriceCurrency.sign,
                    })})`
                  : '',
            })}
          </div>
        </GasPriceTooltip>
      </GasPriceContainer>
    );
  }

  return (
    <Container {...rest}>
      <GasPriceHeader>{t('common.gas-header')}</GasPriceHeader>
      <FlexDivRowCentered>
        <GasPriceItem>
          <GasPriceText>
            <GasPriceDisplay
              isL2={isL2}
              gasPrice={gasPrice}
              optimismLayerOneFee={optimismLayerOneFee}
            />{' '}
            {transactionFee != null &&
              `(${formatCurrency(selectedPriceCurrency.name, transactionFee, {
                sign: selectedPriceCurrency.sign,
              })})`}
          </GasPriceText>
        </GasPriceItem>
        {isL2 ? (
          <GasPriceTooltip
            arrow={false}
            content={t('common.layer-2.gas-fee-info')}
            interactive={true}
          >
            <span>
              <ResizedInfoIcon width="12" />
            </span>
          </GasPriceTooltip>
        ) : (
          <GasPriceTooltip trigger="click" arrow={false} content={content} interactive={true}>
            <StyledGasEditButton role="button" data-testid="edit-gas-price-button">
              {t('common.edit')}
            </StyledGasEditButton>
          </GasPriceTooltip>
        )}
      </FlexDivRowCentered>
    </Container>
  );
};

const Container = styled(FlexDivRow)`
  width: 100%;
  justify-content: space-between;
`;

const GasPriceContainer = styled(FlexDivRowCentered)`
  margin-top: 10px;
  font-family: ${(props) => props.theme.fonts.interBold};
  font-size: 12px;
  color: ${(props) => props.theme.colors.gray};
  padding: 2px 0;
  cursor: pointer;
  border-bottom: 1px dashed ${(props) => props.theme.colors.gray};
`;

const GasPriceHeader = styled.p`
  font-family: ${(props) => props.theme.fonts.interBold};
  font-size: 12px;
  color: ${(props) => props.theme.colors.gray};
  text-transform: uppercase;
`;

const GasPriceText = styled.span`
  font-family: ${(props) => props.theme.fonts.interBold};
  font-size: 12px;
  color: ${(props) => props.theme.colors.white};
`;
const GasPriceTextDropDown = styled(GasPriceText)`
  margin-right: 5px;
`;

const GasPriceTooltip = styled(Tippy)`
  background: ${(props) => props.theme.colors.navy};
  border: 0.5px solid ${(props) => props.theme.colors.navy};
  border-radius: 4px;
`;

const GasSelectContainer = styled.div`
  padding: 16px 0 8px 0;
`;

const StyedGasButton = styled(Button)`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-left: 10px;
  padding-right: 10px;
  font-size: 12px;
`;

const GasPriceItem = styled.span`
  display: inline-flex;
  align-items: center;
  svg {
    margin-left: 5px;
  }
`;

const StyledGasEditButton = styled.span`
  font-family: ${(props) => props.theme.fonts.interBold};
  padding-left: 5px;
  font-size: 12px;
  cursor: pointer;
  color: ${(props) => props.theme.colors.blue};
  text-transform: uppercase;
`;

const ResizedInfoIcon = styled(Info)`
  transform: translateX(2px);
  cursor: pointer;
`;

export default GasSelector;
