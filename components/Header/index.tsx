import { Box, Heading } from '@chakra-ui/react';
import SynthetixIcon from 'components/SynthetixIcon';

const Header = () => {
  return (
    <Box background="navy.900" width="800px" height="200px">
      <SynthetixIcon />
      <Heading>Hello World 2</Heading>
    </Box>
  );
};

export default Header;
