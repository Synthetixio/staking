import { Center, Flex, Text } from '@chakra-ui/react';
import { theme } from '@synthetixio/v3-theme';
import React, { FC, PropsWithChildren } from 'react';

type Props = {
  variant: 'success' | 'warning' | 'error';
  text: string;
  countDown?: string;
};

const VariantToBox: FC<PropsWithChildren<{ variant: Props['variant'] }>> = ({
  variant,
  children,
}) => {
  if (variant === 'success') {
    return <Center bgGradient={theme.gradients['green-cyan'][500]}>{children}</Center>;
  }
  if (variant === 'warning') {
    return <Center bgGradient={theme.gradients['orange'][500]}>{children}</Center>;
  }
  if (variant === 'error') {
    return <Center bg="red.400">{children}</Center>;
  }
  return null;
};
export const Banner: FC<Props> = ({ text, variant, countDown }) => {
  return (
    <VariantToBox variant={variant}>
      <Flex
        margin="2"
        paddingTop="1"
        paddingBottom="1"
        paddingLeft="5"
        paddingRight="5"
        bg="blackAlpha.600"
        borderRadius="5"
        width="fit-content"
      >
        <Text>{text}</Text>{' '}
        <Text marginLeft="2" as="b">
          {countDown}
        </Text>
      </Flex>
    </VariantToBox>
  );
};
