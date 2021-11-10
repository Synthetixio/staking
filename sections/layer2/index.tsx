import { FC, useMemo } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';

import ROUTES from 'constants/routes';

import GridBox, { GridBoxProps } from 'components/GridBox/Gridbox';
import GlowingCircle from 'components/GlowingCircle';
import { GridDiv } from 'styles/common';
import media from 'styles/media';

import useStakingCalculations from 'sections/staking/hooks/useStakingCalculations';
import useSynthetixQueries from '@synthetixio/queries';
import { EXTERNAL_LINKS } from 'constants/links';

const Index: FC = () => {
	const { t } = useTranslation();
	const { debtBalance, transferableCollateral, stakingEscrow } = useStakingCalculations();

	const { useIsBridgeActiveQuery } = useSynthetixQueries();

	const depositsInactive = !useIsBridgeActiveQuery()?.data?.deposit;

	const ACTIONS = useMemo(
		() => ({
			deposit: {
				title: t('layer2.actions.deposit.title'),
				copy: depositsInactive
					? t('layer2.actions.deposit.bridge-inactive')
					: t('layer2.actions.deposit.subtitle'),
				link: EXTERNAL_LINKS.L2.SynthetixDeposit,
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
		}),
		[t, depositsInactive]
	);

	const gridItems = useMemo(
		() =>
			debtBalance.eq(0)
				? [
						{
							...ACTIONS.deposit,
							isDisabled: transferableCollateral.eq(0) || depositsInactive,
						},
						{
							...ACTIONS.migrate,
							isDisabled: stakingEscrow.eq(0) || depositsInactive,
						},
				  ]
				: [
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
