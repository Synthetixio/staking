import React from 'react';
import styled, { useTheme } from 'styled-components';
import { NetworkIdByName } from '@synthetixio/contracts-interface';
import Connector from 'containers/Connector';

type ConnectionDotProps = {};

const ConnectionDot: React.FC<ConnectionDotProps> = ({ ...rest }) => {
  const { network, isWalletConnected, isL2 } = Connector.useContainer();

  const theme = useTheme();

  if (network && isWalletConnected) {
    if (isL2) return <Dot {...rest} background={theme.colors.layer2} />;
    switch (network.id) {
      case NetworkIdByName.mainnet:
        return <Dot {...rest} background={theme.colors.mainnet} />;
      case NetworkIdByName.kovan:
        return <Dot {...rest} background={theme.colors.kovan} />;
      case NetworkIdByName.goerli:
        return <Dot {...rest} background={theme.colors.goerli} />;
      default:
        return <Dot {...rest} background={theme.colors.noNetwork} />;
    }
  } else {
    return <Dot {...rest} background={theme.colors.noNetwork} />;
  }
};

const Dot = styled.span<{ background: string }>`
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 100%;
  background-color: ${(props) => props.background};
`;

export default ConnectionDot;
