import { Box, Heading } from '@chakra-ui/react';
import SynthetixIcon from 'components/SynthetixIcon';

const Header = () => {
  return (
    <Box background="navy.900" width="800px" height="200px">
      <SynthetixIcon />
      <Box>
        <Heading>Hello World 2</Heading>
        <Heading>Hello World 3</Heading>
        <Heading>Hello World 4</Heading>
      </Box>
    </Box>
  );
};

export default Header;
