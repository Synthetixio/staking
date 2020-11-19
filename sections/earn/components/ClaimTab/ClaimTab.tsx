import React from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import ClaimedTag from 'components/ClaimedTag';
import { TabContainer } from '../common';
import { FlexDivRowCentered } from 'styles/common';
import useClaimedStatus from 'sections/hooks/useClaimedStatus';
import BigNumber from 'bignumber.js';
import { formatCryptoCurrency, formatFiatCurrency } from 'utils/formatters/number';
import Button from 'components/Button';
import { SynthetixJS } from '@synthetixio/js';
import synthetix from 'lib/synthetix';
import Connector from 'containers/Connector';
import { useRecoilValue } from 'recoil';
// import { customGasPriceState, gasSpeedState } from 'store/wallet';

type ClaimTabProps = {
	tradingRewards: BigNumber;
	stakingRewards: BigNumber;
	totalRewards: BigNumber;
};

const ClaimTab: React.FC<ClaimTabProps> = ({ tradingRewards, stakingRewards, totalRewards }) => {
	const { t } = useTranslation();
	const claimed = useClaimedStatus();
	const { notify } = Connector.useContainer();

	const handleClaim = async () => {
		try {
			const {
				contracts: { FeePool },
			} = synthetix.js as SynthetixJS;

			const transaction = await FeePool.claimFees({});

			// Implement notify

			// Refetch fee pool query

			// if (notify && transaction) {
			// 	// Do refetch all relevant queries
			// 	const refetch = () => {
			// 		fetchBalancesRequest();
			// 		fetchDebtStatusRequest();
			// 		fetchEscrowRequest();
			// 	};
			// 	const message = `Claimed rewards`;
			// 	setTransactionInfo({ transactionHash: transaction.hash });
			// 	notifyHandler(notify, transaction.hash, networkId, refetch, message);

			// 	handleNext(2);
			// }
		} catch (e) {
			console.log(e);
		}
	};

	return (
		<TabContainer>
			<Label>{t('earn.actions.claim.exchange-rewards')}</Label>
			<ValueBox>
				<Value isClaimed={claimed}>{formatCryptoCurrency(tradingRewards)} sUSD</Value>
				<StyledClaimedTag />
			</ValueBox>
			<Label>{t('earn.actions.claim.staking-rewards')}</Label>
			<ValueBox>
				<Value isClaimed={claimed}>{formatCryptoCurrency(stakingRewards)} SNX</Value>
				<StyledClaimedTag />
			</ValueBox>
			<StyledButton variant="secondary" onClick={handleClaim} disabled={claimed}>
				{claimed
					? t('earn.actions.claim.claimed-button')
					: t('earn.actions.claim.claim-button', {
							totalValue: formatFiatCurrency(totalRewards, {
								sign: '$',
							}),
					  })}
			</StyledButton>
		</TabContainer>
	);
};

const Label = styled.p`
	font-family: ${(props) => props.theme.fonts.condensedBold};
	color: ${(props) => props.theme.colors.white};
	text-transform: uppercase;
	font-size: 12px;
`;
const Value = styled.p<{ isClaimed: boolean }>`
	font-family: ${(props) => props.theme.fonts.condensedBold};
	font-size: 26px;
`;
const ValueBox = styled(FlexDivRowCentered)``;
const StyledClaimedTag = styled(ClaimedTag)`
	font-size: 14px;
	margin-left: 8px;
`;
const StyledButton = styled(Button)`
	font-size: 14px;
	font-family: ${(props) => props.theme.fonts.condensedMedium};
	width: 100%;
	text-transform: uppercase;
`;

export default ClaimTab;
