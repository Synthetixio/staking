import { FC } from 'react';
import { Trans } from 'react-i18next';
import styled from 'styled-components';

import useGetLiquidationData from 'queries/liquidations/useGetLiquidationDataQuery';
import useGetDebtDataQuery from 'queries/debt/useGetDebtDataQuery';

import Banner, { BannerType } from 'sections/shared/Layout/Banner';
import { LOCAL_STORAGE_KEYS } from 'constants/storage';
import { ExternalLink } from 'styles/common';
import { formatShortDateWithTime } from 'utils/formatters/date';
import { wei } from '@synthetixio/wei';

const BannerManager: FC = () => {
	const liquidationData = useGetLiquidationData();
	const debtData = useGetDebtDataQuery();

	const issuanceRatio = debtData?.data?.targetCRatio ?? wei(0);
	const cRatio = debtData?.data?.currentCRatio ?? wei(0);
	const liquidationDeadlineForAccount =
		liquidationData?.data?.liquidationDeadlineForAccount ?? wei(0);

	const issuanceRatioPercentage = issuanceRatio.eq(0) ? 0 : 100 / Number(issuanceRatio);

	if (!liquidationDeadlineForAccount.eq(0) && cRatio.gt(issuanceRatio)) {
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
