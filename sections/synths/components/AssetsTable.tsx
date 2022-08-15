import { FC, ReactNode } from 'react';
import styled from 'styled-components';
import Wei from '@synthetixio/wei';

import media from 'styles/media';
import { DesktopOrTabletView, MobileOnlyView } from 'components/Media';
import { MOBILE_BODY_PADDING } from 'constants/ui';

import DesktopAssetsTable from './DesktopAssetsTable';
import MobileAssetsTable from './MobileAssetsTable';
import { CryptoBalance } from 'hooks/useCryptoBalances';
import Connector from 'containers/Connector';

type AssetsTableProps = {
  title: ReactNode;
  assets: CryptoBalance[];
  totalValue: Wei;
  isLoading: boolean;
  isLoaded: boolean;
  showConvert: boolean;
  showHoldings: boolean;
  isDeprecated?: boolean;
  onTransferClick?: (currencyKey: string) => void;
  showValue?: boolean;
  showTotalValue?: boolean;
  showPrice?: boolean;
};

const AssetsTable: FC<AssetsTableProps> = ({
  assets,
  totalValue,
  isLoading,
  isLoaded,
  title,
  showHoldings,
  showConvert,
  isDeprecated,
  onTransferClick,
  showValue = true,
  showTotalValue = true,
  showPrice = true,
}) => {
  const { isWalletConnected } = Connector.useContainer();

  return (
    <Container>
      {isWalletConnected && <Header>{title}</Header>}

      <DesktopOrTabletView>
        <DesktopAssetsTable
          {...{
            assets,
            totalValue,
            isLoading,
            isLoaded,
            showHoldings,
            showConvert,
            isDeprecated,
            onTransferClick,
            showValue,
            showTotalValue,
            showPrice,
          }}
        />
      </DesktopOrTabletView>

      <MobileOnlyView>
        <MobileAssetsTable
          {...{
            assets,
            totalValue,
            isLoading,
            isLoaded,
            showHoldings,
            showConvert,
            isDeprecated,
            onTransferClick,
            showValue,
            showTotalValue,
            showPrice,
          }}
        />
      </MobileOnlyView>
    </Container>
  );
};

const Container = styled.div`
  margin-bottom: 8px;
`;

const Header = styled.div`
  color: ${(props) => props.theme.colors.white};
  font-family: ${(props) => props.theme.fonts.extended};
  font-size: 16px;
  padding-bottom: 20px;

  ${media.lessThan('mdUp')`
    padding-left: ${MOBILE_BODY_PADDING}px;
    padding-right: ${MOBILE_BODY_PADDING}px;
  `}
`;

export default AssetsTable;
