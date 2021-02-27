import React from 'react';
import { useTranslation, Trans } from 'react-i18next';
import { ethers } from 'ethers';
import { useRecoilValue } from 'recoil';

import { walletAddressState } from 'store/wallet';
import styled from 'styled-components';
import { NoTextTransform } from 'styles/common';
import Connector from 'containers/Connector';
import Button from 'components/Button';
import synthetix from 'lib/synthetix';
import { tx } from 'utils/transactions';
import { toFixed, toBig, formatUnits } from 'utils/formatters/big-number';
import { sleep } from 'utils/promise';
import { useLoans } from 'sections/loans/contexts/loans';

const InfoBox: React.FC = () => {
	const { t } = useTranslation();
	const address = useRecoilValue(walletAddressState);
	const { provider } = Connector.useContainer();
	const { pendingWithdrawals, reloadPendingWithdrawals, ethLoanContract } = useLoans();
	const [isClaimingPendingWithdrawals, setIsClaimingPendingWithdrawals] = React.useState(false);

	const [borrows, setBorrows] = React.useState<Array<any>>([]);
	const borrowsOpenInterest = React.useMemo(
		() => borrows.reduce((sum, stat) => sum.add(stat.openInterest), toBig('0')),
		[borrows]
	);

	const claimPendingWithdrawals = async () => {
		if (!ethLoanContract) return;
		try {
			setIsClaimingPendingWithdrawals(true);
			const pw = await ethLoanContract.pendingWithdrawals(address);
			await tx(() => [ethLoanContract, 'claim', [pw]]);
			await sleep(1000);

			await reloadPendingWithdrawals();
		} catch {
		} finally {
			setIsClaimingPendingWithdrawals(false);
		}
	};

	React.useEffect(() => {
		if (!provider) {
			return;
		}

		const {
			contracts: {
				ExchangeRates: exchangeRatesContract,
				CollateralManager: collateralManagerContract,
			},
		} = synthetix.js!;

		let isMounted = true;
		const unsubs: Array<Function> = [() => (isMounted = false)];

		const getBorrowStats = async (currency: string) => {
			const [openInterest, [assetUSDPrice]] = await Promise.all([
				collateralManagerContract.long(ethers.utils.formatBytes32String(currency)),
				exchangeRatesContract.rateAndInvalid(ethers.utils.formatBytes32String(currency)),
			]);
			const openInterestUSD = toBig(openInterest).div(1e18).mul(toBig(assetUSDPrice).div(1e18));
			return {
				currency,
				openInterest: openInterestUSD,
			};
		};

		const loadBorrowsStats = () => Promise.all(['sBTC', 'sETH', 'sUSD'].map(getBorrowStats));

		const load = async () => {
			try {
				const borrows = await loadBorrowsStats();
				if (isMounted) {
					setBorrows(borrows);
				}
			} catch (e) {
				console.error(e);
			}
		};

		const subscribe = () => {
			const newBlockEvent = 'block';
			provider!.on(newBlockEvent, load);
			unsubs.push(() => provider!.off(newBlockEvent, load));
		};

		load();
		subscribe();
		return () => {
			unsubs.forEach((unsub) => unsub());
		};
	}, [provider]);

	return (
		<Root>
			<Container>
				<ContainerHeader>
					<Title>{t('loans.info.title')}</Title>
					<Subtitle>
						{t('loans.info.subtitle')}{' '}
						<a href="/" target="_blank">
							{t('loans.info.learn-more')}
						</a>
					</Subtitle>
				</ContainerHeader>
			</Container>

			<Container>
				<ContainerHeader>
					<Title>{t('loans.pending-withdrawals.title')}</Title>
					<Subtitle>
						{pendingWithdrawals.isZero() ? (
							<div>{t('loans.pending-withdrawals.empty')}</div>
						) : (
							<div>
								<Trans
									i18nKey={'loans.pending-withdrawals.subtitle'}
									values={{ pendingWithdrawals: formatUnits(pendingWithdrawals, 18) }}
									components={[<NoTextTransform />]}
								/>{' '}
								<ClaimButton
									variant="text"
									size="sm"
									onClick={claimPendingWithdrawals}
									disabled={isClaimingPendingWithdrawals}
								>
									{t(
										`loans.pending-withdrawals.${
											isClaimingPendingWithdrawals ? 'claiming' : 'claim'
										}`
									)}
								</ClaimButton>
							</div>
						)}
					</Subtitle>
				</ContainerHeader>
			</Container>

			<Container>
				<ContainerHeader>
					<Title>{t('loans.stats.title')}</Title>
				</ContainerHeader>
				<StatsGrid>
					<StatsHeader>
						<div>{t('loans.stats.asset')}</div>
					</StatsHeader>
					<StatsHeader>
						<div>{t('loans.stats.open-interest')}</div>
					</StatsHeader>
					{borrows.map((stat) => (
						<React.Fragment key={stat.currency}>
							<StatsCol>
								<div>{stat.currency}</div>
							</StatsCol>
							<StatsCol>
								<div>${toFixed(stat.openInterest, 1, 2)}</div>
							</StatsCol>
						</React.Fragment>
					))}
					<TotalColHeading>
						<div>{t('loans.stats.total')}</div>
					</TotalColHeading>
					<StatsCol>
						<div>${toFixed(borrowsOpenInterest, 1, 2)}</div>
					</StatsCol>
				</StatsGrid>
			</Container>
		</Root>
	);
};

export default InfoBox;

//

export const Root = styled.div`
	& > div {
		margin-bottom: 32px;
	}

	a,
	a:visited {
		color: ${(props) => props.theme.colors.blue};
		text-decoration: none;
	}
`;

export const Container = styled.div`
	background: ${(props) => props.theme.colors.navy};
`;

export const ContainerHeader = styled.div`
	padding: 16px;
`;

export const Title = styled.div`
	font-family: ${(props) => props.theme.fonts.extended};
	color: ${(props) => props.theme.colors.white};
	font-size: 14px;
`;
export const Subtitle = styled.div`
	font-family: ${(props) => props.theme.fonts.regular};
	color: ${(props) => props.theme.colors.gray};
	font-size: 14px;
	margin-top: 12px;
`;

export const StatsGrid = styled.div`
	display: grid;
	grid-template-rows: 1fr 1fr 1fr 1fr 1fr;
	grid-template-columns: 1fr 1fr;
	font-size: 14px;
	padding: 0 0 16px 0;
`;

export const StatsRow = styled.div``;

export const StatsHeader = styled.div`
	color: ${(props) => props.theme.colors.gray};
	border-top: 1px solid ${(props) => props.theme.colors.grayBlue};
	border-bottom: 1px solid ${(props) => props.theme.colors.grayBlue};
	font-family: ${(props) => props.theme.fonts.interBold};

	&:nth-child(even) {
		text-align: right;
	}

	div {
		padding: 8px 16px;
	}
`;

export const StatsCol = styled.div`
	&:nth-child(odd) {
		margin-left: 16px;
	}

	&:nth-child(even) {
		text-align: right;
		margin-right: 16px;
	}

	div {
		padding: 8px 0;
		border-bottom: 1px solid ${(props) => props.theme.colors.grayBlue};
	}
`;

export const TotalColHeading = styled(StatsCol)`
	color: ${(props) => props.theme.colors.gray};
`;

export const ClaimButton = styled(Button)`
	color: ${(props) => props.theme.colors.blue};
	cursor: pointer;
	margin-left: 5px;
	padding: 0;

	&,
	&:disabled {
		background: transparent;
	}
`;
