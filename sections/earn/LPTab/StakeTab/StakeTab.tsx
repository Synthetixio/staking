import { FC, useState, ReactNode, useEffect } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import { ethers } from 'ethers';

import GasSelector from 'components/GasSelector';
import synthetix from 'lib/synthetix';
import { StyledInput } from 'components/Input/NumericInput';
import { formatCryptoCurrency } from 'utils/formatters/number';
import TxConfirmationModal from 'sections/shared/modals/TxConfirmationModal';
import { getGasEstimateForTransaction } from 'utils/transactions';
import { normalizedGasPrice, normalizeGasLimit } from 'utils/network';

import {
	FlexDivCentered,
	FlexDivColCentered,
	ModalContent,
	ModalItem,
	ModalItemTitle,
} from 'styles/common';
import { CurrencyKey } from 'constants/currency';
import { Transaction } from 'constants/network';
import Notify from 'containers/Notify';

import { TotalValueWrapper, Subtext, Value, StyledButton } from '../../common';
import { getContractAndPoolAddress } from '../Approve/Approve';

type StakeTabProps = {
	icon: ReactNode;
	isStake: boolean;
	synth: CurrencyKey;
	userBalance: number;
};

const StakeTab: FC<StakeTabProps> = ({ icon, synth, isStake, userBalance }) => {
	const { t } = useTranslation();
	const [amount, setAmount] = useState<number | null>(null);
	const { monitorHash } = Notify.useContainer();
	const [gasLimitEstimate, setGasLimitEstimate] = useState<number | null>(null);
	const [gasPrice, setGasPrice] = useState<number>(0);
	const [error, setError] = useState<string | null>(null);

	const [transactionState, setTransactionState] = useState<Transaction>(Transaction.PRESUBMIT);
	const [txHash, setTxHash] = useState<string | null>(null);
	const [txModalOpen, setTxModalOpen] = useState<boolean>(false);

	useEffect(() => {
		const getGasLimitEstimate = async () => {
			if (synthetix && synthetix.js && amount != null && amount > 0) {
				try {
					setError(null);
					const { contract } = getContractAndPoolAddress(synth);
					let gasEstimate = await getGasEstimateForTransaction(
						[synthetix.js.utils.formatEther(amount.toString())],
						isStake ? contract.estimateGas.stake : contract.estimateGas.unstake
					);
					setGasLimitEstimate(normalizeGasLimit(Number(gasEstimate)));
				} catch (error) {
					setError(error.message);
					setGasLimitEstimate(null);
				}
			}
		};
		getGasLimitEstimate();
	}, [amount, isStake, synth]);

	const handleStake = async () => {
		if (synthetix && synthetix.js && amount != null && amount > 0) {
			try {
				setError(null);
				setTxModalOpen(true);
				const { contract } = getContractAndPoolAddress(synth);

				const formattedStakeAmount = synthetix.js.utils.parseEther(amount.toString());
				const gasLimit = await getGasEstimateForTransaction(
					[formattedStakeAmount],
					isStake ? contract.estimateGas.stake : contract.estimateGas.unstake
				);
				let transaction: ethers.ContractTransaction;
				if (isStake) {
					transaction = await contract.stake(formattedStakeAmount, {
						gasPrice: normalizedGasPrice(gasPrice),
						gasLimit,
					});
				} else {
					transaction = await contract.unstake(formattedStakeAmount, {
						gasPrice: normalizedGasPrice(gasPrice),
						gasLimit,
					});
				}

				if (transaction) {
					setTxHash(transaction.hash);
					setTransactionState(Transaction.WAITING);
					monitorHash({
						txHash: transaction.hash,
						onTxConfirmed: () => setTransactionState(Transaction.SUCCESS),
					});
					setTxModalOpen(false);
				}
			} catch (e) {
				setTransactionState(Transaction.PRESUBMIT);
				setError(e.message);
			}
		}
	};

	return (
		<>
			<Container>
				<div>{icon}</div>
				<InputSection>
					<EmptyDiv />
					<InputField
						value={amount ?? '0.00'}
						placeholder="0.00"
						onChange={(e) => setAmount(Number(e.target.value))}
					/>
					<MaxButton
						variant="primary"
						disabled={userBalance === 0}
						onClick={() => {
							setAmount(userBalance);
						}}
					>
						{t('earn.actions.max')}
					</MaxButton>
				</InputSection>
				<TotalValueWrapper>
					<Subtext>{t('earn.actions.available')}</Subtext>
					<StyledValue>{formatCryptoCurrency(userBalance, { currencyKey: synth })}</StyledValue>
				</TotalValueWrapper>
				<PaddedButton
					variant="primary"
					onClick={handleStake}
					disabled={
						synthetix && synthetix.js && amount != null && amount > 0
							? (amount ?? 0) > userBalance
								? true
								: false
							: true
					}
				>
					{isStake
						? t('earn.actions.stake.stake-button', { synth })
						: t('earn.actions.unstake.unstake-button', { synth })}
				</PaddedButton>
				<GasSelector gasLimitEstimate={gasLimitEstimate} setGasPrice={setGasPrice} />
			</Container>
			{txModalOpen && (
				<TxConfirmationModal
					onDismiss={() => setTxModalOpen(false)}
					txError={error}
					attemptRetry={handleStake}
					content={
						<ModalContent>
							<ModalItem>
								<ModalItemTitle>{t('modals.confirm-transaction.claiming.claiming')}</ModalItemTitle>
							</ModalItem>
						</ModalContent>
					}
				/>
			)}
		</>
	);
};

const Container = styled(FlexDivColCentered)`
	background-color: ${(props) => props.theme.colors.black};
	height: 100%;
	width: 100%;
`;

const StyledValue = styled(Value)`
	font-family: ${(props) => props.theme.fonts.interSemiBold};
	font-size: 12px;
`;

const PaddedButton = styled(StyledButton)`
	margin-top: 20px;
	width: 80%;
`;

const MaxButton = styled(StyledButton)`
	width: 25%;
	font-size: 14px;
	height: 30px;
`;

const InputSection = styled(FlexDivCentered)`
	justify-content: space-between;
	width: 80%;
`;

const EmptyDiv = styled.div`
	width: 25%;
`;

const InputField = styled(StyledInput)`
	width: 50%;
	font-size: 24px;
	background: transparent;
	font-family: ${(props) => props.theme.fonts.expanded};
	text-align: center;

	&:disabled {
		color: ${(props) => props.theme.colors.gray};
	}
`;

export default StakeTab;
