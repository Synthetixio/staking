import { FC, useState } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';

import {
  ModalItemTitle as TxModalItemTitle,
  ModalItemText as TxModalItemText,
  Tooltip,
} from 'styles/common';
import { truncateAddress } from 'utils/formatters/string';
import { TxModalItem } from 'sections/delegate/common';

import TxConfirmationModal from 'sections/shared/modals/TxConfirmationModal';

import useSynthetixQueries, {
  Action,
  DELEGATE_APPROVE_CONTRACT_METHODS,
  DelegationWallet,
  DELEGATE_WITHDRAW_CONTRACT_METHODS,
} from '@synthetixio/queries';
import Connector from 'containers/Connector';
import { sleep } from 'utils/promise';

type ToggleDelegateApprovalProps = {
  account: DelegationWallet;
  action: string;
  value: boolean;
  onDelegateToggleSuccess: () => void;
};

const ToggleDelegateApproval: FC<ToggleDelegateApprovalProps> = ({
  account,
  action,
  value: checked,
  onDelegateToggleSuccess,
}) => {
  const { t } = useTranslation();
  const { useSynthetixTxn } = useSynthetixQueries();
  const { isAppReady } = Connector.useContainer();

  const [txModalOpen, setTxModalOpen] = useState<boolean>(false);
  const shortenedDelegateAddress = truncateAddress(account.address, 8, 6);

  const methods = checked ? DELEGATE_WITHDRAW_CONTRACT_METHODS : DELEGATE_APPROVE_CONTRACT_METHODS;
  const currentMethod = methods.get(action);
  const txn = useSynthetixTxn(
    'DelegateApprovals',
    currentMethod!, // if method missing query wont be enabled
    [account.address],
    {},
    {
      enabled: Boolean(isAppReady && currentMethod),
      onSuccess: async () => {
        await sleep(5000); // wait for the subgraph to sync
        onDelegateToggleSuccess();
        setTxModalOpen(false);
      },
    }
  );

  const onChange = async () => {
    setTxModalOpen(true);
    txn.mutate();
  };

  const canAll = (account: DelegationWallet) =>
    account.canBurn && account.canMint && account.canClaim && account.canExchange;

  const disabled = canAll(account) && action !== Action.APPROVE_ALL;
  return (
    <>
      <Container>
        <input
          name={action}
          data-testid={`checkbox-${account.address}-${t(
            `common.delegate-actions.actions.${action}`
          )}`}
          type="checkbox"
          disabled={disabled}
          onChange={onChange}
          checked={checked}
        />
        <Tooltip
          content={t(
            checked
              ? 'common.delegate-actions.tooltip.withdraw'
              : 'common.delegate-actions.tooltip.enable'
          )}
          disabled={disabled}
        >
          <span className="checkmark"></span>
        </Tooltip>
      </Container>
      {txModalOpen && (
        <TxConfirmationModal
          onDismiss={() => setTxModalOpen(false)}
          txError={txn.errorMessage}
          attemptRetry={onChange}
          content={
            <TxModalItem>
              <TxModalItemTitle>{t('delegate.tx-confirmation-title')}</TxModalItemTitle>
              <TxModalItemText>{shortenedDelegateAddress}</TxModalItemText>
            </TxModalItem>
          }
        />
      )}
    </>
  );
};

const Container = styled.label`
  display: block;
  position: relative;
  padding-left: 45px;
  margin-bottom: 12px;
  cursor: pointer;
  font-size: 22px;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;

  input {
    position: absolute;
    opacity: 0;
    cursor: pointer;
    height: 0;
    width: 0;
  }

  .checkmark {
    position: absolute;
    top: 0;
    left: 0;
    height: 16px;
    width: 16px;
    border: 1px solid ${(props) => props.theme.colors.mediumBlueHover};
    border-radius: 1px;
    background-color: ${(props) => props.theme.colors.mediumBlue};
    color: ${(props) => props.theme.colors.blue};
    opacity: 0.8;
  }

  &:hover input ~ .checkmark {
    opacity: 1;
  }

  input:disabled ~ .checkmark {
    opacity: 0.2;
  }

  .checkmark:after {
    content: '';
    position: absolute;
    display: none;
  }

  input:checked ~ .checkmark:after {
    display: block;
  }

  .checkmark:after {
    left: 4px;
    top: 2px;
    width: 3px;
    height: 6px;
    border: solid ${(props) => props.theme.colors.blue};
    border-width: 0 2px 2px 0;
    -webkit-transform: rotate(45deg);
    -ms-transform: rotate(45deg);
    transform: rotate(45deg);
  }
`;

export default ToggleDelegateApproval;
