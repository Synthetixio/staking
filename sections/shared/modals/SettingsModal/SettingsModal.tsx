import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import styled from 'styled-components';

import { FlexDivRowCentered } from 'styles/common';

import { MenuModal } from '../common';

import { OPTIONS } from './constants';

type SettingsModalProps = {
  onDismiss: () => void;
};

export const SettingsModal: FC<SettingsModalProps> = ({ onDismiss }) => {
  const { t } = useTranslation();

  return (
    <StyledMenuModal onDismiss={onDismiss} isOpen={true} title={t('modals.settings.title')}>
      <Options>
        {OPTIONS.map(({ id, label, SelectComponent }) => (
          <OptionRow key={id}>
            <OptionLabel>{t(label)}</OptionLabel>
            <CurrencySelectContainer>
              <SelectComponent />
            </CurrencySelectContainer>
          </OptionRow>
        ))}
      </Options>
    </StyledMenuModal>
  );
};

const StyledMenuModal = styled(MenuModal)`
  [data-reach-dialog-content] {
    width: 348px;
  }
`;

const Options = styled.div``;

const OptionLabel = styled.div`
  font-family: ${(props) => props.theme.fonts.interBold};
  color: ${(props) => props.theme.colors.white};
  text-transform: capitalize;
  font-size: 12px;
`;

const OptionRow = styled(FlexDivRowCentered)`
  padding-bottom: 16px;
`;

const CurrencySelectContainer = styled.div`
  width: 150px;
`;

export default SettingsModal;
