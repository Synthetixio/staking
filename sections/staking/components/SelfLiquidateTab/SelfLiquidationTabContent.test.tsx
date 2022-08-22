import '../../../../i18n';

import { render } from '@testing-library/react';
import ContextProvider from 'tests/ContextProider';
import SelfLiquidationTabContent from './SelfLiquidationTabContent';
import { wei } from '@synthetixio/wei';

describe('SelfLiquidationTabContent', () => {
  test('delegated wallet', () => {
    const result = render(
      <ContextProvider>
        {/* @ts-ignore */}
        <SelfLiquidationTabContent isDelegateWallet={true} />
      </ContextProvider>
    );
    const text = result.getByTestId('liq-delegated-wallet');
    const link = result.getByText('Read more about liquidations');
    expect(link).toBeInTheDocument();

    expect(text).toBeInTheDocument();
  });
  test('C-Ratio ok', () => {
    const result = render(
      <ContextProvider>
        {/* @ts-ignore */}
        <SelfLiquidationTabContent
          percentageCurrentCRatio={wei(3.1)}
          percentageTargetCRatio={wei(3)}
        />
      </ContextProvider>
    );
    const text = result.getByTestId('liq-c-ration-ok');
    const link = result.getByText('Read more about liquidations');
    expect(link).toBeInTheDocument();
    expect(text).toBeInTheDocument();
  });
  test('Enough sUSD balance to burn', () => {
    const result = render(
      <ContextProvider>
        {/* @ts-ignore */}
        <SelfLiquidationTabContent
          percentageCurrentCRatio={wei(2.9)}
          percentageTargetCRatio={wei(3)}
          burnAmountToFixCRatio={wei(100)}
          sUSDBalance={wei(150)}
        />
      </ContextProvider>
    );
    const text = result.getByTestId('liq-enough-susd-balance');
    const link = result.getByText('Read more about liquidations');
    expect(link).toBeInTheDocument();
    expect(text).toBeInTheDocument();
  });
  test('Not staking', () => {
    const result = render(
      <ContextProvider>
        {/* @ts-ignore */}
        <SelfLiquidationTabContent
          percentageCurrentCRatio={wei(0)}
          percentageTargetCRatio={wei(3)}
          burnAmountToFixCRatio={wei(0)}
          sUSDBalance={wei(0)}
        />
      </ContextProvider>
    );
    const text = result.getByTestId('not-staking');
    expect(text).toBeInTheDocument();
  });
  test('Show loader when waiting for penalty data', () => {
    const result = render(
      <ContextProvider>
        {/* @ts-ignore */}
        <SelfLiquidationTabContent
          percentageCurrentCRatio={wei(2.9)}
          percentageTargetCRatio={wei(3)}
          burnAmountToFixCRatio={wei(100)}
          sUSDBalance={wei(0)}
        />
      </ContextProvider>
    );
    const text = result.getByTestId('liq-loader');
    expect(text).toBeInTheDocument();
  });
  test('sUSD balance not 0 and can burn', () => {
    const result = render(
      <ContextProvider>
        <SelfLiquidationTabContent
          isDelegateWallet={false}
          percentageCurrentCRatio={wei(2.9)}
          percentageTargetCRatio={wei(3)}
          burnAmountToFixCRatio={wei(100)}
          sUSDBalance={wei(1)}
          selfLiquidationPenalty={wei(0.2)}
          liquidationPenalty={wei(0.3)}
          amountToSelfLiquidateUsd={wei(120)}
          SNXRate={wei(3)}
          walletAddress={'123'}
          canBurn={true}
        />
      </ContextProvider>
    );
    const text = result.getByTestId('liq-ratios');
    const text1 = result.getByTestId('liq-burn-amount');
    const text2 = result.getByTestId('liq-balance-not-zero');
    const button = result.getByTestId('burn-max-btn');
    const link = result.getByText('Read more about liquidations');
    expect(link).toBeInTheDocument();
    expect(text).toBeInTheDocument();
    expect(text1).toBeInTheDocument();
    expect(text2).toBeInTheDocument();
    expect(button).toBeInTheDocument();
  });
  test('sUSD balance not 0 and can NOT burn', () => {
    const result = render(
      <ContextProvider>
        <SelfLiquidationTabContent
          isDelegateWallet={false}
          percentageCurrentCRatio={wei(2.9)}
          percentageTargetCRatio={wei(3)}
          burnAmountToFixCRatio={wei(100)}
          sUSDBalance={wei(1)}
          selfLiquidationPenalty={wei(0.2)}
          liquidationPenalty={wei(0.3)}
          amountToSelfLiquidateUsd={wei(120)}
          SNXRate={wei(3)}
          walletAddress={'123'}
          canBurn={false}
        />
      </ContextProvider>
    );
    const text = result.getByTestId('liq-ratios');
    const text1 = result.getByTestId('liq-burn-amount');
    const text2 = result.getByTestId('self-liquidate-info');
    const button = result.getByTestId('self-liquidate-btn');
    const link = result.getByText('Read more about liquidations');
    expect(link).toBeInTheDocument();
    expect(text).toBeInTheDocument();
    expect(text1).toBeInTheDocument();
    expect(text2).toBeInTheDocument();
    expect(button).toBeInTheDocument();
  });
  test('sUSD balance is 0', () => {
    const result = render(
      <ContextProvider>
        <SelfLiquidationTabContent
          isDelegateWallet={false}
          percentageCurrentCRatio={wei(2.9)}
          percentageTargetCRatio={wei(3)}
          burnAmountToFixCRatio={wei(100)}
          sUSDBalance={wei(0)}
          selfLiquidationPenalty={wei(0.2)}
          liquidationPenalty={wei(0.3)}
          amountToSelfLiquidateUsd={wei(120)}
          SNXRate={wei(3)}
          walletAddress={'123'}
          canBurn={true}
        />
      </ContextProvider>
    );
    const text = result.getByTestId('liq-ratios');
    const text1 = result.getByTestId('liq-burn-amount');
    const text2 = result.getByTestId('self-liquidate-info');
    const button = result.getByTestId('self-liquidate-btn');
    const link = result.getByText('Read more about liquidations');
    expect(link).toBeInTheDocument();
    expect(text).toBeInTheDocument();
    expect(text1).toBeInTheDocument();
    expect(text2).toBeInTheDocument();
    expect(button).toBeInTheDocument();
  });
});
