import React, { useEffect, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import styled from 'styled-components';
import { Svg } from 'react-optimized-image';

import { ErrorMessage, FlexDivCentered, FlexDivColCentered } from 'styles/common';
import useClaimedStatus from 'sections/hooks/useClaimedStatus';
import BigNumber from 'bignumber.js';
import { formatCurrency, formatFiatCurrency } from 'utils/formatters/number';
import synthetix from 'lib/synthetix';
import Connector from 'containers/Connector';
import { getGasEstimateForTransaction } from 'utils/transactions';
import Etherscan from 'containers/Etherscan';
import GasSelector from 'components/GasSelector';
import { normalizedGasPrice, normalizeGasLimit } from 'utils/network';
import { CRYPTO_CURRENCY_MAP, SYNTHS_MAP } from 'constants/currency';
import snxSVG from 'assets/svg/incentives/pool-snx.svg';
import largeWaveSVG from 'assets/svg/app/large-wave.svg';
import {
	TotalValueWrapper,
	Subtext,
	Value,
	StyledButton,
	Label,
	StyledLink,
	TabContainer,
} from '../common';

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
					if (!error.message.includes('already claimed')) {
						setError(error.message);
						setGasLimitEstimate(null);
					}
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
			} = synthetix.js!;
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
					<Value>
						{formatFiatCurrency(totalRewards, {
							sign: '$',
						})}
					</Value>
				</TotalValueWrapper>
				{error && <ErrorMessage>{error}</ErrorMessage>}
				<PaddedButton variant="primary" onClick={handleClaim} disabled={error != null || claimed}>
					{claimed ? t('earn.actions.claim.claimed-button') : t('earn.actions.claim.claim-button')}
				</PaddedButton>
				<GasSelector gasLimitEstimate={gasLimitEstimate} setGasPrice={setGasPrice} />
			</InnerContainer>
		</TabContainer>
	);
};

const InnerContainer = styled(FlexDivColCentered)`
	width: 90%;
	margin: 15px auto;
	padding: 15px;
	border: 1px solid ${(props) => props.theme.colors.pink};
	border-radius: 4px;
	background-image: url(${largeWaveSVG.src});
	background-size: cover;
`;

const ValueBoxWrapper = styled(FlexDivCentered)`
	justify-content: space-around;
`;

const ValueBox = styled(FlexDivColCentered)`
	width: 150px;
`;

const PaddedButton = styled(StyledButton)`
	margin-top: 20px;
`;

export default ClaimTab;
