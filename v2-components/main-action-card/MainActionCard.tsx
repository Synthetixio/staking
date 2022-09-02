import { Badge, Box, Button, Flex, Heading, Stack, Text } from '@chakra-ui/react';
import React, { PropsWithChildren, ReactNode } from 'react';
import { getVariant } from '../c-ratio-health-card/getVariant';
import { InfoIcon } from '../icons';
import { CollectIcon } from '../icons/CollectIcon/CollectIcon';
import { MaintainIcon } from '../icons/MaintainIcon/MaintainIcon';
import { StakeIcon } from '../icons/StakeIcon/StakeIcon';

const CardHeader = ({
  step,
  headingText,
  bodyText,
  icon,
}: PropsWithChildren<{ step: number; headingText: string; bodyText: string; icon: ReactNode }>) => {
  return (
    <Box>
      <Flex alignItems={'center'} justifyContent={'space-between'}>
        <Text fontSize="4xl" fontFamily="mono">
          {step}
        </Text>
        {icon}
      </Flex>
      <Heading fontSize={'sm'}>{headingText}</Heading>
      <Text color={'whiteAlpha.700'} fontSize={'xs'}>
        {bodyText}
      </Text>
    </Box>
  );
};

const Container = ({ children }: PropsWithChildren<{}>) => {
  return (
    <Flex
      flexDirection="column"
      justifyContent="space-between"
      width="72"
      height="56"
      alignItems="space-between"
      border={'1px'}
      borderColor="gray.800"
      padding="2"
      borderRadius="sm"
    >
      {children}
    </Flex>
  );
};

const StakeActionCard: React.FC<Props> = ({ isStaking }) => {
  return (
    <Container>
      <CardHeader
        step={1}
        headingText="Stake & Borrow"
        bodyText="Mint sUSD by staking your SNX."
        icon={<StakeIcon />}
      />
      {isStaking ? (
        <Button
          onClick={() => {
            console.log('navigate to stake and borrow more');
          }}
          mb="2"
          variant="link"
        >
          {'Stake & Borrow More'}
        </Button>
      ) : (
        <Button
          onClick={() => {
            console.log('navigate to stake and borrow more');
          }}
          variant={'solid'}
        >
          Start Staking
        </Button>
      )}
    </Container>
  );
};
const MaintainActionCard: React.FC<Props & { isFlagged: boolean }> = ({
  liquidationCratioPercentage,
  targetCratioPercentage,
  currentCRatioPercentage,
  isStaking,
  isFlagged,
}) => {
  const variant = getVariant({
    liquidationCratioPercentage,
    targetCratioPercentage,
    currentCRatioPercentage,
  });

  return (
    <Container>
      <CardHeader
        step={2}
        headingText="Maintain Collateralization Ratio"
        bodyText="Maintain your Collateralization Health."
        icon={<MaintainIcon />}
      />
      <Badge
        color={variant}
        bg="blackAlpha.600"
        border={'1px'}
        borderColor={variant}
        display="flex"
        alignItems={'center'}
        width="fit-content"
        margin={'0 auto'}
        fontSize="x-small"
        borderRadius={'base'}
        fontWeight="700"
      >
        <InfoIcon color={variant} width="10px" height="10px" />
        <Text ml="0.5">
          {variant !== 'success'
            ? 'Adjust to collect weekly rewards'
            : 'Your ratio is looking healthy!'}
        </Text>
      </Badge>
      {!isStaking || variant === 'success' ? (
        <Button
          mb="2"
          variant="link"
          onClick={() => {
            isStaking ? console.log('navigate to maintain page') : console.log('C-Ratio explained');
          }}
        >
          {isStaking ? 'Maintain' : 'C-Ratio explained'}
        </Button>
      ) : (
        <Button
          onClick={() => {
            console.log('navigate to maintain page');
          }}
          variant={variant}
        >
          {isFlagged ? 'Unflag' : 'Maintain'}
        </Button>
      )}
    </Container>
  );
};
const CollectActionCard: React.FC<Props> = ({
  liquidationCratioPercentage,
  targetCratioPercentage,
  currentCRatioPercentage,
  isStaking,
  epoch,
  hasClaimed,
}) => {
  const variant = getVariant({
    liquidationCratioPercentage,
    targetCratioPercentage,
    currentCRatioPercentage,
  });
  const canClaim = !hasClaimed && variant === 'success';
  return (
    <Container>
      <CardHeader
        step={3}
        headingText="Collect Rewards"
        bodyText="Maintain your target C-Ratio to collect your weekly rewards."
        icon={<CollectIcon />}
      />
      {isStaking && (
        <Flex justifyContent={'space-between'}>
          <Flex flexDirection={'column'}>
            <Flex alignItems={'center'}>
              <Text color={'whiteAlpha.700'} fontSize={'xs'} mr="1" fontWeight="700">
                EPOCH
              </Text>
              <InfoIcon width="10px" height="10px" />
            </Flex>
            <Text color={'success'} fontSize={'md'} fontFamily={'mono'}>
              {epoch}
            </Text>
          </Flex>
          {canClaim && (
            <Flex flexDirection={'column'}>
              <Text color={'whiteAlpha.700'} fontSize={'xs'} mr="1" fontWeight="700">
                SNX Price
              </Text>

              <Text color={'success'} fontSize={'md'} fontFamily={'mono'}>
                {'$6.00'}
              </Text>
            </Flex>
          )}
        </Flex>
      )}
      {isStaking ? (
        <Button
          onClick={() => {
            console.log('navigate to claim page');
          }}
          variant={canClaim ? variant : 'disabled'}
          disabled={!canClaim}
        >
          {'Claim your rewards'}
        </Button>
      ) : (
        <Button
          onClick={() => {
            console.log('navigate to Rewards explained');
          }}
          mb="2"
          variant="link"
        >
          {'Rewards explained'}
        </Button>
      )}
    </Container>
  );
};

type Props = {
  liquidationCratioPercentage: number;
  targetCratioPercentage: number;
  currentCRatioPercentage: number;
  isStaking: boolean;
  isFlagged: boolean;
  epoch: string;
  hasClaimed: boolean;
};
export const MainActionCard: React.FC<Props> = (props) => {
  return (
    <Stack direction={['column', 'row']} spacing="14px">
      <StakeActionCard {...props}></StakeActionCard>
      <MaintainActionCard {...props}></MaintainActionCard>
      <CollectActionCard {...props}></CollectActionCard>
    </Stack>
  );
};
