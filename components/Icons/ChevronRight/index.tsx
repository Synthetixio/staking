import { Icon } from '@chakra-ui/react';

interface ChevronRightProps {
  width?: number;
  height?: number;
  color?: string;
}

const ChevronRight = ({ width = 25, height = 24, color = 'white' }: ChevronRightProps) => {
  return (
    <Icon width={`${width}px`} height={`${height}px`} viewBox="0 0 25 24" fill="none">
      <path
        d="M13.5284 12L8.57837 7.04999L9.99237 5.63599L16.3564 12L9.99237 18.364L8.57837 16.95L13.5284 12Z"
        fill={color}
      />
    </Icon>
  );
};

export default ChevronRight;
