import { FC } from 'react';
import { Trans } from 'react-i18next';
import styled from 'styled-components';
import { useRecoilValue } from 'recoil';

import useGetLiquidationData from 'queries/liquidations/useGetLiquidationDataQuery';
import useGetDebtDataQuery from 'queries/debt/useGetDebtDataQuery';

import Banner, { BannerType } from 'sections/shared/Layout/Banner';
import { LOCAL_STORAGE_KEYS } from 'constants/storage';
import { ExternalLink } from 'styles/common';
import { zeroBN } from 'utils/formatters/number';
import { formatShortDateWithTime } from 'utils/formatters/date';
import { isL2State } from 'store/wallet';
import useIsElectionActive from 'sections/gov/hooks/useIsElectionActive';

const BannerManager: FC = () => {
	const liquidationData = useGetLiquidationData();
	const debtData = useGetDebtDataQuery();
	const electionActive = useIsElectionActive();
	const isL2 = useRecoilValue(isL2State);

	const issuanceRatio = debtData?.data?.targetCRatio ?? zeroBN;
	const cRatio = debtData?.data?.currentCRatio ?? zeroBN;
	const liquidationDeadlineForAccount =
		liquidationData?.data?.liquidationDeadlineForAccount ?? zeroBN;

	const issuanceRatioPercentage = issuanceRatio.isZero() ? 0 : 100 / Number(issuanceRatio);

	if (!liquidationDeadlineForAccount.isZero() && cRatio.isGreaterThan(issuanceRatio)) {
		return (
			<Banner
				type={BannerType.WARNING}
				message={
					<Trans
						i18nKey={'user-menu.banner.liquidation-warning'}
						values={{
							liquidationRatio: issuanceRatioPercentage,
							liquidationDeadline: formatShortDateWithTime(
								Number(liquidationDeadlineForAccount.toString()) * 1000
							),
						}}
						components={[
							<Strong />,
							<Strong />,
							<StyledExternalLink href="https://blog.synthetix.io/liquidation-faqs" />,
						]}
					/>
				}
			/>
		);
	} else if (!isL2 && electionActive) {
		return (
			<Banner
				type={BannerType.WARNING}
				message={
					<Trans
						i18nKey={'user-menu.banner.election-info'}
						components={[<StyledExternalLink href="https://staking.synthetix.io/gov" />]}
					/>
				}
			/>
		);
	} else {
		return (
			<Banner
				type={BannerType.ATTENTION}
				localStorageKey={LOCAL_STORAGE_KEYS.WARNING_URL_BANNER_VISIBLE}
				message={
					<Trans
						i18nKey={'user-menu.banner.url-warning'}
						components={[<StyledExternalLink href="https://staking.synthetix.io" />]}
					/>
				}
			/>
		);
	}
};

const Strong = styled.strong`
	font-family: ${(props) => props.theme.fonts.condensedBold};
`;

const StyledExternalLink = styled(ExternalLink)`
	color: ${(props) => props.theme.colors.white};
	text-decoration: underline;
	&:hover {
		text-decoration: underline;
	}
`;

export default BannerManager;
