import { InfoIcon } from '@chakra-ui/icons';
import { Badge, BadgeProps, Fade, Flex, Text } from '@chakra-ui/react';
import { PropsWithChildren } from 'react';

interface InputBadgeProps {
  colorScheme?: BadgeProps['colorScheme'];
  text: string;
  onClickIcon?: () => void;
  onClick?: () => void;
  active: boolean;
}

export default function InputBadge({
  colorScheme,
  text,
  onClickIcon,
  onClick,
  active,
}: PropsWithChildren<InputBadgeProps>) {
  return (
    <Fade in>
      <Badge
        colorScheme={active ? 'cyan' : colorScheme}
        padding="1.5"
        variant={active ? 'solid' : 'subtle'}
        onClick={onClick}
        w="100%"
        minW={170}
        cursor="pointer"
      >
        <Flex justify="space-between" align="center">
          <Text
            fontSize="xs"
            color={active ? 'black' : 'cyan.500'}
            fontFamily="body"
            userSelect="none"
          >
            {text}
          </Text>
          {onClickIcon && (
            <InfoIcon w={4} h={4} color={active ? 'black' : 'cyan.500'} onClick={onClickIcon} />
          )}
        </Flex>
      </Badge>
    </Fade>
  );
}
