import { FC, useEffect, useState } from 'react';
import styled from 'styled-components';
import { ethers } from 'ethers';

import synthetix from 'lib/synthetix';

import { Svg } from 'react-optimized-image';
import { useTranslation } from 'react-i18next';
import { useRecoilValue } from 'recoil';

import LockedIcon from 'assets/svg/app/locked.svg';

import { Transaction, TokenAllowanceLimit } from 'constants/network';
import { appReadyState } from 'store/app';
import { isWalletConnectedState } from 'store/wallet';
import { normalizedGasPrice, normalizeGasLimit } from 'utils/network';
import { getGasEstimateForTransaction } from 'utils/transactions';

import Button from 'components/Button';

type ApproveModalProps = {
	description: string;
	onApprove: () => void;
	isApproving: boolean;
	tokenContract: ethers.Contract;
	addressToApprove: string;
};

const ApproveModal: FC<ApproveModalProps> = ({
	description,
	onApprove,
	isApproving,
	tokenContract,
	addressToApprove,
}) => {
	const isWalletConnected = useRecoilValue(isWalletConnectedState);
	const isAppReady = useRecoilValue(appReadyState);

	const [gasLimitEstimate, setGasLimitEstimate] = useState<number | null>(null);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const getGasLimitEstimate = async () => {
			if (isAppReady && isWalletConnected) {
				try {
					const allowance = synthetix.js!.utils.parseEther(TokenAllowanceLimit.toString());
					const gasEstimate = await getGasEstimateForTransaction(
						[addressToApprove, allowance],
						tokenContract.estimateGas.approve
					);
					console.log(gasEstimate);
					setGasLimitEstimate(normalizeGasLimit(Number(gasEstimate)));
				} catch (e) {
					setError(e.message);
					setGasLimitEstimate(null);
				}
			}
		};
		getGasLimitEstimate();
		// eslint-disable-next-line
	}, [isAppReady, isWalletConnected]);

	const { t } = useTranslation();
	return (
		<Modal>
			<Layer>
				<Svg src={LockedIcon} />
				<ModalInfo>{description}</ModalInfo>
				<StyledButton disabled={isApproving} onClick={onApprove} size="lg" variant="primary">
					{t('common.approve.approve-contract')}
				</StyledButton>
			</Layer>
		</Modal>
	);
};

const Modal = styled.div`
	position: absolute;
	width: 100%;
	height: 100%;
	top: 0;
	bottom: 100%;
	opacity: 0.95;
	background: ${(props) => props.theme.colors.black};
	z-index: 100;
`;

const Layer = styled.div`
	display: flex;
	height: 100%;
	justify-content: center;
	width: 260px;
	margin: 0 auto;
	align-items: center;
	text-align: center;
	flex-direction: column;
`;

const ModalInfo = styled.p`
	font-family: ${(props) => props.theme.fonts.regular};
	color: ${(props) => props.theme.colors.gray};
	font-size: 14px;
	margin-top: 0;
`;

const StyledButton = styled(Button)`
	text-transform: uppercase;
	width: 100%;
`;

export default ApproveModal;
