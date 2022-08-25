import InputBadge from 'components/InputBadge';
import Head from 'next/head';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

export default function BurnDebt() {
  const { t } = useTranslation();
  const [active, setActive] = useState(false);
  return (
    <>
      <Head>
        <title>{t('burn.title')}</title>
      </Head>
      <InputBadge
        colorScheme="whiteAlpha"
        text="test"
        onClick={() => setActive(!active)}
        onClickIcon={() => {}}
        active={active}
      />
    </>
  );
}
