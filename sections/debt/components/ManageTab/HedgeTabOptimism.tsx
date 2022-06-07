import { dSNXPoolContractOptimism } from 'constants/dhedge';
import React, { useState } from 'react';
import styled from 'styled-components';
import { utils } from 'ethers';
import useSynthetixQueries from '@synthetixio/queries';
import { constants } from 'ethers';
import GasSelector from 'components/GasSelector';
import { useRecoilValue } from 'recoil';
import { walletAddressState } from 'store/wallet';
import { GasPrice } from '@synthetixio/queries';
import { wei } from '@synthetixio/wei';
import {
	StyledBalance,
	StyledButton,
	StyledCryptoCurrencyBox,
	StyledCryptoCurrencyImage,
	StyledHedgeInput,
	StyledInputLabel,
	StyledMaxButton,
	StyledSpacer,
} from './hedge-tab-ui-components';
import { Svg } from 'react-optimized-image';
import dhedge from 'assets/svg/app/dhedge.svg';
import { useTranslation } from 'react-i18next';
import { formatCryptoCurrency } from 'utils/formatters/number';
import Connector from 'containers/Connector';
import useGetDSnxBalance from 'hooks/useGetDSnxBalance';
import LoaderIcon from 'assets/svg/app/loader.svg';
import useGetNeedsApproval from 'hooks/useGetNeedsApproval';
import useGetDSNXPrice from 'hooks/useGetDSNXPrice';
import { ExternalLink } from 'styles/common';
import { EXTERNAL_LINKS } from 'constants/links';

const HedgeTabOptimism = () => {
	const { t } = useTranslation();
	const { synthetixjs } = Connector.useContainer();
	const sUSDContract = synthetixjs?.contracts.SynthsUSD;
	const [amountToSend, setAmountToSend] = useState('');
	const [approveGasCost, setApproveGasCost] = useState<GasPrice | undefined>(undefined);
	const [depositGasCost, setDepositGasCost] = useState<GasPrice | undefined>(undefined);

	const walletAddress = useRecoilValue(walletAddressState);
	const { useContractTxn, useSynthsBalancesQuery } = useSynthetixQueries();
	const dSNXTokenPriceQuery = useGetDSNXPrice(walletAddress);
	const dSNXPrice = dSNXTokenPriceQuery.data;
	const approveQuery = useGetNeedsApproval(
		dSNXPoolContractOptimism.address,
		sUSDContract,
		walletAddress
	);
	const approved = approveQuery.data;
	const approveTx = useContractTxn(
		sUSDContract!,
		'approve',
		[dSNXPoolContractOptimism.address, constants.MaxUint256],
		approveGasCost,
		{
			enabled: Boolean(walletAddress && sUSDContract),
			onSettled: () => {
				approveQuery.refetch();
			},
		}
	);

	const synthsBalancesQuery = useSynthsBalancesQuery(walletAddress);
	const sUSDBalance = synthsBalancesQuery.data?.balancesMap.sUSD.balance || wei(0);
	const dSNXBalanceQuery = useGetDSnxBalance();
	const dSNXBalance = dSNXBalanceQuery.data;

	const depositTx = useContractTxn(
		dSNXPoolContractOptimism,
		'deposit',
		[sUSDContract?.address, wei(amountToSend || 0).toBN()],
		depositGasCost,
		{
			onSettled: () => {
				setAmountToSend('');
				dSNXBalanceQuery.refetch();
			},
			enabled: Boolean(approved && sUSDContract?.address),
		}
	);
	return (
		<Container>
			<div style={{ display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
				<StyledInputLabel>
					{t('debt.actions.manage.using')}
					<StyledCryptoCurrencyBox>
						<StyledCryptoCurrencyImage src="https://raw.githubusercontent.com/Synthetixio/synthetix-assets/v2.0.10/synths/sUSD.svg" />
						sUSD
					</StyledCryptoCurrencyBox>
				</StyledInputLabel>
				<StyledHedgeInput
					type="number"
					min={0}
					disabled={approveTx.isLoading || depositTx.isLoading}
					placeholder={formatCryptoCurrency(sUSDBalance, {
						maxDecimals: 1,
						minDecimals: 2,
					})}
					onChange={(e) => {
						try {
							const val = utils.parseUnits(e.target.value || '0', 18);
							if (val.gte(constants.MaxUint256)) return;
							setAmountToSend(e.target.value);
						} catch {}
					}}
					value={amountToSend?.toString()}
					autoFocus={true}
				/>
				<StyledBalance>
					{t('debt.actions.manage.balance-usd')}
					{formatCryptoCurrency(wei(sUSDBalance), {
						maxDecimals: 1,
						minDecimals: 2,
					})}
					<StyledMaxButton
						variant="text"
						isActive={sUSDBalance?.gt(0)}
						disabled={approveTx.isLoading || depositTx.isLoading}
						onClick={() => {
							if (sUSDBalance?.gt(0)) {
								setAmountToSend(
									formatCryptoCurrency(sUSDBalance || wei(0), {
										maxDecimals: 1,
										minDecimals: 2,
									})
								);
							}
						}}
					>
						{t('debt.actions.manage.max')}
					</StyledMaxButton>
				</StyledBalance>
				<StyledSpacer />
				<StyledInputLabel>
					{t('debt.actions.manage.buying')}
					<StyledCryptoCurrencyBox>
						<Svg src={dhedge} width={24} height={24} />
						dSNX
					</StyledCryptoCurrencyBox>
				</StyledInputLabel>
				<StyledHedgeInput
					type="number"
					onChange={() => {}}
					disabled
					value={
						amountToSend && dSNXPrice
							? formatCryptoCurrency(wei(amountToSend).div(dSNXPrice), {
									maxDecimals: 1,
									minDecimals: 2,
							  })
							: 0
					}
				/>
				<StyledBalance>
					{t('debt.actions.manage.balance')}
					{formatCryptoCurrency(dSNXBalance || wei(0), {
						maxDecimals: 1,
						minDecimals: 2,
					})}
				</StyledBalance>
				<GasSelector
					gasLimitEstimate={approved ? depositTx.gasLimit : approveTx.gasLimit}
					onGasPriceChange={approved ? setDepositGasCost : setApproveGasCost}
					optimismLayerOneFee={
						approved ? depositTx.optimismLayerOneFee : approveTx.optimismLayerOneFee
					}
					altVersion
				/>
				{approveTx.isLoading && (
					<LoaderContainer>
						<Svg width={20} height={20} src={LoaderIcon} />
						<LoaderText>{t('debt.actions.manage.approving-dsnx')}</LoaderText>
					</LoaderContainer>
				)}
				{depositTx.isLoading && (
					<LoaderContainer>
						<Svg width={20} height={20} src={LoaderIcon} />
						<LoaderText>{t('debt.actions.manage.buying-dsnx')}</LoaderText>
					</LoaderContainer>
				)}
				{depositTx.error && <p>{depositTx.errorMessage}</p>}
				{approveTx.error && <p>{approveTx.errorMessage}</p>}
				{Boolean(!approveTx.isLoading && !depositTx.isLoading) && (
					<StyledButton
						size="lg"
						onClick={() => {
							approved ? depositTx.mutate() : approveTx.mutate();
						}}
						variant="primary"
						disabled={wei(amountToSend || '0').eq(0)}
					>
						{approved ? t('debt.actions.manage.swap') : t('debt.actions.manage.approve')}
					</StyledButton>
				)}
			</div>
			<PoweredByContainer>
				{t('debt.actions.manage.powered-by')}{' '}
				<ExternalLink href={EXTERNAL_LINKS.Toros.dSNXPool}>
					<TorosLogo alt="toros logo" src={'/images/toros-white.png'} />
				</ExternalLink>
			</PoweredByContainer>
		</Container>
	);
};

export default HedgeTabOptimism;

const Container = styled.div`
	width: 100%;
	height: 100%;
`;

const LoaderContainer = styled.div`
	display: flex;
	align-items: center;
`;
const LoaderText = styled.p`
	margin-left: 10px;
	text-transform: none;
`;

const PoweredByContainer = styled.div`
	margin-top: 20px;
	display: flex;
	align-items: center;
	font-size: 9px;
`;
const TorosLogo = styled.img`
	height: 12px;
	margin-left: 10px;
`;
