import { Icon, IconProps } from '@chakra-ui/react';

interface TriangleUpIconProps extends IconProps {
  width?: number | string;
  height?: number | string;
}

export const TriangleUpIcon = ({
  width = '25px',
  height = '24px',
  color = 'white',
  ...props
}: TriangleUpIconProps) => {
  return (
    <Icon width={width} height={height} viewBox="0 0 25 24" fill="none" color={color} {...props}>
      <path d="M12.3564 8L18.3564 14H6.35645L12.3564 8Z" fill="currentColor" />
    </Icon>
  );
};
