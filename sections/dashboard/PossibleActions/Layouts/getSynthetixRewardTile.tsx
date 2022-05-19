import Wei from '@synthetixio/wei';
import { Svg } from 'react-optimized-image';
import { TFunction } from 'i18next';

import { GlowingCircle } from 'styles/common';
import ClaimIcon from 'assets/svg/app/claim.svg';
import ROUTES from 'constants/routes';

const getSynthetixRewardTile = (
	t: TFunction,
	stakingAndTradingRewards: Wei,
	liquidationRewards: Wei,
	walletMissingPermissionToClaim = false
) => {
	const haveLiquidationRewards = !liquidationRewards.eq(0);
	const noStakingRewardsAndHaveLiquidationRewards =
		stakingAndTradingRewards.eq(0) && haveLiquidationRewards;
	const missingPermissionAndHaveLiquidationRewards =
		walletMissingPermissionToClaim && haveLiquidationRewards;

	if (noStakingRewardsAndHaveLiquidationRewards || missingPermissionAndHaveLiquidationRewards) {
		return {
			icon: (
				<GlowingCircle variant="green" size="md">
					<Svg src={ClaimIcon} width="32" viewBox={`0 0 ${ClaimIcon.width} ${ClaimIcon.height}`} />
				</GlowingCircle>
			),
			title: t('dashboard.actions.claim.title'),
			copy: t('dashboard.actions.claim.copy-liquidation'),
			tooltip: undefined,
			link: ROUTES.Earn.LIQUIDATION_REWARDS,
			isDisabled: false,
		};
	}
	// If we have staking rewards link to Claim
	// If not, disable link and add show tooltip
	return {
		icon: (
			<GlowingCircle variant="green" size="md">
				<Svg src={ClaimIcon} width="32" viewBox={`0 0 ${ClaimIcon.width} ${ClaimIcon.height}`} />
			</GlowingCircle>
		),
		title: t('dashboard.actions.claim.title'),
		copy: t('dashboard.actions.claim.copy'),
		tooltip: stakingAndTradingRewards.eq(0) ? t('dashboard.actions.claim.tooltip') : undefined,
		link: ROUTES.Earn.Claim,
		isDisabled: stakingAndTradingRewards.eq(0) || walletMissingPermissionToClaim,
	};
};
export default getSynthetixRewardTile;
