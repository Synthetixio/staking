import { useState } from 'react';
import SettingsModal from 'sections/shared/modals/SettingsModal';
import { useTranslation } from 'react-i18next';
import { MenuLinkItem } from '../SideNav/Desktop/DesktopMenu';

export default function Settings() {
  const [settingsModalOpened, setSettingsModalOpened] = useState(false);
  const { t } = useTranslation();
  return (
    <>
      <MenuLinkItem
        onClick={() => {
          setSettingsModalOpened(!settingsModalOpened);
        }}
        data-testid="sidenav-settings"
      >
        <div className="link">{t('sidenav.settings')}</div>
      </MenuLinkItem>
      {settingsModalOpened && <SettingsModal onDismiss={() => setSettingsModalOpened(false)} />}
    </>
  );
}
