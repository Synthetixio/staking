import { FC, useState } from 'react';
import styled from 'styled-components';
import StatBox from 'components/StatBox';
import StakedValueModal from 'sections/shared/modals/StakedValueModal';
import Connector from 'containers/Connector';

export const StakedValueBox: FC<{ title: any; value: any; isGreen?: boolean }> = ({
  title,
  value,
  isGreen,
}) => {
  const [isOpened, setIsOpened] = useState<boolean>(false);
  const { isWalletConnected } = Connector.useContainer();

  const onOpen = () => isWalletConnected; // && setIsOpened(true);
  const onDismiss = () => setIsOpened(false);

  return (
    <>
      <StakedValue onClick={onOpen} {...{ title, value, isGreen }}></StakedValue>
      <StakedValueModal {...{ value, isOpened, onDismiss }} />
    </>
  );
};

const StakedValue = styled(StatBox)<{ isGreen?: boolean }>`
  cursor: pointer;
  .title {
    color: ${(props) => (props.isGreen ? props.theme.colors.green : props.theme.colors.blue)};
  }
`;

export default StakedValueBox;
