import styled from 'styled-components';
import { FC } from 'react';
import { useRecoilValue } from 'recoil';

import useCryptoBalances from 'hooks/useCryptoBalances';

import { CryptoCurrency, Synths } from 'constants/currency';
import { DESKTOP_SIDE_NAV_WIDTH, zIndex } from 'constants/ui';

import { delegateWalletState } from 'store/wallet';

import PriceItem from 'sections/shared/Layout/Stats/PriceItem';
import PeriodBarStats from 'sections/shared/Layout/Stats/PeriodBarStats';
import BalanceItem from 'sections/shared/Layout/Stats/BalanceItem';
import CRatioBarStats from 'sections/shared/Layout/Stats/CRatioBarStats';
import { Tooltip } from 'styles/common';
import { useTranslation } from 'react-i18next';

import DesktopMenu from './DesktopMenu';
import useSynthetixQueries from '@synthetixio/queries';
import { wei } from '@synthetixio/wei';
import useGetCurrencyRateChange from 'hooks/useGetCurrencyRateChange';
import Connector from 'containers/Connector';
import { endOfHour, subDays } from 'date-fns';
import { useStakedSNX } from 'hooks/useStakedSNX';
import { formatPercent } from 'utils/formatters/number';

const DesktopSideNav: FC = () => {
  const delegateWallet = useRecoilValue(delegateWalletState);
  const { walletAddress } = Connector.useContainer();

  const { t } = useTranslation();
  const { useSynthsBalancesQuery } = useSynthetixQueries();
  const sevenDaysAgoSeconds = Math.floor(endOfHour(subDays(new Date(), 7)).getTime() / 1000);
  const currencyRateChange = useGetCurrencyRateChange(sevenDaysAgoSeconds, 'SNX');
  const cryptoBalances = useCryptoBalances(delegateWallet?.address ?? walletAddress);
  const synthsBalancesQuery = useSynthsBalancesQuery(delegateWallet?.address ?? walletAddress);

  const stakedSNXQuery = useStakedSNX();

  const snxBalance =
    cryptoBalances?.balances?.find((balance) => balance.currencyKey === CryptoCurrency.SNX)
      ?.balance ?? wei(0);

  const sUSDBalance = synthsBalancesQuery?.data?.balancesMap[Synths.sUSD]?.balance ?? wei(0);

  return (
    <Container data-testid="sidenav">
      <DesktopMenu />
      <LineSeparator />
      <MenuCharts>
        <CRatioBarStats />
        <BalanceItem amount={snxBalance} currencyKey={CryptoCurrency.SNX} />
        <BalanceItem amount={sUSDBalance} currencyKey={Synths.sUSD} />
        <Tooltip content={t('common.total-staking.staking-percentage-tooltip')}>
          <StyledTargetStakingRatio>
            <StyledTargetStakingRatioTitle>
              {t('common.total-staking.staking-percentage-title')}
            </StyledTargetStakingRatioTitle>
            {stakedSNXQuery.data?.systemStakingPercent
              ? formatPercent(stakedSNXQuery.data.systemStakingPercent)
              : '-'}
          </StyledTargetStakingRatio>
        </Tooltip>
        <Tooltip content={t('common.price-change.seven-days')}>
          <PriceItemContainer>
            <PriceItem currencyKey={CryptoCurrency.SNX} currencyRateChange={currencyRateChange} />
          </PriceItemContainer>
        </Tooltip>
        <PeriodBarStats />
      </MenuCharts>
    </Container>
  );
};

export default DesktopSideNav;

const Container = styled.div`
  z-index: ${zIndex.DIALOG_OVERLAY};
  height: 100%;
  position: fixed;
  top: 0;
  width: ${DESKTOP_SIDE_NAV_WIDTH}px;
  left: 0;
  background: ${(props) => props.theme.colors.darkGradient1Flipped};
  border-right: 1px solid ${(props) => props.theme.colors.grayBlue};
  display: grid;
  grid-template-rows: auto 1fr auto auto;
  overflow-y: hidden;
  overflow-x: visible;
  transition: left 0.3s ease-out;
`;
const PriceItemContainer = styled.div`
  margin-bottom: 18px;
`;

const LineSeparator = styled.div`
  height: 1px;
  background: ${(props) => props.theme.colors.grayBlue};
  margin-bottom: 25px;
`;

const MenuCharts = styled.div`
  margin: 0 auto;
  width: 100%;
  padding-left: 20px;
  padding-right: 20px;
`;

const StyledTargetStakingRatio = styled.div`
  font-family: ${(props) => props.theme.fonts.mono};
  color: ${(props) => props.theme.colors.white};
  font-size: 12px;
  margin-bottom: 18px;
`;

const StyledTargetStakingRatioTitle = styled.h3`
  font-family: ${(props) => props.theme.fonts.interBold};
  color: ${(props) => props.theme.colors.gray};
  text-transform: uppercase;
  padding-bottom: 5px;
  font-size: 12px;
  margin: 0;
`;
