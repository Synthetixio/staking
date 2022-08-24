import { Icon } from '@chakra-ui/react';

interface ChevronUpProps {
  width?: number;
  height?: number;
  color?: string;
}

const ChevronUp = ({ width = 25, height = 24, color = 'white' }: ChevronUpProps) => {
  return (
    <Icon width={`${width}px`} height={`${height}px`} viewBox="0 0 25 24" fill="none">
      <path
        d="M12.3564 10.828L7.40643 15.778L5.99243 14.364L12.3564 8L18.7204 14.364L17.3064 15.778L12.3564 10.828Z"
        fill={color}
      />
    </Icon>
  );
};

export default ChevronUp;
