import { Icon } from '@chakra-ui/react';

interface ChevronDownProps {
  width?: number;
  height?: number;
  color?: string;
}

const ChevronDown = ({ width = 25, height = 24, color = 'white' }: ChevronDownProps) => {
  return (
    <Icon width={`${width}px`} height={`${height}px`} viewBox="0 0 25 24" fill="none">
      <path
        d="M12.3564 13.1719L17.3064 8.22192L18.7204 9.63592L12.3564 15.9999L5.99243 9.63592L7.40643 8.22192L12.3564 13.1719Z"
        fill={color}
      />
    </Icon>
  );
};

export default ChevronDown;
