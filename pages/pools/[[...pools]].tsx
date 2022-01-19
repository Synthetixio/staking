import StatBox from 'components/StatBox';
import { BigNumber, utils, Contract } from 'ethers';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useRecoilValue } from 'recoil';
import PoolTabs from 'sections/Pool/TabsButton';
import useGetUniswapStakingRewardsAPY from 'sections/Pool/useGetUniswapStakingRewardsAPY';
import useGUNILPToken, { GUNILPTokenProps } from 'sections/Pool/useGUNILPToken';
import { isL2State, walletAddressState } from 'store/wallet';
import styled from 'styled-components';
import media from 'styled-media-query';
import { FlexDivCol, LineSpacer, StatsSection } from 'styles/common';
// TODO @MF delete when Jacko merged his PR
import abi from './abi.json';

const stakingRewardsContractWETHSNX = new Contract(
	'0xfD49C7EE330fE060ca66feE33d49206eB96F146D',
	abi
);
const ERC20HumanReadableABI = [
	'function balanceOf(address _owner) public view returns (uint256 balance)',
	'function approve(address _spender, uint256 _value) public returns (bool success)',
	'function allowance(address _owner, address _spender) public view returns (uint256 remaining)',
];
const SUSDDAILPTokenContract = new Contract(
	'0x83bEeFB4cA39af649D03969B442c0E9F4E1732D8',
	ERC20HumanReadableABI
);

export default function Pool() {
	const [LPBalance, setLPBalance] = useState(BigNumber.from(0));
	const [rewardsToClaim, setRewardsToClaim] = useState(BigNumber.from(0));
	const [allowanceAmount, setAllowanceAmount] = useState(BigNumber.from(0));
	const { t } = useTranslation();
	const router = useRouter();
	const walletAddress = useRecoilValue(walletAddressState);
	const isL2 = useRecoilValue(isL2State);
	const splitRoute = router.asPath.split('/');
	const pool = splitRoute[splitRoute.length - 1] as GUNILPTokenProps['pool'];
	const { balanceOf, rewards, allowance, approve } = useGUNILPToken({
		pool,
		userAddress: walletAddress,
	});
	const res = useGetUniswapStakingRewardsAPY({
		stakingRewardsContract: stakingRewardsContractWETHSNX,
		tokenContract: SUSDDAILPTokenContract,
	});

	useEffect(() => {
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
		}
	}, [walletAddress]);

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
				<StyledLPBalance title={t('pool.stats.APR')} value={res.data?.apy || 0} size="lg" main />
				<StyledLPBalance
					title={t('pool.stats.rewards')}
					value={utils.formatUnits(rewardsToClaim, 18).slice(0, 8)}
					size="md"
				/>
			</StatsSection>
			<LineSpacer />
			<Container>
				<FlexDivCol>
					{isL2 ? (
						<PoolTabs
							balance={LPBalance}
							rewardsToClaim={rewardsToClaim}
							allowanceAmount={allowanceAmount}
							approveFunc={approve}
						/>
					) : (
						<h3>Please change to Layer 2</h3>
					)}
				</FlexDivCol>
				<FlexDivCol>
					<div>some info</div>
				</FlexDivCol>
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
