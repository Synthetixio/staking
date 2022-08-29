import { Icon, IconProps } from '@chakra-ui/react';

interface ChevronUpProps extends IconProps {
  width?: number | string;
  height?: number | string;
}

const ChevronUp = ({ width = '25px', height = '24px', ...props }: ChevronUpProps) => {
  return (
    <Icon width={width} height={height} color="cyan.400" viewBox="0 0 25 24" fill="none" {...props}>
      <path
        d="M12.3564 10.828L7.40643 15.778L5.99243 14.364L12.3564 8L18.7204 14.364L17.3064 15.778L12.3564 10.828Z"
        fill="currentColor"
      />
    </Icon>
  );
};

export default ChevronUp;
