import { FC, useMemo, useEffect, useState } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { providers } from 'ethers';
import initSynthetixJS from '@synthetixio/js';

import { formatCryptoCurrency, formatPercent } from 'utils/formatters/number';
import ROUTES from 'constants/routes';
import { EXTERNAL_LINKS } from 'constants/links';
import { OVM_RPC_URL } from 'constants/ovm';

import GridBox, { GridBoxProps } from 'components/GridBox/Gridbox';
import GlowingCircle from 'components/GlowingCircle';
import { GridDiv } from 'styles/common';
import media from 'styles/media';

import useStakingCalculations from 'sections/staking/hooks/useStakingCalculations';
import useEscrowDataQuery from 'hooks/useEscrowDataQueryWrapper';
import { CryptoCurrency } from 'constants/currency';

const Index: FC = () => {
	const [l2AmountSNX, setL2AmountSNX] = useState<number>(0);
	const [l2APR, setL2APR] = useState<number>(0);
	const provider = new providers.JsonRpcProvider(OVM_RPC_URL);
	const synthetixOVM = initSynthetixJS({
		provider,
		useOvm: true,
	});

	const { t } = useTranslation();
	const { debtBalance, transferableCollateral, stakingEscrow } = useStakingCalculations();
	const escrowDataQuery = useEscrowDataQuery();
	const totalBalancePendingMigration = escrowDataQuery?.data?.totalBalancePendingMigration ?? 0;

	useEffect(() => {
		async function getData() {
			const unformattedTotalSupply = await synthetixOVM.contracts.Synthetix.totalSupply();
			const totalSupply = Number(synthetixOVM.utils.formatEther(unformattedTotalSupply));
			const feePeriod = await synthetixOVM.contracts.FeePool.recentFeePeriods('0');
			const rewards = Number(synthetixOVM.utils.formatEther(feePeriod.rewardsToDistribute));

			setL2APR((rewards * 52) / totalSupply);
			setL2AmountSNX(totalSupply);
		}
		getData();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const ACTIONS = useMemo(
		() => ({
			deposit: {
				title: t('layer2.actions.deposit.title'),
				copy: t('layer2.actions.deposit.subtitle'),
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
					amountSNX: formatCryptoCurrency(l2AmountSNX, { currencyKey: CryptoCurrency.SNX }),
					apr: formatPercent(l2APR),
				}),
				copy: t('layer2.actions.apr.subtitle'),
				externalLink: EXTERNAL_LINKS.Synthetix.OEBlog,
			},
		}),
		[t, l2AmountSNX, l2APR]
	);

	const gridItems = useMemo(
		() =>
			debtBalance.isZero()
				? [
						{
							gridLocations: ['col-1', 'col-2', 'row-1', 'row-3'],
							...ACTIONS.apr,
						},
						{
							gridLocations: ['col-2', 'col-3', 'row-1', 'row-2'],
							...ACTIONS.deposit,
							isDisabled: transferableCollateral.isZero(),
						},
						{
							gridLocations: ['col-2', 'col-3', 'row-2', 'row-3'],
							...ACTIONS.migrate,
							isDisabled: totalBalancePendingMigration || stakingEscrow.isZero(),
						},
				  ]
				: [
						{
							gridLocations: ['col-1', 'col-2', 'row-1', 'row-2'],
							...ACTIONS.apr,
						},
						{
							gridLocations: ['col-1', 'col-2', 'row-2', 'row-3'],
							...ACTIONS.burn,
						},
						{
							gridLocations: ['col-2', 'col-3', 'row-1', 'row-2'],
							isDisabled: true,
							...ACTIONS.deposit,
						},
						{
							gridLocations: ['col-2', 'col-3', 'row-2', 'row-3'],
							...ACTIONS.migrate,
						},
				  ],
		// eslint-disable-next-line
		[ACTIONS, debtBalance, stakingEscrow, totalBalancePendingMigration, transferableCollateral]
	) as GridBoxProps[];

	return (
		<PossibleActionsContainer fullHeight={gridItems.length === 2}>
			{gridItems.map((props, index) => (
				<GridBox
					key={`${props.title}-${index}`}
					{...props}
					icon={<GlowingCircle content={<IconHeading>{index + 1}</IconHeading>} />}
				/>
			))}
		</PossibleActionsContainer>
	);
};

const IconHeading = styled.h2`
	color: ${(props) => props.theme.colors.blue};
	font-size: 24px;
	font-family: ${(props) => props.theme.fonts.interSemiBold};
`;

const PossibleActionsContainer = styled(GridDiv)<{ fullHeight: boolean }>`
	margin-top: 30px;
	justify-items: stretch;
	align-items: stretch;
	grid-template-columns: [col-1] 50% [col-2] 50% [col-3];
	grid-template-rows: ${(props) =>
		props.fullHeight ? '[row-1] 100% [row-2] 50% [row-3]' : '[row-1] 50% [row-2] 50% [row-3]'};
	gap: 1rem;
	${media.lessThan('sm')`
		display: flex;
		flex-direction: column;
	`}
`;
export default Index;
