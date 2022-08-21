import { FC } from 'react';
import styled from 'styled-components';
import { useTranslation } from 'react-i18next';
import media from 'styles/media';

import Button from 'components/Button';
import { ACTIONS } from '@synthetixio/queries';

type SelectorProps = {
  action: string;
  setAction: Function;
};

const Selector: FC<SelectorProps> = ({ action, setAction }) => {
  const { t } = useTranslation();
  return (
    <Container>
      {ACTIONS.map((actionId) => (
        <ActionButton
          key={actionId}
          variant="solid"
          data-testid={`action-${t(`common.delegate-actions.actions.${actionId}`)}`}
          onClick={() => {
            setAction(actionId);
          }}
          isActive={actionId === action}
        >
          {t(`common.delegate-actions.actions.${actionId}`)}
        </ActionButton>
      ))}
    </Container>
  );
};

const Container = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: ${'1fr '.repeat(ACTIONS.length)};
  grid-column-gap: 5px;
`;

const ActionButton = styled(Button)`
  width: auto;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: ${(props) => props.theme.fonts.interBold};
  font-size: 12px;
  color: ${(props) => props.theme.colors[props.isActive ? 'white' : 'gray']};
  text-transform: uppercase;

  ${media.lessThan('sm')`
    padding: 0;
  `}
`;

export default Selector;
