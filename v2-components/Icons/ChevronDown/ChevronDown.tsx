import { Icon, IconProps } from '@chakra-ui/react';

interface ChevronDownProps extends IconProps {
  width?: number | string;
  height?: number | string;
}

export const ChevronDown = ({ width = '20px', height = '20px', ...props }: ChevronDownProps) => {
  return (
    <Icon width={width} height={height} color="cyan.400" viewBox="0 0 20 20" fill="none" {...props}>
      <path
        d="M9.99962 10.9766L14.1246 6.85156L15.303 8.0299L9.99962 13.3332L4.69629 8.0299L5.87462 6.85156L9.99962 10.9766Z"
        fill="currentColor"
      />
    </Icon>
  );
};
