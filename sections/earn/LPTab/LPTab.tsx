import { FC, useState, useMemo, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

import StructuredTab from 'components/StructuredTab';
import { FlexDivCentered } from 'styles/common';
import { CurrencyKey } from 'constants/currency';
import useExchangeRatesQuery from 'queries/rates/useExchangeRatesQuery';

import StakeTab from './StakeTab';
import { TabContainer, Label } from '../common';
import Approve from './Approve';
import RewardsBox from './RewardsBox';

interface LPTabProps {
	synth: CurrencyKey;
	title: JSX.Element;
	tokenRewards: number;
	icon: () => JSX.Element;
	allowance: number | null;
}

const LPTab: FC<LPTabProps> = ({ icon, synth, title, tokenRewards, allowance }) => {
	const { t } = useTranslation();
	const [showApproveOverlayModal, setShowApproveOverlayModal] = useState<boolean>(false);
	const exchangeRatesQuery = useExchangeRatesQuery();
	const SNXRate = exchangeRatesQuery.data?.SNX ?? 0;

	useEffect(() => {
		if (allowance === 0) {
			setShowApproveOverlayModal(true);
		} else if (allowance == null) {
			// TODO - loading state in this case
		} else if (allowance > 0) {
			setShowApproveOverlayModal(false);
		}
	}, [allowance]);

	const synthAvailable = 10;

	const tabData = useMemo(() => {
		const commonStakeTabProps = {
			icon,
			synth,
			synthAvailable,
		};

		return [
			{
				title: t('earn.actions.stake.title'),
				tabChildren: <StakeTab {...commonStakeTabProps} isStake={true} />,
				blue: true,
				key: 'stake',
			},
			{
				title: t('earn.actions.unstake.title'),
				tabChildren: <StakeTab {...commonStakeTabProps} isStake={false} />,
				blue: false,
				key: 'unstake',
			},
		];
	}, [t, icon, synth, synthAvailable]);

	return (
		<TabContainer>
			<Label>{title}</Label>
			<FlexDivCentered>
				<StructuredTab
					tabHeight={40}
					inverseTabColor={true}
					boxPadding={0}
					boxHeight={242}
					boxWidth={270}
					tabData={tabData}
				/>
				<RewardsBox tokenRewards={tokenRewards} SNXRate={SNXRate} />
			</FlexDivCentered>
			{showApproveOverlayModal ? <Approve synth={synth} /> : null}
		</TabContainer>
	);
};

export default LPTab;
