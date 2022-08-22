import React, { useState } from 'react';
import styled from 'styled-components';
import { Remarkable } from 'remarkable';
import { linkify } from 'remarkable/linkify';
import externalLink from 'remarkable-external-link';
import { useTranslation } from 'react-i18next';
import { ethers } from 'ethers';
import useSynthetixQueries, { Proposal } from '@synthetixio/queries';

import {
  IconButton,
  Divider,
  FlexDivColCentered,
  ModalContent,
  ModalItem,
  ModalItemText,
  ModalItemTitle,
} from 'styles/common';
import media from 'styles/media';

import NavigationBack from 'assets/svg/app/navigation-back.svg';
import PendingConfirmation from 'assets/svg/app/pending-confirmation.svg';
import Success from 'assets/svg/app/success.svg';

import {
  InputContainer,
  Container,
  HeaderRow,
  Header,
  StyledCTA,
  StyledTooltip,
  GreyHeader,
  DismissButton,
  ButtonSpacer,
  WhiteSubheader,
} from 'sections/gov/components/common';

import { truncateAddress } from 'utils/formatters/string';
import useSignMessage, { SignatureType } from 'mutations/gov/useSignMessage';
import Button from 'components/Button';

import { Transaction } from 'constants/network';
import TxConfirmationModal from 'sections/shared/modals/TxConfirmationModal';

import TxState from 'sections/gov/components/TxState';
import { expired, pending } from '../helper';
import { snapshotEndpoint, SPACE_KEY } from 'constants/snapshot';
import Connector from '../../../../containers/Connector';

type ContentProps = {
  proposal?: Proposal;
  onBack: Function;
};

const Content: React.FC<ContentProps> = ({ proposal, onBack }) => {
  const { t } = useTranslation();
  const { L2DefaultProvider, walletAddress, isWalletConnected } = Connector.useContainer();

  const [selected, setSelected] = useState<number | null>(null);

  const [signError, setSignError] = useState<string | null>(null);

  const [txModalOpen, setTxModalOpen] = useState<boolean>(false);

  const [signTransactionState, setSignTransactionState] = useState<Transaction>(
    Transaction.PRESUBMIT
  );

  const { useProposalQuery, useGetSpartanCouncil } = useSynthetixQueries();

  const proposalQuery = useProposalQuery(
    snapshotEndpoint,
    SPACE_KEY.PROPOSAL,
    proposal?.id ?? null,
    walletAddress,
    { enabled: Boolean(proposal?.id) }
  );

  const councilMembersQuery = useGetSpartanCouncil(
    process.env.NEXT_PUBLIC_BOARDROOM_KEY ?? '',
    L2DefaultProvider
  );
  const councilMembers = councilMembersQuery.data;

  const voteMutate = useSignMessage({
    onSuccess: (_) => {
      setTxModalOpen(false);
      setSignTransactionState(Transaction.SUCCESS);
      proposalQuery.refetch();
    },
    onError: (error) => {
      console.log(error);
      setSignError(error);
      setSignTransactionState(Transaction.PRESUBMIT);
    },
  });

  const councilMemberAddresses = councilMembers?.map((member) => member.address) ?? [];

  const isCouncilMember = councilMemberAddresses.includes(
    walletAddress ? ethers.utils.getAddress(walletAddress) : ''
  );

  const handleVote = () => {
    if (proposal && selected !== null) {
      setTxModalOpen(true);
      setSignTransactionState(Transaction.WAITING);
      voteMutate.mutate({
        spaceKey: SPACE_KEY.PROPOSAL,
        type: SignatureType.VOTE,
        payload: { proposal: proposal.id, choice: selected + 1, metadata: {} },
      });
    }
  };

  const getRawMarkup = (value?: string | null) => {
    const remarkable = new Remarkable({
      html: false,
      breaks: true,
      typographer: false,
    })
      .use(linkify)
      .use(externalLink);

    if (!value) return { __html: '' };

    return { __html: remarkable.render(value) };
  };

  const returnInnerContent = () => {
    if (signTransactionState === Transaction.WAITING) {
      return (
        <TxState
          title={t('gov.actions.vote.waiting')}
          content={
            <FlexDivColCentered>
              <PendingConfirmation width="78" />
              <GreyHeader>{t('gov.actions.vote.signing')}</GreyHeader>
              <WhiteSubheader>
                {t('gov.actions.vote.hash', {
                  hash: truncateAddress(proposal?.id ?? ''),
                })}
              </WhiteSubheader>
            </FlexDivColCentered>
          }
        />
      );
    }

    if (signTransactionState === Transaction.SUCCESS) {
      return (
        <TxState
          title={t('gov.actions.vote.success')}
          content={
            <FlexDivColCentered>
              <Success width="78" />
              <GreyHeader>{t('gov.actions.vote.signed')}</GreyHeader>
              <WhiteSubheader>
                {t('gov.actions.vote.hash', {
                  hash: truncateAddress(proposal?.id ?? ''),
                })}
              </WhiteSubheader>
              <Divider />
              <ButtonSpacer>
                <DismissButton
                  variant="secondary"
                  onClick={() => {
                    setSignTransactionState(Transaction.PRESUBMIT);
                    onBack();
                  }}
                >
                  {t('gov.actions.tx.dismiss')}
                </DismissButton>
              </ButtonSpacer>
            </FlexDivColCentered>
          }
        />
      );
    }

    return (
      <Container>
        <InputContainer>
          <HeaderRow>
            <IconButton onClick={() => onBack(null)}>
              <NavigationBack width="16" />
            </IconButton>
            <Header>#{truncateAddress(proposal?.id ?? '')}</Header>
            <Status closed={expired(proposal?.end)} pending={pending(proposal?.start)}>
              {expired(proposal?.end)
                ? t('gov.proposal.status.closed')
                : pending(proposal?.start)
                ? t('gov.proposal.status.pending')
                : t('gov.proposal.status.open')}
            </Status>
          </HeaderRow>
          <ProposalContainer>
            <Title>{proposal?.title}</Title>
            <Description dangerouslySetInnerHTML={getRawMarkup(proposal?.body)} />
          </ProposalContainer>
          <Divider />
          {isWalletConnected &&
            !expired(proposal?.end) &&
            !pending(proposal?.start) &&
            isCouncilMember && (
              <OptionsContainer>
                {proposal?.choices.map((choice, i) => (
                  <StyledTooltip
                    arrow={true}
                    placement="bottom"
                    content={choice}
                    hideOnClick={false}
                  >
                    <Option
                      selected={selected === i}
                      onClick={() => setSelected(i)}
                      variant="text"
                      key={i}
                    >
                      <p>{choice}</p>
                    </Option>
                  </StyledTooltip>
                ))}
              </OptionsContainer>
            )}
        </InputContainer>
        {isWalletConnected &&
          !expired(proposal?.end) &&
          !pending(proposal?.start) &&
          isCouncilMember && (
            <StyledCTA onClick={() => handleVote()} variant="primary">
              {t('gov.proposal.action.vote')}
            </StyledCTA>
          )}
      </Container>
    );
  };

  return (
    <>
      {returnInnerContent()}
      {txModalOpen && (
        <TxConfirmationModal
          isSignature={isCouncilMember ? true : false}
          onDismiss={() => setTxModalOpen(false)}
          txError={signError}
          attemptRetry={() => isCouncilMember && handleVote()}
          content={
            isCouncilMember && (
              <ModalContent>
                <ModalItem>
                  <ModalItemTitle>{t('modals.confirm-signature.vote.title')}</ModalItemTitle>
                  <ModalItemText>
                    {t('modals.confirm-signature.vote.hash', {
                      hash: truncateAddress(proposal?.id ?? ''),
                    })}
                  </ModalItemText>
                </ModalItem>
              </ModalContent>
            )
          }
        />
      )}
    </>
  );
};

export default Content;

const Status = styled.p<{ closed: boolean; pending: boolean }>`
  color: ${(props) =>
    props.closed
      ? props.theme.colors.gray
      : props.pending
      ? props.theme.colors.yellow
      : props.theme.colors.green};
  text-transform: uppercase;
  font-family: ${(props) => props.theme.fonts.extended};
  font-size: 14px;
`;

const ProposalContainer = styled(FlexDivColCentered)`
  min-height: 400px;
`;

const Title = styled.p`
  font-family: ${(props) => props.theme.fonts.extended};
  font-size: 14px;
  text-align: center;
`;

const Description = styled.div`
  max-height: 300px;
  overflow-y: auto;
  font-size: 14px;
  text-align: center;
  font-family: ${(props) => props.theme.fonts.regular};
  margin: 16px 8px;

  ${media.greaterThan('mdUp')`
    width: 500px;
  `}

  h1 {
    font-size: 14px;
  }

  h2 {
    font-size: 14px;
  }

  h3 {
    font-size: 14px;
  }

  h4 {
    font-size: 14px;
  }

  h5 {
    font-size: 14px;
  }

  h6 {
    font-size: 14px;
  }

  a {
    color: ${(props) => props.theme.colors.blue};
    font-family: ${(props) => props.theme.fonts.interBold};
    text-decoration: none;
    font-size: 14px;
  }
`;

const OptionsContainer = styled.div`
  max-height: 200px;
  overflow-y: auto;
  ${media.greaterThan('mdUp')`
    width: 500px;
  `}
  display: grid;
  grid-template-columns: auto auto;
  column-gap: 8px;
  row-gap: 8px;
  padding-top: 16px;
`;

const Option = styled(Button)<{ selected: boolean }>`
  background-color: ${(props) =>
    props.selected ? props.theme.colors.mediumBlue : props.theme.colors.navy};
  color: ${(props) => (props.selected ? props.theme.colors.blue : props.theme.colors.white)};
  font-size: 12px;
  font-family: ${(props) => props.theme.fonts.interBold};
  text-transform: uppercase;
  text-align: center;
  align-items: center;

  width: 235px;

  p {
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
    padding: 0px 16px;
    margin: 0;
  }

  :hover {
    background-color: ${(props) => props.theme.colors.mediumBlue};
    transition: background-color 0.25s;
  }
`;
