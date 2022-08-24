import { Icon } from '@chakra-ui/react';

interface ChevronLeftProps {
  width?: number;
  height?: number;
  color?: string;
}

const ChevronLeft = ({ width = 25, height = 24, color = 'white' }: ChevronLeftProps) => {
  return (
    <Icon width={`${width}px`} height={`${height}px`} viewBox="0 0 25 24" fill="none">
      <path
        d="M11.1844 12L16.1344 16.95L14.7204 18.364L8.35645 12L14.7204 5.63599L16.1344 7.04999L11.1844 12Z"
        fill={color}
      />
    </Icon>
  );
};

export default ChevronLeft;
