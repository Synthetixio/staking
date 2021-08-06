import { FC, useState, useEffect } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { useRecoilValue } from 'recoil';

import { appReadyState } from 'store/app';
import smallWaveSVG from 'assets/svg/app/small-wave.svg';
import Connector from 'containers/Connector';
import Currency from 'components/Currency';

import useSelectedPriceCurrency from 'hooks/useSelectedPriceCurrency';
import { formatCurrency, formatFiatCurrency, formatNumber } from 'utils/formatters/number';
import { CryptoCurrency, CurrencyKey } from 'constants/currency';
import { DEFAULT_CRYPTO_DECIMALS } from 'constants/defaults';
import { ESTIMATE_VALUE } from 'constants/placeholder';
import { GasLimitEstimate } from 'constants/network';
import GasSelector from 'components/GasSelector';

import {
	FlexDivColCentered,
	ModalContent,
	ModalItem,
	ModalItemTitle,
	ModalItemText,
	FlexDivRow,
} from 'styles/common';
import TxConfirmationModal from 'sections/shared/modals/TxConfirmationModal';

import { getContract } from '../StakeTab/StakeTab';
import { StyledButton } from '../../common';
import { CurrencyIconType } from 'components/Currency/CurrencyIcon/CurrencyIcon';
import { networkState } from 'store/wallet';
import Wei, { wei } from '@synthetixio/wei';

type RewardsBoxProps = {
	tokenRewards: Wei;
	SNXRate: Wei;
	stakedAsset: CurrencyKey;
	icon: CurrencyKey;
	type?: CurrencyIconType;
	handleClaim: () => void;
	setClaimGasPrice: (num: Wei) => void;
	claimTxModalOpen: boolean;
	setClaimTxModalOpen: (open: boolean) => void;
	claimError: string | null;
	setClaimError: (err: string | null) => void;
	secondTokenReward?: Wei;
	secondTokenKey?: CryptoCurrency;
	secondTokenRate?: Wei;
};

const RewardsBox: FC<RewardsBoxProps> = ({
	tokenRewards,
	SNXRate,
	stakedAsset,
	icon,
	type,
	handleClaim,
	setClaimGasPrice,
	claimTxModalOpen,
	setClaimTxModalOpen,
	claimError,
	setClaimError,
	secondTokenReward,
	secondTokenKey,
	secondTokenRate,
}) => {
	const { t } = useTranslation();
	const { synthetixjs, signer } = Connector.useContainer();
	const networkId = useRecoilValue(networkState)!.id;
	const { selectedPriceCurrency, getPriceAtCurrentRate } = useSelectedPriceCurrency();
	const [gasLimitEstimate, setGasLimitEstimate] = useState<GasLimitEstimate>(null);
	const isAppReady = useRecoilValue(appReadyState);

	useEffect(() => {
		const getGasLimitEstimate = async () => {
			if (isAppReady) {
				try {
					setClaimError(null);
					const contract = getContract(synthetixjs!, stakedAsset, signer);
					const gasEstimate = wei(await contract.estimateGas.getReward(), 0);
					setGasLimitEstimate(gasEstimate);
				} catch (error) {
					setClaimError(error.message);
					setGasLimitEstimate(null);
				}
			}
		};
		getGasLimitEstimate();
	}, [stakedAsset, signer, setClaimError, isAppReady]);

	const isDualRewards = secondTokenReward !== undefined;

	return (
		<>
			<RewardsContainer dualRewards={isDualRewards}>
				<RewardsTitle>{t('earn.actions.rewards.title')}</RewardsTitle>
				<RewardsRow dualRewards={isDualRewards}>
					<FlexDivColCentered>
						<Currency.Icon currencyKey={CryptoCurrency.SNX} width="48" height="48" />
						<RewardsAmountSNX>
							{formatCurrency(CryptoCurrency.SNX, tokenRewards, {
								currencyKey: CryptoCurrency.SNX,
							})}
						</RewardsAmountSNX>
						<RewardsAmountUSD>
							{ESTIMATE_VALUE}{' '}
							{formatFiatCurrency(getPriceAtCurrentRate(tokenRewards.mul(SNXRate)), {
								sign: selectedPriceCurrency.sign,
							})}
						</RewardsAmountUSD>
					</FlexDivColCentered>
					{isDualRewards && secondTokenKey && (
						<FlexDivColCentered>
							<Currency.Icon
								currencyKey={icon}
								type={type ? type : undefined}
								width="48"
								height="48"
							/>
							<RewardsAmountSNX>
								{formatCurrency(secondTokenKey, secondTokenReward!, {
									currencyKey: secondTokenKey,
								})}
							</RewardsAmountSNX>
							<RewardsAmountUSD>
								{ESTIMATE_VALUE}{' '}
								{formatFiatCurrency(
									getPriceAtCurrentRate(wei(secondTokenReward!.mul(secondTokenRate!))),
									{
										sign: selectedPriceCurrency.sign,
									}
								)}
							</RewardsAmountUSD>
						</FlexDivColCentered>
					)}
				</RewardsRow>
				<StyledButton variant="primary" onClick={handleClaim} disabled={tokenRewards.eq(0)}>
					{isDualRewards
						? t('earn.actions.claim.claim-button')
						: t('earn.actions.claim.claim-snx-button')}
				</StyledButton>
				<GasSelector
					altVersion={true}
					gasLimitEstimate={gasLimitEstimate}
					setGasPrice={setClaimGasPrice}
				/>
			</RewardsContainer>
			{claimTxModalOpen && (
				<TxConfirmationModal
					onDismiss={() => setClaimTxModalOpen(false)}
					txError={claimError}
					attemptRetry={handleClaim}
					content={
						<ModalContent>
							<ModalItem>
								<ModalItemTitle>{t('earn.actions.claim.claiming')}</ModalItemTitle>
								<ModalItemText>
									{t('earn.actions.claim.amount', {
										amount: tokenRewards.toString(DEFAULT_CRYPTO_DECIMALS),
										asset: CryptoCurrency.SNX,
									})}
								</ModalItemText>
							</ModalItem>
						</ModalContent>
					}
				/>
			)}
		</>
	);
};

const RewardsContainer = styled(FlexDivColCentered)`
	height: 272px;
	padding: 10px;
	border: 1px solid ${(props) => props.theme.colors.pink};
	border-radius: 4px;
	background-image: url(${smallWaveSVG.src});
	background-size: cover;
	margin-top: ${(props: { dualRewards: boolean }) => (props.dualRewards ? '20px' : '0px')};
`;

const RewardsRow = styled(FlexDivRow)`
	${(props: { dualRewards: boolean }) =>
		props.dualRewards &&
		`
		grid-gap: 1rem;
	`}
`;

const RewardsTitle = styled.div`
	font-family: ${(props) => props.theme.fonts.extended};
	font-size: 12px;
	color: ${(props) => props.theme.colors.white};
	margin-bottom: 15px;
`;

const RewardsAmountSNX = styled.div`
	font-family: ${(props) => props.theme.fonts.extended};
	font-size: 24px;
	color: ${(props) => props.theme.colors.white};
	margin-top: 10px;
	text-align: center;
`;

const RewardsAmountUSD = styled.div`
	font-family: ${(props) => props.theme.fonts.interSemiBold};
	font-size: 14px;
	color: ${(props) => props.theme.colors.gray};
	margin-top: 5px;
	margin-bottom: 20px;
`;

export default RewardsBox;
