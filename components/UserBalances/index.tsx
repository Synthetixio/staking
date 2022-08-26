import { Center, Text, Skeleton } from '@chakra-ui/react';
import { SNXIcon, SUSDIcon } from 'components/Icons';

interface UserBalancesProps {
  snxBalance: number;
  susdBalance: number;
}

const UserBalances = ({ snxBalance = 0, susdBalance = 0 }: UserBalancesProps) => {
  //styleName: text-sm/lineHeight-5/font-semibold;
  // font-family: Inter;
  // font-size: 14px;
  // font-weight: 600;
  // line-height: 20px;
  // letter-spacing: 0em;
  // text-align: left;

  return (
    <>
      <Center
        borderWidth="1px"
        borderRadius="4px"
        borderRightRadius="0px"
        borderBottomRightRadius="0px"
        borderRightWidth="0.5px"
        borderColor="gray.900"
        py={'6px'}
        px={'9.5px'}
        height={10}
      >
        <SNXIcon />
        <Skeleton ml={2}>
          <Text ml={2} fontFamily="Inter">
            {snxBalance}
          </Text>
        </Skeleton>
      </Center>
      <Center
        borderWidth="1px"
        borderRadius="4px"
        borderLeftWidth="0.5px"
        borderLeftRadius="0px"
        borderBottomLeftRadius="0px"
        borderColor="gray.900"
        py={'6px'}
        px={'9.5px'}
        height={10}
      >
        <SUSDIcon />
        <Skeleton ml={2}>
          <Text ml={2} fontFamily="inter">
            {susdBalance}
          </Text>
        </Skeleton>
      </Center>
    </>
  );
};

export default UserBalances;
