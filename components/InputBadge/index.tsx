import { InfoIcon } from '@chakra-ui/icons';
import { Badge, BadgeProps, Flex, Text } from '@chakra-ui/react';
import { PropsWithChildren } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

interface InputBadgeProps {
  colorScheme?: BadgeProps['colorScheme'];
  text: string;
  onClickIcon?: () => void;
  onClick?: () => void;
}

export default function InputBadge({
  colorScheme,
  text,
  onClickIcon,
  onClick,
}: PropsWithChildren<InputBadgeProps>) {
  return (
    <StyledAnimatedWrapper animate={{ x: 100 }} transition={{ ease: 'easeOut', duration: 1 }}>
      <Badge colorScheme={colorScheme} padding="1.5" onClick={onClick} minWidth={170}>
        <Flex justify="space-between" align="center">
          <Text fontSize="xs" color="cyan.500" fontFamily="body">
            {text}
          </Text>
          {onClickIcon && <InfoIcon w={4} h={4} color="cyan.500" onClick={onClickIcon} />}
        </Flex>
      </Badge>
    </StyledAnimatedWrapper>
  );
}

const StyledAnimatedWrapper = styled(motion.div)`
  min-width: 170px;
  border: 1px solid black;
  cursor: pointer;
`;
