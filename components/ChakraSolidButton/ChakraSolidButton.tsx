import { Button } from '@chakra-ui/react';
import { FC } from 'react';
//
const ChakraSolidButton: FC = ({ children }) => {
  return (
    <Button p={2} bg={'salmon'} variant="solid">
      {children}
    </Button>
  );
};
export default ChakraSolidButton;
