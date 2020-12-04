import React, { useEffect, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { Svg } from 'react-optimized-image';

import { ErrorMessage, FlexDiv, FlexDivCentered, FlexDivColCentered, linkCSS } from 'styles/common';
import useClaimedStatus from 'sections/hooks/useClaimedStatus';
import BigNumber from 'bignumber.js';
import { formatCurrency, formatFiatCurrency } from 'utils/formatters/number';
import Button from 'components/Button';
import { SynthetixJS } from '@synthetixio/js';
import synthetix from 'lib/synthetix';
import Connector from 'containers/Connector';
import { getGasEstimateForTransaction } from 'utils/transactions';
import Etherscan from 'containers/Etherscan';
import GasSelector from 'components/GasSelector';
import { normalizedGasPrice, normalizeGasLimit } from 'utils/network';
import { CRYPTO_CURRENCY_MAP, SYNTHS_MAP } from 'constants/currency';
import snxSVG from 'assets/svg/incentives/pool-snx.svg';

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
			<Label>
				<Trans i18nKey="earn.incentives.options.snx.description" components={[<StyledLink />]} />
			</Label>

			<InnerContainer>
				<ValueBoxWrapper>
					<ValueBox>
						<Svg src={snxSVG} />
						<Value>
							{formatCurrency(SYNTHS_MAP.sUSD, tradingRewards, {
								currencyKey: SYNTHS_MAP.sUSD,
								decimals: 2,
							})}
						</Value>
						<Subtext>{t('earn.incentives.options.snx.trading-rewards')}</Subtext>
					</ValueBox>
					<ValueBox>
						<Svg src={snxSVG} />
						<Value>
							{formatCurrency(CRYPTO_CURRENCY_MAP.SNX, stakingRewards, {
								currencyKey: CRYPTO_CURRENCY_MAP.SNX,
							})}
						</Value>
						<Subtext>{t('earn.incentives.options.snx.staking-rewards')}</Subtext>
					</ValueBox>
				</ValueBoxWrapper>
				<TotalValueWrapper>
					<Subtext>{t('earn.incentives.options.snx.total-value')}</Subtext>
					<Value>$1000</Value>
				</TotalValueWrapper>
				{error && <ErrorMessage>{error}</ErrorMessage>}
				<StyledButton variant="primary" onClick={handleClaim} disabled={error != null || claimed}>
					{claimed
						? t('earn.actions.claim.claimed-button')
						: t('earn.actions.claim.claim-button', {
								totalValue: formatFiatCurrency(totalRewards, {
									sign: '$',
								}),
						  })}
				</StyledButton>
				<GasSelector gasLimitEstimate={gasLimitEstimate} setGasPrice={setGasPrice} />
			</InnerContainer>
		</TabContainer>
	);
};

const InnerContainer = styled(FlexDivColCentered)`
	width: 90%;
	margin: 15px auto;
	padding: 15px;
	backgroundcolor: ${(props) => props.theme.colors.mutedBrightBlue};
	border: 1px solid ${(props) => props.theme.colors.brightPink};
	border-radius: 4px;
`;

const ValueBoxWrapper = styled(FlexDivCentered)`
	justify-content: space-around;
`;

const StyledLink = styled.span`
	${linkCSS}
	color: ${(props) => props.theme.colors.brightBlue};
`;

const TotalValueWrapper = styled(FlexDiv)`
	justify-content: space-between;
	height: 30px;
	align-items: center;
	border-bottom: 1px solid ${(props) => props.theme.colors.gray};
	width: 80%;
	margin-top: 15px;
`;

const Label = styled.p`
	width: 90%;
	margin: 0 auto;
	font-family: ${(props) => props.theme.fonts.interSemiBold};
	color: ${(props) => props.theme.colors.gray};
	font-size: 12px;
`;

const Subtext = styled.div`
	font-family: ${(props) => props.theme.fonts.interSemiBold};
	color: ${(props) => props.theme.colors.gray};
	font-size: 12px;
`;

const ValueBox = styled(FlexDivColCentered)`
	width: 150px;
`;

const Value = styled.div`
	font-size: 16px;
	font-family: ${(props) => props.theme.fonts.expanded};
	color: ${(props) => props.theme.colors.white};
`;

const StyledButton = styled(Button)`
	font-size: 14px;
	font-family: ${(props) => props.theme.fonts.condensedMedium};
	width: 80%;
	text-transform: uppercase;
	height: 40px;
	backgroundcolor: ${(props) => props.theme.colors.brightBlue};
`;

export const TabContainer = styled(FlexDivColCentered)`
	height: 100%;
	justify-content: space-evenly;
	padding: 24px;
`;

export default ClaimTab;
