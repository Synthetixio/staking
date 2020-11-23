import { FC, useMemo } from 'react';
import { Svg } from 'react-optimized-image';
import { useTranslation } from 'react-i18next';

import ROUTES from 'constants/routes';

import Stake from 'assets/svg/app/stake.svg';
import Trade from 'assets/svg/app/trade.svg';

import GridBox, { GridBoxProps } from './GridBox';
import WizardGridBox from './WizardGridBox';

const WelcomeLayout: FC = () => {
	const { t } = useTranslation();

	const gridItems: GridBoxProps[] = useMemo(
		() => [
			{
				gridLocations: ['col-3', 'col-5', 'row-1', 'row-2'],
				icon: () => <Svg src={Stake} />,
				title: t('dashboard.actions.stake.title'),
				copy: t('dashboard.actions.stake.copy'),
				link: ROUTES.Staking.Home,
			},
			{
				gridLocations: ['col-3', 'col-4', 'row-2', 'row-3'],
				icon: () => <Svg src={Stake} />,
				title: t('dashboard.actions.learn.title'),
				copy: t('dashboard.actions.learn.copy'),
				externalLink: 'https://blog.synthetix.io/',
			},
			{
				gridLocations: ['col-4', 'col-5', 'row-2', 'row-3'],
				icon: () => <Svg src={Trade} />,
				title: t('dashboard.actions.trade.title'),
				copy: t('dashboard.actions.trade.copy'),
				externalLink: 'http://kwenta.io/',
			},
		],
		[t]
	);
	return (
		<>
			<WizardGridBox gridLocations={['col-1', 'col-3', 'row-1', 'row-3']} />
			{gridItems.map((props, index) => (
				<GridBox key={`${props.title}-${index}`} {...props} />
			))}
		</>
	);
};

export default WelcomeLayout;
