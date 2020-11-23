import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import ClaimedTag from 'components/ClaimedTag';
import { TabContainer } from '../common';
import { ErrorMessage, FlexDivRowCentered } from 'styles/common';
import useClaimedStatus from 'sections/hooks/useClaimedStatus';
import BigNumber from 'bignumber.js';
import { formatCryptoCurrency, formatFiatCurrency } from 'utils/formatters/number';
import Button from 'components/Button';
import { SynthetixJS } from '@synthetixio/js';
import synthetix from 'lib/synthetix';
import Connector from 'containers/Connector';
import { getGasEstimateForTransaction } from 'utils/transactions';
import Etherscan from 'containers/Etherscan';
import GasSelector from 'components/GasSelector';
import { normalizedGasPrice, normalizeGasLimit } from 'utils/network';

type ClaimTabProps = {
	tradingRewards: BigNumber;
	stakingRewards: BigNumber;
	totalRewards: BigNumber;
	refetch: Function;
};

const ClaimTab: React.FC<ClaimTabProps> = ({
	tradingRewards,
	stakingRewards,
	totalRewards,
	refetch,
}) => {
	const { t } = useTranslation();
	const claimed = useClaimedStatus();
	const { etherscanInstance } = Etherscan.useContainer();
	const { notify } = Connector.useContainer();
	const [gasLimitEstimate, setGasLimitEstimate] = useState<number | null>(null);
	const [gasPrice, setGasPrice] = useState<number>(0);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const getGasLimitEstimate = async () => {
			if (synthetix && synthetix.js) {
				try {
					const gasEstimate = await getGasEstimateForTransaction(
						[],
						synthetix.js?.contracts.FeePool.estimateGas.claimFees
					);
					setGasLimitEstimate(normalizeGasLimit(Number(gasEstimate)));
				} catch (error) {
					setError(error.message);
					setGasLimitEstimate(null);
				}
			}
		};
		getGasLimitEstimate();
		// eslint-disable-next-line
	}, [synthetix, error]);

	const handleClaim = async () => {
		try {
			const {
				contracts: { FeePool },
			} = synthetix.js as SynthetixJS;
			const tx = await FeePool.claimFees({
				gasPrice: normalizedGasPrice(gasPrice),
				gasLimitEstimate,
			});
			if (notify) {
				const { emitter } = notify.hash(tx.hash);
				const link = etherscanInstance != null ? etherscanInstance.txLink(tx.hash) : undefined;
				emitter.on('txConfirmed', () => {
					refetch();
					return {
						autoDismiss: 0,
						link,
					};
				});

				emitter.on('all', () => {
					return {
						link,
					};
				});
			}
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
			<GasSelector gasLimitEstimate={gasLimitEstimate} setGasPrice={setGasPrice} />
			{error && <ErrorMessage>{error}</ErrorMessage>}
			<StyledButton variant="secondary" onClick={handleClaim} disabled={error != null || claimed}>
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
