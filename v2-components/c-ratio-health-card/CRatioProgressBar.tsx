import { Box, Text, Progress, Tooltip } from '@chakra-ui/react';
import React, { FC } from 'react';
import { InfoIcon, TriangleDownIcon, TriangleUpIcon } from '../icons';
import { getVariant } from './getVariant';

const LineWithText: FC<{ left: number; text: string; tooltipText: string }> = ({
  left,
  text,
  tooltipText,
}) => {
  return (
    <>
      <Box
        position="absolute"
        height="40%"
        transform="translateX(-50%)"
        left={`${left}%`}
        top={0}
        bottom={0}
        margin="auto"
      >
        <Text whiteSpace="nowrap" fontSize="xx-small" transform="translateY(calc(-100% - 10px) )">
          {text}{' '}
          <Tooltip label={tooltipText}>
            <InfoIcon />
          </Tooltip>
        </Text>
      </Box>
      <Box
        position="absolute"
        height="40%"
        width="1px"
        bg="gray.400"
        left={`${left}%`}
        top={0}
        bottom={0}
        margin="auto"
      />
    </>
  );
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
    <Box position="relative" height="100px" width="full">
      <LineWithText
        left={liquidationCratioPercentage / scaleFactor}
        text={`Liquidated < ${liquidationCratioPercentage}%`}
        tooltipText="You may be flagged for liquidation"
      />
      <LineWithText
        left={targetCratioPercentage / scaleFactor}
        text={`Target ${targetCratioPercentage}%`}
        tooltipText="Required to claim rewards"
      />
      <Progress
        variant={variant}
        top={0}
        bottom={0}
        height="12px"
        position="absolute"
        margin="auto"
        width="100%"
        value={currentCRatioPercentage / scaleFactor}
      />
      <Box
        bg={variant}
        height="12px"
        position="absolute"
        left={`${currentCRatioPercentage / scaleFactor}%`}
        top={0}
        bottom={0}
        margin="auto"
      >
        <TriangleDownIcon
          position="absolute"
          right={0}
          top={0}
          transform="translate(50%,-100%)"
          color={variant}
        />
        <TriangleUpIcon
          position="absolute"
          right={0}
          bottom={0}
          transform="translate(50%,100%)"
          color={variant}
        />
      </Box>
    </Box>
  );
};
