import { FC, useMemo, useEffect, useState } from 'react';
import { useRecoilValue } from 'recoil';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { getOptimismProvider } from '@synthetixio/providers';
import initSynthetixJS from '@synthetixio/contracts-interface';

import { formatCryptoCurrency, formatPercent } from 'utils/formatters/number';
import ROUTES from 'constants/routes';
import { EXTERNAL_LINKS } from 'constants/links';

import GridBox, { GridBoxProps } from 'components/GridBox/Gridbox';
import GlowingCircle from 'components/GlowingCircle';
import { GridDiv } from 'styles/common';
import media from 'styles/media';

import { networkState } from 'store/wallet';
import useStakingCalculations from 'sections/staking/hooks/useStakingCalculations';
import { CryptoCurrency } from 'constants/currency';
import { DEFAULT_NETWORK_ID } from 'constants/defaults';
import { L1_TO_L2_NETWORK_MAPPER } from '@synthetixio/optimism-networks';
import useSynthetixQueries from '@synthetixio/queries';

const Index: FC = () => {
	const [l2AmountSNX, setL2AmountSNX] = useState<number>(0);
	const [l2APR, setL2APR] = useState<number>(0);
	const { t } = useTranslation();
	const { debtBalance, transferableCollateral, stakingEscrow } = useStakingCalculations();
	const network = useRecoilValue(networkState);

	const { useIsBridgeActiveQuery } = useSynthetixQueries();

	const depositsInactive = !useIsBridgeActiveQuery().data;

	useEffect(() => {
		async function getData() {
			try {
				const provider = getOptimismProvider({
					networkId: network?.id ?? DEFAULT_NETWORK_ID,
				});
				const {
					contracts: { Synthetix, FeePool },
				} = initSynthetixJS({
					// @ts-ignore
					provider,
					networkId: L1_TO_L2_NETWORK_MAPPER[network?.id ?? DEFAULT_NETWORK_ID],
				});

				const [totalSupplyBN, feePeriod] = await Promise.all([
					Synthetix.totalSupply(),
					FeePool.recentFeePeriods('1'),
				]);

				const totalSupply = totalSupplyBN / 1e18;
				const rewards = feePeriod.rewardsToDistribute / 1e18;

				setL2APR((rewards * 52) / totalSupply);
				setL2AmountSNX(totalSupply);
			} catch (e) {
				console.log(e);
				setL2APR(0);
				setL2AmountSNX(0);
			}
		}
		getData();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [network?.id]);

	const ACTIONS = useMemo(
		() => ({
			deposit: {
				title: t('layer2.actions.deposit.title'),
				copy: depositsInactive
					? t('layer2.actions.deposit.bridge-inactive')
					: t('layer2.actions.deposit.subtitle'),
				link: ROUTES.L2.Deposit,
			},
			migrate: {
				title: t('layer2.actions.migrate.title'),
				copy: t('layer2.actions.migrate.subtitle'),
				link: ROUTES.L2.Migrate,
			},
			burn: {
				title: t('layer2.actions.burn.title'),
				copy: t('layer2.actions.burn.subtitle'),
				link: ROUTES.Staking.Burn,
			},
			apr: {
				title: t('layer2.actions.apr.title', {
					amountSNX: formatCryptoCurrency(l2AmountSNX, {
						maxDecimals: 0,
						currencyKey: CryptoCurrency.SNX,
					}),
					apr: formatPercent(l2APR),
				}),
				copy: t('layer2.actions.apr.subtitle'),
				externalLink: EXTERNAL_LINKS.Synthetix.OEBlog,
			},
		}),
		[t, l2AmountSNX, l2APR, depositsInactive]
	);

	const gridItems = useMemo(
		() =>
			debtBalance.eq(0)
				? [
						{
							...ACTIONS.apr,
						},
						{
							...ACTIONS.deposit,
							isDisabled: transferableCollateral.eq(0) || depositsInactive,
						},
						{
							...ACTIONS.migrate,
							isDisabled: stakingEscrow.eq(0),
						},
				  ]
				: [
						{
							...ACTIONS.apr,
						},
						{
							...ACTIONS.burn,
						},
						{
							isDisabled: true,
							...ACTIONS.deposit,
						},
						{
							...ACTIONS.migrate,
						},
				  ],
		// eslint-disable-next-line
		[ACTIONS, debtBalance, stakingEscrow, transferableCollateral, depositsInactive]
	) as GridBoxProps[];

	return (
		<Container>
			{gridItems.map((props, index) => (
				<GridBox
					key={`${props.title}-${index}`}
					{...props}
					icon={<GlowingCircle content={<IconHeading>{index + 1}</IconHeading>} />}
				/>
			))}
		</Container>
	);
};

const IconHeading = styled.h2`
	color: ${(props) => props.theme.colors.blue};
	font-size: 24px;
	font-family: ${(props) => props.theme.fonts.interSemiBold};
`;

const Container = styled(GridDiv)`
	margin-top: 30px;
	justify-items: stretch;
	align-items: stretch;
	grid-template-columns: 1fr 1fr;
	grid-template-rows: 1fr 1fr;
	gap: 1rem;
	${media.lessThan('sm')`
		display: flex;
		flex-direction: column;
	`}
`;
export default Index;
