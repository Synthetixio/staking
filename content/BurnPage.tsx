import InputBadge from 'components/InputBadge';
import Head from 'next/head';
import { useTranslation } from 'react-i18next';

export default function BurnDebt() {
  const { t } = useTranslation();
  return (
    <>
      <Head>
        <title>{t('burn.title')}</title>
      </Head>
      <InputBadge colorScheme="whiteAlpha" text="test" onClickIcon={() => {}} />
    </>
  );
}
