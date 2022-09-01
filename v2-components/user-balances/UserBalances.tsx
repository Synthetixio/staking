import { Center, Text, Skeleton } from '@chakra-ui/react';
import Wei, { wei } from '@synthetixio/wei';
import { SNXIcon, SUSDIcon } from '../icons';

interface UserBalancesProps {
  isSnxLoading: boolean;
  snxBalance: Wei;
  isSusdLoading: boolean;
  susdBalance: Wei;
}

export const UserBalances = ({
  snxBalance = wei(0),
  susdBalance = wei(0),
  isSnxLoading = false,
  isSusdLoading = false,
}: UserBalancesProps) => {
  // Add query hook here on integration
  return (
    <>
      <Center
        borderWidth="1px"
        borderRadius="4px"
        borderRightRadius="0px"
        borderBottomRightRadius="0px"
        borderRightWidth="0px"
        borderColor="gray.900"
        py="6px"
        px="9.5px"
        height={10}
        minWidth={110}
      >
        <SNXIcon />
        <Skeleton ml={2} isLoaded={!isSnxLoading}>
          <Text variant="nav">{snxBalance.toString(2)}</Text>
        </Skeleton>
      </Center>
      <Center
        borderWidth="1px"
        borderRadius="4px"
        borderLeftWidth="1px"
        borderLeftRadius="0px"
        borderBottomLeftRadius="0px"
        borderColor="gray.900"
        py={'6px'}
        px={'9.5px'}
        height={10}
        minWidth={110}
      >
        <SUSDIcon />
        <Skeleton ml={2} isLoaded={!isSusdLoading}>
          <Text variant="nav">{susdBalance.toString(2)}</Text>
        </Skeleton>
      </Center>
    </>
  );
};
