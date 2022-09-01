import { FC, useState, PropsWithChildren } from 'react';
import styled from 'styled-components';

import { MOBILE_BODY_PADDING } from 'constants/ui';
import { CryptoCurrency, Synths } from 'constants/currency';
import { MobileOrTabletView } from 'components/Media';

import { FlexDivRowCentered } from 'styles/common';
import media from 'styles/media';

import PriceItem from 'sections/shared/Layout/Stats/PriceItem';
import PeriodBarStats from 'sections/shared/Layout/Stats/PeriodBarStats';
import BalanceItem from 'sections/shared/Layout/Stats/BalanceItem';
import CRatioBarStats from 'sections/shared/Layout/Stats/CRatioBarStats';

import CollapseIcon from 'assets/svg/app/chevron-collapse.svg';
import ExpandIcon from 'assets/svg/app/chevron-expand.svg';
import { useRecoilValue } from 'recoil';
import { delegateWalletState } from 'store/wallet';
import useSynthetixQueries from '@synthetixio/queries';
import { wei } from '@synthetixio/wei';
import useCryptoBalances from 'hooks/useCryptoBalances';
import { Tooltip } from 'styles/common';
import { useTranslation } from 'react-i18next';
import useGetCurrencyRateChange from 'hooks/useGetCurrencyRateChange';
import { subDays, endOfHour } from 'date-fns';
import Connector from 'containers/Connector';

const StatsSection: FC<PropsWithChildren> = ({ children }) => {
  const { walletAddress } = Connector.useContainer();

  const delegateWallet = useRecoilValue(delegateWalletState);
  const { t } = useTranslation();
  const { useSynthsBalancesQuery } = useSynthetixQueries();
  const sevenDaysAgoSeconds = Math.floor(endOfHour(subDays(new Date(), 7)).getTime() / 1000);
  const currencyRateChange = useGetCurrencyRateChange(sevenDaysAgoSeconds, 'SNX');

  const cryptoBalances = useCryptoBalances(delegateWallet?.address ?? walletAddress);
  const synthsBalancesQuery = useSynthsBalancesQuery(delegateWallet?.address ?? walletAddress);
  const [mobileStatsSectionIsOpen, setMobileStatsSectionIsOpen] = useState(false);

  const snxBalance =
    cryptoBalances?.balances?.find((balance) => balance.currencyKey === CryptoCurrency.SNX)
      ?.balance ?? wei(0);

  const sUSDBalance = synthsBalancesQuery?.data?.balancesMap[Synths.sUSD]?.balance ?? wei(0);

  const toggleMobileStatsSection = () =>
    setMobileStatsSectionIsOpen((mobileStatsSectionIsOpen) => !mobileStatsSectionIsOpen);

  return (
    <>
      <MobileOrTabletView>
        <ToggleMobileStatsSection onClick={toggleMobileStatsSection}>
          {mobileStatsSectionIsOpen ? <CollapseIcon width="13" /> : <ExpandIcon width="13" />}
        </ToggleMobileStatsSection>
      </MobileOrTabletView>
      <StatsContainer>{children}</StatsContainer>
      <MobileOrTabletView>
        <MobileOrTabletViewInner isVisible={mobileStatsSectionIsOpen}>
          <TopContainer>
            <CRatioBarStats />
            <PeriodBarStats />
          </TopContainer>
          <BottomContainer>
            <Tooltip content={t('common.price-change.seven-days')}>
              <div>
                <PriceItem
                  currencyKey={CryptoCurrency.SNX}
                  currencyRateChange={currencyRateChange}
                />
              </div>
            </Tooltip>
            <BalanceItem amount={snxBalance} currencyKey={CryptoCurrency.SNX} />
            <BalanceItem amount={sUSDBalance} currencyKey={Synths.sUSD} />
          </BottomContainer>
        </MobileOrTabletViewInner>
      </MobileOrTabletView>
    </>
  );
};

const StatsContainer = styled(FlexDivRowCentered)`
  width: 100%;
  margin: 0 auto;

  ${media.greaterThan('mdUp')`
    justify-content: center;
  `}

  ${media.lessThan('mdUp')`
    padding-right: ${MOBILE_BODY_PADDING}px;
    padding-left: ${MOBILE_BODY_PADDING}px;
    display: grid;
  `}
`;

const ToggleMobileStatsSection = styled.div`
  display: flex;
  justify-content: flex-end;
  position: relative;
  top: 50px;
  right: ${MOBILE_BODY_PADDING}px;
`;

const MobileOrTabletViewInner = styled.div<{ isVisible: boolean }>`
  transition: height 0.3s ease-out, opacity 0.3s ease-out;
  overflow-y: hidden;
  height: ${(props) => (props.isVisible ? '180px' : '0')};
  opacity: ${(props) => (props.isVisible ? '1' : '0')};
  padding-right: ${MOBILE_BODY_PADDING}px;
  padding-left: ${MOBILE_BODY_PADDING}px;
`;

const TopContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-gap: 1rem;

  & > div:nth-child(2) {
    margin-top: 1px;
  }
`;

const BottomContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  grid-gap: 1rem;

  & > div:nth-child(2) {
    align-items: center;
    text-align: center;
  }

  & > div:nth-child(3) {
    align-items: flex-end;
    text-align: right;
  }
`;

export default StatsSection;
