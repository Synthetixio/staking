import Head from 'next/head';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { MintBurnBox } from 'sections/staking';
import { FlexDivCol, FlexDivRow } from 'styles/common';
import { InfoBox } from 'sections/staking/InfoBox';
import useGetDebtDataQuery from 'queries/debt/useGetDebtDataQuery';
import useCurrencyRatesQuery from 'queries/rates/useCurrencyRatesQuery';

const StakingPage = () => {
	const { t } = useTranslation();

	const currencyRatesQuery = useCurrencyRatesQuery(['SNX']);
	const debtDataQuery = useGetDebtDataQuery();
	const currencyRates = currencyRatesQuery.data ?? null;
	const debtData = debtDataQuery?.data ?? null;
	const collateral = debtData?.collateral ?? 0;
	const issuanceRatio = debtData?.targetCRatio ?? 0;
	const currentCRatio = debtData?.currentCRatio ?? 0;
	const snxPrice = currencyRates?.SNX ?? 0;
	const issuableSynths = debtData?.issuableSynths ?? 0;
	const transferableSNX = debtData?.transferable ?? 0;
	const debtBalance = debtData?.debtBalance ?? 0;
	const stakedSNX = collateral * Math.min(1, currentCRatio / issuanceRatio);

	const lockedSNX = collateral - transferableSNX;

	const unstakedSNX = collateral - stakedSNX;

	return (
		<>
			<Head>
				<title>{t('staking.page-title')}</title>
			</Head>
			<Row>
				<Column>
					<InfoBox
						unstakedCollateral={unstakedSNX}
						stakedCollateral={stakedSNX}
						transferableCollateral={transferableSNX}
						currentCRatio={currentCRatio}
						debtBalance={debtBalance}
						lockedCollateral={lockedSNX}
					/>
				</Column>
				<Column>
					<MintBurnBox
						maxIssuabledSynthAmount={issuableSynths}
						snxPrice={snxPrice}
						issuanceRatio={issuanceRatio}
					/>
				</Column>
			</Row>
		</>
	);
};

const Row = styled(FlexDivRow)`
	margin: 20px 0px;
`;

const Column = styled(FlexDivCol)`
	width: 50%;
`;

export default StakingPage;
