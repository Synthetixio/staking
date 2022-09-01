import { Box, Flex, Heading, Text } from '@chakra-ui/react';
import React from 'react';
import { CRatioProgressBar } from './CRatioProgressBar';
import { getVariant } from './getVariant';

type Props = {
  liquidationCratioPercentage: number;
  targetCratioPercentage: number;
  currentCRatioPercentage: number;
};
export const CRatioHealthCard: React.FC<Props> = ({
  targetCratioPercentage,
  liquidationCratioPercentage,
  currentCRatioPercentage,
}) => (
  <Box>
    <Flex justifyContent="space-between" alignItems="center" marginBottom="2">
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
        <Text
          color={getVariant({
            targetCratioPercentage,
            liquidationCratioPercentage,
            currentCRatioPercentage,
          })}
          fontSize="2xl"
          align="center"
          fontFamily="mono"
        >
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
