import { Icon, IconProps } from '@chakra-ui/react';

interface InfoIconProps extends IconProps {
  width?: string | number;
  height?: string | number;
}

export const InfoIcon = ({ width = '20px', height = '20px', color = 'white' }: InfoIconProps) => {
  return (
    <Icon width={width} height={height} viewBox="0 0 24 24" fill="none" color={color}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22ZM11.1999 14.673H9.18652V16.1664H15.3599V14.673H13.2532V9.4997H9.38652V10.993H11.1999V14.673ZM10.9332 8.63303H13.2799V6.52637H10.9332V8.63303Z"
        fill="currentColor"
      />
    </Icon>
  );
};
