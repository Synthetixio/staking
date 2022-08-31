import { Box, Flex, Heading, Text } from '@chakra-ui/react';
import React from 'react';
import { CRatioProgressBar } from '../c-ratio-progress-bar';

type Props = {
  liquidationCratioPercentage: number;
  targetCratioPercentage: number;
  currentCRatioPercentage: number;
};
export const CRatioHealthCard: React.FC<Props> = ({
  targetCratioPercentage,
  liquidationCratioPercentage,
  currentCRatioPercentage,
}) => {
  return (
    <Box>
      <Flex justifyContent="space-between" alignItems="center">
        <Box>
          <Heading size="md">Collateralization Ratio Health</Heading>
          <Text>In order to keep gathering rewards you must keep you C-Ratio above Target</Text>
        </Box>
        <Flex
          bg="blackAlpha.800"
          alignItems="center"
          borderRadius="md"
          border="1px"
          borderColor="gray.900"
          padding="2"
        >
          <Text color="green.400" fontSize="2xl" align="center" fontFamily="mono">
            {currentCRatioPercentage}%
          </Text>
        </Flex>
      </Flex>
      <CRatioProgressBar
        targetCratioPercentage={targetCratioPercentage}
        liquidationCratioPercentage={liquidationCratioPercentage}
        currentCRatioPercentage={currentCRatioPercentage}
      />
    </Box>
  );
};
