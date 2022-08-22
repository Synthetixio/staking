import { InfoIcon } from '@chakra-ui/icons';
import { Container, Fade, Text } from '@chakra-ui/react';

interface AlterProps {
  text: string;
}

export default function Alert({ text }: AlterProps) {
  return (
    <Fade in={true}>
      <Container
        borderLeftWidth={5}
        borderLeftStyle="solid"
        borderLeftColor="cyan.500"
        borderRadius={5}
        display="flex"
        alignItems="center"
        padding={1}
        paddingLeft={3}
        bg="blue.900"
      >
        <InfoIcon w={4} h={4} color="cyan.500" marginRight={3} />
        <Text fontSize="sm" fontFamily="body">
          {text}
        </Text>
      </Container>
    </Fade>
  );
}
