import { FC, useState, useEffect } from 'react';
import styled from 'styled-components';
import { useTranslation, Trans } from 'react-i18next';
import { Svg } from 'react-optimized-image';
import { SynthetixJS } from '@synthetixio/js';
import { ethers } from 'ethers';

import GasSelector from 'components/GasSelector';
import synthetix from 'lib/synthetix';
import Button from 'components/Button';
import Notify from 'containers/Notify';
import { zIndex } from 'constants/ui';
import LockSVG from 'assets/svg/app/locked.svg';
import { iBtcRewards, iEthRewards, curvepoolRewards } from 'contracts';
import {
	FlexDivColCentered,
	ModalContent,
	ModalItem,
	ModalItemTitle,
	ModalItemText,
} from 'styles/common';
import { getGasEstimateForTransaction } from 'utils/transactions';
import { Transaction, TokenAllowanceLimit } from 'constants/network';
import { normalizedGasPrice, normalizeGasLimit } from 'utils/network';

import { Label, StyledLink, StyledButton } from '../../common';
import { CurrencyKey, Synths } from 'constants/currency';
import TxConfirmationModal from 'sections/shared/modals/TxConfirmationModal';

type ApproveProps = {
	synth: CurrencyKey;
};

export const getContractAndPoolAddress = (synth: CurrencyKey) => {
	const { contracts } = synthetix.js as SynthetixJS;
	if (synth === Synths.iBTC) {
		return {
			contract: contracts.SynthiBTC,
			poolAddress: iBtcRewards.address,
		};
	} else if (synth === Synths.iETH) {
		return {
			contract: contracts.SynthiETH,
			poolAddress: iEthRewards.address,
		};
	} else if (synth === Synths.sUSD) {
		return {
			contract: contracts.SynthsUSD,
			poolAddress: curvepoolRewards.address,
		};
	} else {
		throw new Error('unrecognizable asset');
	}
};

const Approve: FC<ApproveProps> = ({ synth }) => {
	const { t } = useTranslation();
	const { monitorHash } = Notify.useContainer();
	const [error, setError] = useState<string | null>(null);
	const [txModalOpen, setTxModalOpen] = useState<boolean>(false);
	const [gasLimitEstimate, setGasLimitEstimate] = useState<number | null>(null);
	const [gasPrice, setGasPrice] = useState<number>(0);
	const [transactionState, setTransactionState] = useState<Transaction>(Transaction.PRESUBMIT);
	const [txHash, setTxHash] = useState<string | null>(null);

	useEffect(() => {
		const getGasLimitEstimate = async () => {
			if (synthetix && synthetix.js) {
				try {
					setError(null);
					const { contract, poolAddress } = getContractAndPoolAddress(synth);
					let gasEstimate = await getGasEstimateForTransaction(
						[poolAddress, synthetix.js.utils.parseEther(TokenAllowanceLimit.toString())],
						contract.estimateGas.approve
					);
					setGasLimitEstimate(normalizeGasLimit(Number(gasEstimate)));
				} catch (error) {
					setError(error.message);
					setGasLimitEstimate(null);
				}
			}
		};
		getGasLimitEstimate();
	}, [synth]);

	const handleApprove = async () => {
		if (synthetix && synthetix.js) {
			try {
				setError(null);
				setTxModalOpen(true);
				const { contract, poolAddress } = getContractAndPoolAddress(synth);

				const allowance = synthetix.js.utils.parseEther(TokenAllowanceLimit.toString());
				const gasLimit = await getGasEstimateForTransaction(
					[poolAddress, allowance],
					contract.estimateGas.approve
				);
				const transaction: ethers.ContractTransaction = await contract.approve(
					poolAddress,
					allowance,
					{
						gasPrice: normalizedGasPrice(gasPrice),
						gasLimit,
					}
				);

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
			<OverlayContainer title="">
				<InnerContainer>
					<Svg src={LockSVG} />
					<Label>
						<Trans
							i18nKey="modals.approve.description"
							values={{
								synth,
							}}
							components={[<StyledLink />]}
						/>
					</Label>
					<PaddedButton variant="primary" onClick={handleApprove}>
						{t('modals.approve.button')}
					</PaddedButton>
					<GasSelector gasLimitEstimate={gasLimitEstimate} setGasPrice={setGasPrice} />
				</InnerContainer>
			</OverlayContainer>
			{txModalOpen && (
				<TxConfirmationModal
					onDismiss={() => setTxModalOpen(false)}
					txError={error}
					attemptRetry={handleApprove}
					content={
						<ModalContent>
							<ModalItem>
								<ModalItemTitle>{t('modals.confirm-transaction.approve.approving')}</ModalItemTitle>
								<ModalItemText>
									{t('modals.confirm-transaction.approve.contract', { synth })}
								</ModalItemText>
							</ModalItem>
						</ModalContent>
					}
				/>
			)}
		</>
	);
};

const OverlayContainer = styled(FlexDivColCentered)`
	z-index: ${zIndex.DIALOG_OVERLAY};
	justify-content: space-around;
	position: absolute;
	background-color: rgba(0, 0, 0, 0.8);
	width: 555px;
	height: 370px;
`;

const InnerContainer = styled(FlexDivColCentered)`
	width: 300px;
`;

const Actions = styled(FlexDivColCentered)`
	margin: 8px 0px;
`;

const Message = styled.div`
	color: ${(props) => props.theme.colors.white};
	font-size: 12px;
	font-family: ${(props) => props.theme.fonts.regular};
	flex-grow: 1;
	text-align: center;
	margin: 16px 0px;
`;

const MessageButton = styled(Button).attrs({
	variant: 'primary',
	size: 'lg',
	isRounded: true,
})`
	text-transform: uppercase;
	font-size: 12px;
	font-family: ${(props) => props.theme.fonts.condensedMedium};
`;

const PaddedButton = styled(StyledButton)`
	margin-top: 20px;
	width: 100%;
`;

export default Approve;
