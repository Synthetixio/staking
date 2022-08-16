import React from 'react';
import { components, IndicatorProps } from 'react-select';

import CaretDownIcon from 'assets/svg/app/caret-down.svg';
import CloseIcon from 'assets/svg/app/menu-close.svg';

export const IndicatorSeparator = () => null;

export const DropdownIndicator = (props: IndicatorProps<any>) => (
  <components.DropdownIndicator {...props}>
    <CaretDownIcon width="16" />
  </components.DropdownIndicator>
);

export const MultiValueRemove = (props: IndicatorProps<any>) => (
  <components.MultiValueRemove {...props}>
    <span
      style={{ display: 'inline-block', lineHeight: 1, paddingLeft: '4px', paddingRight: '4px' }}
    >
      <CloseIcon width="19" />
    </span>
  </components.MultiValueRemove>
);
