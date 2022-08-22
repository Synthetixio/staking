import { FC, useState } from 'react';
import styled from 'styled-components';
import { ethers } from 'ethers';
import { useTranslation } from 'react-i18next';

import LockedIcon from 'assets/svg/app/locked.svg';

import { TokenAllowanceLimit } from 'constants/network';
import GasSelector from 'components/GasSelector';
import TxConfirmationModal from 'sections/shared/modals/TxConfirmationModal';

import Button from 'components/Button';
import {
  ErrorMessage,
  ModalContent,
  ModalItem,
  ModalItemTitle,
  ModalItemText,
} from 'styles/common';

import { yearnSNXVault } from 'contracts';
import { SynthetixJS } from '@synthetixio/contracts-interface';
import useSynthetixQueries, { GasPrice } from '@synthetixio/queries';
import { isObjectOrErrorWithMessage } from 'utils/ts-helpers';
import { SynthetixJsAndSignerProps, withSynthetixJsAndSigner } from 'hoc/withSynthetixJsAndSigner';
import Connector from 'containers/Connector';

type ApproveModalProps = {
  description: string;
  onApproved: () => void;
  tokenContractName: string;
  contractToApproveName: string;
};

const getContractByName = (
  synthetixjs: SynthetixJS['contracts'],
  name: string,
  signer: ethers.Signer
) => {
  const { contracts } = synthetixjs;
  if (name === 'YearnSNXVault') {
    return new ethers.Contract(yearnSNXVault.address, yearnSNXVault.abi, signer);
  }
  return contracts[name];
};

const ApproveModal: FC<ApproveModalProps & SynthetixJsAndSignerProps> = ({
  description,
  onApproved,
  tokenContractName,
  contractToApproveName,
  signer,
  synthetixjs,
}) => {
  const { isAppReady, isWalletConnected } = Connector.useContainer();
  const { useContractTxn } = useSynthetixQueries();

  const [error, setError] = useState<string | null>(null);
  const [gasPrice, setGasPrice] = useState<GasPrice | undefined>(undefined);
  const [isApproving, setIsApproving] = useState<boolean>(false);
  const [txModalOpen, setTxModalOpen] = useState<boolean>(false);
  const tokenContract = getContractByName(synthetixjs.contracts, tokenContractName, signer);
  const contractToApprove = getContractByName(synthetixjs.contracts, contractToApproveName, signer);
  const allowance = TokenAllowanceLimit.toBN();

  const txn = useContractTxn(
    tokenContract,
    'approve',
    [contractToApprove.address, allowance],
    gasPrice,
    {
      enabled: Boolean(synthetixjs && isWalletConnected && isAppReady),
      onSuccess: () => {
        setTxModalOpen(false);
        setIsApproving(false);
        onApproved();
      },
      onError: (e) => {
        if (isObjectOrErrorWithMessage(e)) {
          setError(e.message);
        } else {
          setError(String(e));
        }
        setIsApproving(false);
      },
    }
  );

  const handleApprove = async () => {
    setIsApproving(true);
    setError(null);
    setTxModalOpen(true);
    txn.mutate();
  };

  const { t } = useTranslation();
  return (
    <>
      <Modal>
        <Layer>
          <LockedIcon width="93" />
          <ModalInfo>{description}</ModalInfo>
          <GasSelector
            gasLimitEstimate={txn.gasLimit}
            onGasPriceChange={setGasPrice}
            optimismLayerOneFee={txn.optimismLayerOneFee}
          />
          <StyledButton
            disabled={isApproving || !txn.gasLimit}
            onClick={handleApprove}
            size="lg"
            variant="primary"
          >
            {isApproving ? t('common.approve.is-approving') : t('common.approve.approve-contract')}
          </StyledButton>
          <ErrorMessage>{error}</ErrorMessage>
        </Layer>
      </Modal>
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
                  {t('modals.confirm-transaction.approve.contract', {
                    stakedAsset: contractToApproveName,
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

const Modal = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  bottom: 100%;
  opacity: 0.97;
  background: ${(props) => props.theme.colors.black};
  z-index: 10;
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

export default withSynthetixJsAndSigner<ApproveModalProps>(ApproveModal);
