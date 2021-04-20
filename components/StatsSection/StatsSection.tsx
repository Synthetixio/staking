import { FC, useMemo, useState } from 'react';
import { Svg } from 'react-optimized-image';
import styled from 'styled-components';

import { toBigNumber } from 'utils/formatters/number';

import useSNX24hrPricesQuery from 'queries/rates/useSNX24hrPricesQuery';
import useSynthsBalancesQuery from 'queries/walletBalances/useSynthsBalancesQuery';
import useCryptoBalances from 'hooks/useCryptoBalances';

import { CryptoCurrency, Synths } from 'constants/currency';
import { MobileOrTabletView } from 'components/Media';

import { FlexDivRowCentered } from 'styles/common';

import PriceItem from 'sections/shared/Layout/Stats/PriceItem';
import PeriodBarStats from 'sections/shared/Layout/Stats/PeriodBarStats';
import BalanceItem from 'sections/shared/Layout/Stats/BalanceItem';
import CRatioBarStats from 'sections/shared/Layout/Stats/CRatioBarStats';

import CollapseIcon from 'assets/svg/app/chevron-collapse.svg';
import ExpandIcon from 'assets/svg/app/chevron-expand.svg';

const StatsSection: FC = ({ children }) => {
	const SNX24hrPricesQuery = useSNX24hrPricesQuery();
	const cryptoBalances = useCryptoBalances();
	const synthsBalancesQuery = useSynthsBalancesQuery();
	const [mobileStatsSectionIsOpen, setMobileStatsSectionIsOpen] = useState(true);

	const snxBalance =
		cryptoBalances?.balances?.find((balance) => balance.currencyKey === CryptoCurrency.SNX)
			?.balance ?? toBigNumber(0);

	const sUSDBalance =
		synthsBalancesQuery?.data?.balancesMap[Synths.sUSD]?.balance ?? toBigNumber(0);

	const snxPriceChartData = useMemo(() => {
		return (SNX24hrPricesQuery?.data ?? [])
			.map((dataPoint) => ({ value: dataPoint.averagePrice }))
			.reverse();
	}, [SNX24hrPricesQuery?.data]);

	const toggleMobileStatsSection = () =>
		setMobileStatsSectionIsOpen((mobileStatsSectionIsOpen) => !mobileStatsSectionIsOpen);

	return (
		<>
			<ToggleMobileStatsSection onClick={toggleMobileStatsSection}>
				{mobileStatsSectionIsOpen ? <Svg src={CollapseIcon} /> : <Svg src={ExpandIcon} />}
			</ToggleMobileStatsSection>
			<StatsContainer>{children}</StatsContainer>
			<MobileOrTabletView>
				<MobileOrTabletViewInner isVisible={mobileStatsSectionIsOpen}>
					<TopContainer>
						<CRatioBarStats />
						<PeriodBarStats />
					</TopContainer>
					<BottomContainer>
						<PriceItem currencyKey={CryptoCurrency.SNX} data={snxPriceChartData} />
						<BalanceItem amount={snxBalance} currencyKey={CryptoCurrency.SNX} />
						<BalanceItem amount={sUSDBalance} currencyKey={Synths.sUSD} />
					</BottomContainer>
				</MobileOrTabletViewInner>
			</MobileOrTabletView>
		</>
	);
};

const StatsContainer = styled(FlexDivRowCentered)`
	width: 100%;
	justify-content: center;
	margin: 0 auto;
`;

const ToggleMobileStatsSection = styled.div`
	display: flex;
	justify-content: flex-end;
	position: relative;
	top: 50px;
`;

const MobileOrTabletViewInner = styled.div<{ isVisible: boolean }>`
	transition: height 0.25s ease-in-out;
	overflow-y: hidden;
	height: ${(props) => (props.isVisible ? '180px' : '0')};
`;

const TopContainer = styled.div`
	display: grid;
	grid-template-columns: 1fr 1fr;
	grid-gap: 1rem;

	& > div:nth-child(2) {
		margin-top: 1px;
	}
`;

const BottomContainer = styled.div`
	display: grid;
	grid-template-columns: 1fr 1fr 1fr;
	grid-gap: 1rem;

	& > div:nth-child(2) {
		align-items: center;
		text-align: center;
	}

	& > div:nth-child(3) {
		align-items: flex-end;
		text-align: right;
	}
`;

export default StatsSection;
