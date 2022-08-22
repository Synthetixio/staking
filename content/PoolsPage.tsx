import StatBox from 'components/StatBox';
import { BigNumber, utils } from 'ethers';
import Head from 'next/head';
import { useCallback, useEffect, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useGetUniswapStakingRewardsAPY } from 'sections/pool/useGetUniswapStakingRewardsAPY';
import PoolTabs from 'sections/pool/TabsButton';
import { useGUNILPToken } from 'sections/pool/useGUNILPToken';
import styled from 'styled-components';
import media from 'styled-media-query';
import { ExternalLink, FlexDivCol, LineSpacer, StatsSection } from 'styles/common';
import { WETHSNXLPTokenContract } from 'constants/gelato';
import { InfoContainer, Subtitle } from 'sections/migrate-escrow/components/common';
import Connector from 'containers/Connector';
import Button from 'components/Button';
import { switchToL2 } from '@synthetixio/optimism-networks';
import ConnectOrSwitchNetwork from '../components/ConnectOrSwitchNetwork';

function Pool() {
  const [LPBalance, setLPBalance] = useState(BigNumber.from(0));
  const [rewardsToClaim, setRewardsToClaim] = useState(BigNumber.from(0));
  const [allowanceAmount, setAllowanceAmount] = useState(BigNumber.from(0));
  const [stakedTokens, setStakedTokens] = useState(BigNumber.from(0));
  const { t } = useTranslation();

  const { walletAddress, synthetixjs } = Connector.useContainer();

  const { balanceOf, rewards, allowance, stakedTokensBalance } = useGUNILPToken({
    pool: 'weth-snx',
    userAddress: walletAddress,
  });

  const rates = useGetUniswapStakingRewardsAPY({
    stakingRewardsContract: synthetixjs?.contracts.StakingRewardsSNXWETHUniswapV3,
    tokenContract: WETHSNXLPTokenContract,
  });

  const fetchBalances = useCallback(() => {
    if (walletAddress) {
      balanceOf().then((balance) => {
        if (balance) setLPBalance(balance);
      });
      rewards().then((rewards) => {
        if (rewards) setRewardsToClaim(rewards);
      });
      allowance().then((amount) => {
        if (amount) setAllowanceAmount(amount);
      });
      stakedTokensBalance().then((amount) => {
        if (amount) setStakedTokens(amount);
      });
    }
  }, [allowance, balanceOf, rewards, stakedTokensBalance, walletAddress]);

  useEffect(() => {
    fetchBalances();
  }, [fetchBalances]);

  return (
    <>
      <Head>
        <title>{t('pool.page-title', { pool: 'WETH-SNX' })}</title>
      </Head>
      <StatsSection>
        <StyledLPBalance
          title={t('pool.stats.balance')}
          value={`$${
            rates.data?.gUNIPrice ? rates.data.gUNIPrice.mul(stakedTokens).toNumber().toFixed(2) : 0
          }`}
          size="md"
        />
        <StyledLPBalance
          title={t('pool.stats.APR')}
          value={`${rates.data?.apy.toFixed(2) || '-'}%`}
          size="lg"
          main
        />
        <StyledLPBalance
          title={t('pool.stats.rewards')}
          value={utils.formatUnits(rewardsToClaim, 18).slice(0, 10)}
          size="md"
        />
      </StatsSection>
      <LineSpacer />
      <Container>
        <FlexDivCol>
          <PoolTabs
            balance={LPBalance}
            rewardsToClaim={rewardsToClaim}
            allowanceAmount={allowanceAmount}
            stakedTokens={stakedTokens}
            fetchBalances={fetchBalances}
          />
        </FlexDivCol>
        <FlexDivCol>
          <StyledInfoContainer>
            {t('pool.info-headline')}
            <Subtitle>
              <Trans
                i18nKey={'pool.info'}
                components={[
                  <ol>
                    <li>
                      <Trans
                        i18nKey="pool.instruction-one"
                        components={[
                          <ExternalLink href="https://app.uniswap.org/#/swap?inputCurrency=ETH&outputCurrency=0x4200000000000000000000000000000000000006">
                            here
                          </ExternalLink>,
                        ]}
                      />
                    </li>
                    <li>
                      <Trans
                        i18nKey="pool.instruction-two"
                        components={[
                          <ExternalLink href="https://www.sorbet.finance/#/pools/0x83bEeFB4cA39af649D03969B442c0E9F4E1732D8">
                            here
                          </ExternalLink>,
                        ]}
                      />
                    </li>
                    <li>
                      <Trans i18nKey="pool.instruction-three" />
                    </li>
                  </ol>,
                  <Trans
                    i18nKey="pool.instruction-detail"
                    components={[
                      <ExternalLink href="https://blog.synthetix.io/weth-snx-incentives-on-l2/">
                        here
                      </ExternalLink>,
                    ]}
                  />,
                ]}
              />
            </Subtitle>
          </StyledInfoContainer>
        </FlexDivCol>
      </Container>
    </>
  );
}

const PoolWrapper = () => {
  const { t } = useTranslation();
  const { isL2, isWalletConnected, walletAddress } = Connector.useContainer();

  if (!isWalletConnected || !walletAddress) {
    return (
      <WrapperContainer>
        <ConnectOrSwitchNetwork />
      </WrapperContainer>
    );
  }
  if (!isL2) {
    const ethereum = window.ethereum;
    return (
      <WrapperContainer>
        <h3>{t('pool.switch-to-l2-text')}</h3>
        {ethereum && ethereum.isMetaMask && (
          <SwitchToL2Btn variant="primary" onClick={() => switchToL2({ ethereum })}>
            {t('pool.switch-to-l2-btn')}
          </SwitchToL2Btn>
        )}
      </WrapperContainer>
    );
  }
  return <Pool />;
};

const Container = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  grid-gap: 1rem;

  ${media.lessThan('medium')`
    display: flex;
    flex-direction: column;
  `}
`;

const StyledLPBalance = styled(StatBox)<{ main?: boolean }>`
  .title {
    color: ${({ theme, main }) => (main ? theme.colors.pink : theme.colors.green)};
  }
`;

const StyledInfoContainer = styled(InfoContainer)`
  max-width: 300px;
  padding: 16px;
`;

const WrapperContainer = styled.div`
  margin-top: 200px;
  display: flex;
  height: 100%;
  align-items: center;
  flex-direction: column;
`;
const SwitchToL2Btn = styled(Button)`
  width: 100px;
`;

export default PoolWrapper;
