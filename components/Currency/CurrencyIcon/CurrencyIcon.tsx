import React, { FC, useState } from 'react';
import styled from 'styled-components';

import ETHIcon from 'assets/svg/currencies/crypto/ETH.svg';
import SNXIcon from 'assets/svg/currencies/crypto/SNX.svg';
import BTCIcon from 'assets/svg/currencies/crypto/BTC.svg';
import CRVIcon from 'assets/svg/currencies/crypto/CRV.svg';
import DeprecatedXIcon from 'assets/svg/app/deprecated-x.svg';

import { CryptoCurrency, CurrencyKey } from 'constants/currency';

import { FlexDivCentered } from 'styles/common';
import useSynthetixQueries from '@synthetixio/queries';
import { EXTERNAL_LINKS } from 'constants/links';

export enum CurrencyIconType {
  SYNTH = 'synth',
  ASSET = 'asset',
  TOKEN = 'token',
}

type CurrencyIconProps = {
  currencyKey: CurrencyKey;
  type?: CurrencyIconType;
  className?: string;
  width?: string;
  height?: string;
  isDeprecated?: boolean;
};

export const getSynthIcon = (currencyKey: CurrencyKey) =>
  `https://raw.githubusercontent.com/Synthetixio/synthetix-assets/master/synths/${currencyKey}.svg`;

export const CurrencyIconContainer: FC<CurrencyIconProps> = (props) => (
  <Container>
    <CurrencyIcon {...props} />
    {props.isDeprecated && (
      <DeprecatedXIconContainer>
        <DeprecatedXIcon width="32" />
      </DeprecatedXIconContainer>
    )}
  </Container>
);

export const CurrencyIcon: FC<CurrencyIconProps> = ({ currencyKey, isDeprecated, ...rest }) => {
  const [firstFallbackError, setFirstFallbackError] = useState<boolean>(false);
  const [secondFallbackError, setSecondFallbackError] = useState<boolean>(false);
  const [thirdFallbackError, setThirdFallbackError] = useState<boolean>(false);

  const { useTokenListQuery } = useSynthetixQueries();

  const ZapperTokenListQuery = useTokenListQuery(EXTERNAL_LINKS.TokenLists.Zapper, {
    enabled: firstFallbackError,
    staleTime: 100000,
  });
  const ZapperTokenListMap = ZapperTokenListQuery.isSuccess
    ? ZapperTokenListQuery.data?.tokensMap ?? null
    : null;

  const OneInchTokenListQuery = useTokenListQuery(EXTERNAL_LINKS.TokenLists.OneInch, {
    enabled: secondFallbackError,
    staleTime: 100000,
  });
  const OneInchTokenListMap = OneInchTokenListQuery.isSuccess
    ? OneInchTokenListQuery.data?.tokensMap ?? null
    : null;

  const props = {
    width: '24px',
    height: '24px',
    alt: currencyKey,
    ...rest,
  };

  if (!firstFallbackError) {
    switch (currencyKey) {
      case CryptoCurrency.BTC: {
        return <BTCIcon {...props} />;
      }
      case CryptoCurrency.ETH: {
        return <ETHIcon {...props} />;
      }
      case CryptoCurrency.SNX: {
        return <SNXIcon {...props} />;
      }
      case CryptoCurrency.CRV: {
        return <CRVIcon {...props} />;
      }
      default:
        return (
          <TokenIcon
            {...{ isDeprecated }}
            src={getSynthIcon(currencyKey)}
            onError={() => setFirstFallbackError(true)}
            {...props}
            alt={currencyKey}
          />
        );
    }
  } else if (OneInchTokenListMap?.[currencyKey]?.logoURI && !secondFallbackError) {
    return (
      <TokenIcon
        src={OneInchTokenListMap?.[currencyKey]?.logoURI}
        onError={() => setSecondFallbackError(true)}
        {...props}
      />
    );
  } else if (ZapperTokenListMap?.[currencyKey]?.logoURI && !thirdFallbackError) {
    return (
      <TokenIcon
        src={ZapperTokenListMap?.[currencyKey]?.logoURI}
        onError={() => setThirdFallbackError(true)}
        {...props}
      />
    );
  } else {
    return (
      <Placeholder {...{ isDeprecated }} style={{ width: props.width, height: props.height }}>
        {currencyKey}
      </Placeholder>
    );
  }
};

const Container = styled.div`
  position: relative;
`;

const DeprecatedXIconContainer = styled.div`
  position: absolute;
  right: -3px;
  bottom: -3px;
`;

const Placeholder = styled(FlexDivCentered)<{ isDeprecated?: boolean }>`
  border-radius: 100%;
  color: ${(props) => props.theme.colors.white};
  border: 2px solid
    ${(props) => (props.isDeprecated ? props.theme.colors.red : props.theme.colors.white)};
  font-size: 7px;
  font-family: ${(props) => props.theme.fonts.interBold};
  justify-content: center;
  margin: 0 auto;
`;

const TokenIcon = styled.img<{ isDeprecated?: boolean }>`
  border-radius: 100%;
  border: 2px solid ${(props) => (props.isDeprecated ? props.theme.colors.red : 'transparent')};
`;

export default CurrencyIconContainer;
