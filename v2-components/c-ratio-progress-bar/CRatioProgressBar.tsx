import { Box, Text, useToken } from '@chakra-ui/react';
import React, { FC } from 'react';
import { InfoIcon, TriangleDownIcon, TriangleUpIcon } from '@chakra-ui/icons';

const LineWithText: FC<{ left: number; text: string }> = ({ left, text }) => {
  return (
    <>
      <Box
        position={'absolute'}
        height={'40%'}
        transform={'translateX(-50%)'}
        left={`${left}%`}
        top={0}
        bottom={0}
        margin={'auto'}
      >
        <Text
          whiteSpace={'nowrap'}
          fontSize={'xx-small'}
          transform={'translateY(calc(-100% - 10px) )'}
        >
          {text} <InfoIcon />
        </Text>
      </Box>
      <Box
        position={'absolute'}
        height={'40%'}
        width={'1px'}
        bg={'gray.400'}
        left={`${left}%`}
        top={0}
        bottom={0}
        margin={'auto'}
        whiteSpace={'nowrap'}
        fontSize={'xx-small'}
      />
    </>
  );
};

const getVariant = ({
  targetCratioPercentage,
  liquidationCratioPercentage,
  currentCRatioPercentage,
}: Props) => {
  if (currentCRatioPercentage < liquidationCratioPercentage) return 'error';
  if (currentCRatioPercentage < targetCratioPercentage) return 'warning';
  return 'success';
};

type Props = {
  liquidationCratioPercentage: number;
  targetCratioPercentage: number;
  currentCRatioPercentage: number;
};

export const CRatioProgressBar: FC<Props> = ({
  targetCratioPercentage,
  liquidationCratioPercentage,
  currentCRatioPercentage,
}) => {
  const maxRatioShown = Math.max(targetCratioPercentage, currentCRatioPercentage) * 1.1;
  const scaleFactor = maxRatioShown / 100;
  const variant = getVariant({
    targetCratioPercentage,
    liquidationCratioPercentage,
    currentCRatioPercentage,
  });

  return (
    <Box position={'relative'} height={'100px'} width={'full'}>
      <LineWithText
        left={liquidationCratioPercentage / scaleFactor}
        text={`Liquidated < ${liquidationCratioPercentage}%`}
      />
      <LineWithText
        left={targetCratioPercentage / scaleFactor}
        text={`Target ${targetCratioPercentage}%`}
      />

      <Box
        bg={'whiteAlpha.100'}
        height={'12px'}
        position={'absolute'}
        width={'full'}
        top={0}
        bottom={0}
        margin={'auto'}
      />
      <Box
        bg={color}
        height={'12px'}
        position={'absolute'}
        width={`${currentCRatioPercentage / scaleFactor}%`}
        top={0}
        bottom={0}
        margin={'auto'}
        boxShadow={`0px 0px 15px ${hexColor}`}
      />
      <Box
        bg={variant}
        height={'12px'}
        position={'absolute'}
        left={`${currentCRatioPercentage / scaleFactor}%`}
        top={0}
        bottom={0}
        margin={'auto'}
      >
        <TriangleDownIcon
          position={'absolute'}
          right={0}
          top={0}
          transform={'translate(50%,-100%)'}
          color={variant}
        />
        <TriangleUpIcon
          position={'absolute'}
          right={0}
          bottom={0}
          transform={'translate(50%,100%)'}
          color={variant}
        />
      </Box>
    </Box>
  );
};
