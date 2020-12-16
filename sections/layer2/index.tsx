import { FC, useMemo } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';

import ROUTES from 'constants/routes';

import GridBox, { GridBoxProps } from 'components/GridBox/Gridbox';
import GlowingCircle from 'components/GlowingCircle';
import { GridDiv } from 'styles/common';
import media from 'styles/media';

import useStakingCalculations from 'sections/staking/hooks/useStakingCalculations';

const Index: FC = () => {
	const { t } = useTranslation();
	const { debtBalance } = useStakingCalculations();

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
		}),
		[t]
	);

	const gridItems = useMemo(
		() =>
			debtBalance.isZero()
				? [
						{
							gridLocations: ['col-1', 'col-2', 'row-1', 'row-3'],
							...ACTIONS.deposit,
						},
						{
							gridLocations: ['col-2', 'col-3', 'row-1', 'row-3'],
							...ACTIONS.migrate,
						},
				  ]
				: [
						{
							gridLocations: ['col-1', 'col-2', 'row-1', 'row-3'],
							...ACTIONS.burn,
						},
						{
							gridLocations: ['col-2', 'col-3', 'row-1', 'row-2'],
							...ACTIONS.deposit,
						},
						{
							gridLocations: ['col-2', 'col-3', 'row-2', 'row-3'],
							...ACTIONS.migrate,
						},
				  ],
		[ACTIONS, debtBalance]
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
