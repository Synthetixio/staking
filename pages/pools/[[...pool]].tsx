import StatBox from 'components/StatBox';
import { BigNumber, utils } from 'ethers';
import Head from 'next/head';
import { useEffect, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useRecoilValue } from 'recoil';
import { useGetUniswapStakingRewardsAPY } from 'sections/pool/useGetUniswapStakingRewardsAPY';
import PoolTabs from 'sections/pool/TabsButton';
import { useGUNILPToken } from 'sections/pool/useGUNILPToken';
import { isL2State, walletAddressState } from 'store/wallet';
import styled from 'styled-components';
import media from 'styled-media-query';
import { ExternalLink, FlexDivCol, LineSpacer, StatsSection } from 'styles/common';
import { WETHSNXLPTokenContract } from 'constants/gelato';
import { InfoContainer, Subtitle } from 'sections/layer2/components/common';
import synthetix, { NetworkId } from '@synthetixio/contracts-interface';

function Pool() {
	const [LPBalance, setLPBalance] = useState(BigNumber.from(0));
	const [rewardsToClaim, setRewardsToClaim] = useState(BigNumber.from(0));
	const [allowanceAmount, setAllowanceAmount] = useState(BigNumber.from(0));
	const [stakedTokens, setStakedTokens] = useState(BigNumber.from(0));
	const { t } = useTranslation();
	const walletAddress = useRecoilValue(walletAddressState);
	const isL2 = useRecoilValue(isL2State);
	const snx = synthetix({ networkId: NetworkId['Mainnet-Ovm'], useOvm: true });
	const { balanceOf, rewards, allowance, approve, stakedTokensBalance } = useGUNILPToken({
		pool: 'weth-snx',
		userAddress: walletAddress,
	});
	const rates = useGetUniswapStakingRewardsAPY({
		stakingRewardsContract: snx.contracts.StakingRewardsSNXWETHUniswapV3,
		tokenContract: WETHSNXLPTokenContract,
	});

	useEffect(() => {
		fetchBalances();
	}, [walletAddress]);

	const fetchBalances = () => {
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
	};

	return (
		<>
			<Head>
				<title>{t('pool.page-title', { pool: 'WETH-SNX' })}</title>
			</Head>
			<StatsSection>
				<StyledLPBalance
					title={t('pool.stats.balance')}
					value={utils.formatUnits(LPBalance, 18).slice(0, 8)}
					size="md"
				/>
				<StyledLPBalance
					title={t('pool.stats.APR')}
					value={rates.data?.apy.toFixed(2) || 20}
					size="lg"
					main
				/>
				<StyledLPBalance
					title={t('pool.stats.rewards')}
					value={utils.formatUnits(rewardsToClaim, 18).slice(0, 8)}
					size="md"
				/>
			</StatsSection>
			<LineSpacer />
			<Container>
				{isL2 && walletAddress ? (
					<>
						<FlexDivCol>
							<PoolTabs
								balance={LPBalance}
								rewardsToClaim={rewardsToClaim}
								allowanceAmount={allowanceAmount}
								stakedTokens={stakedTokens}
								approveFunc={approve}
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
											<ExternalLink href="https://www.sorbet.finance/#/pools/0x83bEeFB4cA39af649D03969B442c0E9F4E1732D8">
												here
											</ExternalLink>,
											<ExternalLink href="https://www.sorbet.finance/#/pools/0x83bEeFB4cA39af649D03969B442c0E9F4E1732D8">
												here
											</ExternalLink>,
										]}
									/>
								</Subtitle>
							</StyledInfoContainer>
						</FlexDivCol>
					</>
				) : (
					<h3 style={{ textAlign: 'end' }}>Please change to Layer 2 and connect a wallet</h3>
				)}
			</Container>
		</>
	);
}

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

export default Pool;
