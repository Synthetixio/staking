import StatBox from 'components/StatBox';
import { BigNumber, utils, Contract } from 'ethers';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useRecoilValue } from 'recoil';
import useGetUniswapStakingRewardsAPY from 'sections/pool/hooks/useGetUniswapStakingRewardsAPY';
import PoolTabs from 'sections/pool/TabsButton';
import useGUNILPToken, { GUNILPTokenProps } from 'sections/pool/hooks/useGUNILPToken';
import { isL2State, walletAddressState } from 'store/wallet';
import styled from 'styled-components';
import media from 'styled-media-query';
import { ExternalLink, FlexDivCol, LineSpacer, StatsSection } from 'styles/common';
import { stakingRewardsContractWETHSNX, WETHSNXLPTokenContract } from 'constants/gelato';
import { InfoContainer, Subtitle } from 'sections/layer2/components/common';

export default function Pool() {
	const [LPBalance, setLPBalance] = useState(BigNumber.from(0));
	const [rewardsToClaim, setRewardsToClaim] = useState(BigNumber.from(0));
	const [allowanceAmount, setAllowanceAmount] = useState(BigNumber.from(0));
	const [stakedTokens, setStakedTokens] = useState(BigNumber.from(0));
	const { t } = useTranslation();
	const router = useRouter();
	const walletAddress = useRecoilValue(walletAddressState);
	const isL2 = useRecoilValue(isL2State);
	const splitRoute = router.asPath.split('/');
	const pool = splitRoute[splitRoute.length - 1] as GUNILPTokenProps['pool'];
	const { balanceOf, rewards, allowance, approve, stakedTokensBalance } = useGUNILPToken({
		pool,
		userAddress: walletAddress,
	});
	const res = useGetUniswapStakingRewardsAPY({
		stakingRewardsContract: stakingRewardsContractWETHSNX,
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
				<title>{t('pool.page-title', { pool: pool.toUpperCase() })}</title>
			</Head>
			<StatsSection>
				<StyledLPBalance
					title={t('pool.stats.balance')}
					value={utils.formatUnits(LPBalance, 18).slice(0, 8)}
					size="md"
				/>
				<StyledLPBalance
					title={t('pool.stats.APR')}
					value={res.data?.apy.toString() || 0}
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
				{isL2 || walletAddress ? (
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
									{t('pool.info')}
									<ExternalLink href="https://www.sorbet.finance/#/pools/0x83bEeFB4cA39af649D03969B442c0E9F4E1732D8">
										LINK
									</ExternalLink>
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
