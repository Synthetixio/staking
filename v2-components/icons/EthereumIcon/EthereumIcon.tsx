import { Icon } from '@chakra-ui/react';

interface EthereumIconProps {
  width?: number | string;
  height?: number | string;
  color?: string;
  fill?: string;
}

export const EthereumIcon = ({
  width = '24px',
  height = '24px',
  color = 'white',
  fill = '#627EEA',
}: EthereumIconProps) => {
  return (
    <Icon width={width} height={height} viewBox="0 0 34 34" fill="none">
      <path
        d="M17 34C26.3888 34 34 26.3888 34 17C34 7.61116 26.3888 0 17 0C7.61116 0 0 7.61116 0 17C0 26.3888 7.61116 34 17 34Z"
        fill={fill}
      />
      <path
        d="M17.5293 4.25V13.6744L25.4949 17.2337L17.5293 4.25Z"
        fill={color}
        fillOpacity="0.602"
      />
      <path d="M17.5291 4.25L9.5625 17.2337L17.5291 13.6744V4.25Z" fill="white" />
      <path
        d="M17.5293 23.3408V29.7445L25.5002 18.7168L17.5293 23.3408Z"
        fill={color}
        fillOpacity="0.602"
      />
      <path d="M17.5291 29.7445V23.3397L9.5625 18.7168L17.5291 29.7445Z" fill="white" />
      <path
        d="M17.5293 21.8591L25.4949 17.234L17.5293 13.6768V21.8591Z"
        fill={color}
        fillOpacity="0.2"
      />
      <path
        d="M9.5625 17.234L17.5291 21.8591V13.6768L9.5625 17.234Z"
        fill={color}
        fillOpacity="0.602"
      />
    </Icon>
  );
};
