import { FC, useState } from 'react';
import styled from 'styled-components';

import StatBox from 'components/StatBox';
import DebtValueModal from 'sections/shared/modals/DebtValueModal';
import { Size } from 'components/StatBox/StatBox';
import Connector from 'containers/Connector';

export const DebtValueBox: FC<{
  title: any;
  value: any;
  isGreen?: boolean;
  isPink?: boolean;
  size?: Size;
}> = ({ title, value, isGreen, isPink, size }) => {
  const [isOpened, setIsOpened] = useState<boolean>(false);

  const { isWalletConnected } = Connector.useContainer();

  const onOpen = () => isWalletConnected; //  && setIsOpened(true);
  const onDismiss = () => setIsOpened(false);

  return (
    <>
      <DebtValue
        onClick={onOpen}
        isLarge={size === 'lg'}
        {...{ title, value, isGreen, isPink, size }}
      ></DebtValue>
      <DebtValueModal {...{ value, isOpened, onDismiss }} />
    </>
  );
};

const DebtValue = styled(StatBox)<{ isGreen?: boolean; isPink?: boolean; isLarge: boolean }>`
  cursor: pointer;
  
  .title {
    color: ${(props) =>
      props.isGreen
        ? props.theme.colors.green
        : props.isPink
        ? props.theme.colors.pink
        : props.theme.colors.blue};
  }
  
  .value {
    text-shadow: ${(props) =>
      !props.isLarge
        ? 'unset'
        : props.isGreen
        ? props.theme.colors.greenTextShadow
        : props.isPink
        ? props.theme.colors.pinkTextShadow
        : props.theme.colors.blueTextShadow}
    color: ${(props) => (!props.isLarge ? 'unset' : props.theme.colors.navy)};
  }
`;

export default DebtValueBox;
