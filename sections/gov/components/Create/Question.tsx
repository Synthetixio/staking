import React, { useMemo } from 'react';
import styled from 'styled-components';
import { Remarkable } from 'remarkable';
import { linkify } from 'remarkable/linkify';
import externalLink from 'remarkable-external-link';

import NavigationBack from 'assets/svg/app/navigation-back.svg';
import Success from 'assets/svg/app/success.svg';
import PendingConfirmation from 'assets/svg/app/pending-confirmation.svg';

import Input, { inputCSS } from 'components/Input/Input';
import { Divider, FlexDivColCentered, IconButton } from 'styles/common';
import media from 'styles/media';
import {
  InputContainer,
  Container,
  HeaderRow,
  Header,
  StyledCTA,
  WhiteSubheader,
  ButtonSpacer,
  DismissButton,
  GreyHeader,
} from '../common';
import { useTranslation } from 'react-i18next';
import { Transaction } from 'constants/network';
import { truncateAddress } from 'utils/formatters/string';
import TxState from 'sections/gov/components/TxState';
import { SPACE_KEY } from 'constants/snapshot';

type QuestionProps = {
  onBack: Function;
  setBody: Function;
  setName: Function;
  body: string;
  name: string;
  handleCreate: () => void;
  result: any;
  validSubmission: boolean;
  signTransactionState: Transaction;
  setSignTransactionState: Function;
  hash: string | null;
};

const Question: React.FC<QuestionProps> = ({
  onBack,
  setBody,
  setName,
  body,
  name,
  handleCreate,
  validSubmission,
  signTransactionState,
  setSignTransactionState,
  hash,
}) => {
  const { t } = useTranslation();

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

  const returnButtonStates = useMemo(() => {
    if (!validSubmission) {
      return (
        <StyledCTA disabled={true} variant="primary">
          {t('gov.create.action.invalid')}
        </StyledCTA>
      );
    } else
      return (
        <StyledCTA onClick={() => handleCreate()} variant="primary">
          {t('gov.create.action.idle')}
        </StyledCTA>
      );
  }, [handleCreate, t, validSubmission]);

  if (signTransactionState === Transaction.WAITING) {
    return (
      <TxState
        title={t('gov.actions.propose.waiting')}
        content={
          <FlexDivColCentered>
            <PendingConfirmation width="78" />
            <GreyHeader>{t('gov.actions.propose.signing')}</GreyHeader>
            <WhiteSubheader>
              {t('gov.actions.propose.space', {
                space: SPACE_KEY.PROPOSAL,
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
        title={t('gov.actions.propose.success')}
        content={
          <FlexDivColCentered>
            <Success width="78" />
            <GreyHeader>{t('gov.actions.propose.signed')}</GreyHeader>
            <WhiteSubheader>
              {t('gov.actions.propose.hash', {
                hash: truncateAddress(hash ?? ''),
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
    <>
      <Container>
        <InputContainer>
          <HeaderRow>
            <IconButton onClick={() => onBack()}>
              <NavigationBack width="16" />
            </IconButton>
            <Header>{t('gov.create.title')}</Header>
            <div />
          </HeaderRow>
          <CreateContainer>
            <Title
              placeholder={t('gov.create.question')}
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <Description
              placeholder={t('gov.create.description')}
              value={body}
              onChange={(e) => setBody(e.target.value)}
            />
            <Divider />
            <Header>{t('gov.create.preview')}</Header>
            <Preview dangerouslySetInnerHTML={getRawMarkup(body)} />
          </CreateContainer>
        </InputContainer>
        <ActionContainer>{returnButtonStates}</ActionContainer>
      </Container>
    </>
  );
};
export default Question;

const ActionContainer = styled.div``;

const CreateContainer = styled(FlexDivColCentered)``;

const Title = styled(Input)`
  font-family: ${(props) => props.theme.fonts.extended};
  font-size: 24px;
  text-align: center;
  margin: 16px 0px;
`;

const Description = styled.textarea`
  ${inputCSS}
  resize: none;
  font-family: ${(props) => props.theme.fonts.regular};
  font-size: 14px;
  text-align: center;
  margin: 16px 0px;
  height: 200px;

  ${media.greaterThan('mdUp')`
    width: 500px;
  `}
`;

const Preview = styled.div`
  font-family: ${(props) => props.theme.fonts.regular};
  color: ${(props) => props.theme.colors.white};
  font-size: 14px;
  margin: 16px 0px;
  text-align: center;
  max-height: 300px;
  overflow-y: auto;

  ${media.greaterThan('mdUp')`
    width: 500px;
  `}

  a {
    color: ${(props) => props.theme.colors.blue};
  }
`;
