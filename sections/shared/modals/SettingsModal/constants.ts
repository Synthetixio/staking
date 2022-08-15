import PriceCurrencySelect from './PriceCurrencySelect';
import LanguageSelect from './LanguageSelect';

export const OPTIONS = [
  {
    id: 'currency-options',
    label: 'modals.settings.options.currency',
    SelectComponent: PriceCurrencySelect,
  },
  {
    id: 'language-options',
    label: 'modals.settings.options.language',
    SelectComponent: LanguageSelect,
  },
];
