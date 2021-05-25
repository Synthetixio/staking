import { FC } from 'react';
import { Trans } from 'react-i18next';
import styled from 'styled-components';
import { utils as ethersUtils } from 'ethers';

import useGetLiquidationData from 'queries/liquidations/useGetLiquidationDataQuery';

import Banner, { BannerType } from 'sections/shared/Layout/Banner';
import { LOCAL_STORAGE_KEYS } from 'constants/storage';
import { ExternalLink } from 'styles/common';
import { zeroBN } from 'utils/formatters/number';
import { formatShortDateWithTime } from 'utils/formatters/date';

const BannerManager: FC = () => {
	const liquidationData = useGetLiquidationData();

	const liquidationRatio = liquidationData?.data?.liquidationRatio ?? zeroBN;
	const liquidationDeadlineForAccount =
		liquidationData?.data?.liquidationDeadlineForAccount ?? zeroBN;

	const liquidationRatioPercentage = liquidationRatio.isZero()
		? 0
		: 100 / Number(ethersUtils.formatEther(liquidationRatio.toString()));

	if (!liquidationDeadlineForAccount.isZero()) {
		return (
			<Banner
				type={BannerType.WARNING}
				message={
					<Trans
						i18nKey={'user-menu.banner.liquidation-warning'}
						values={{
							liquidationRatio: liquidationRatioPercentage,
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
