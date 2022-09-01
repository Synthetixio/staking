import { Icon, IconProps } from '@chakra-ui/react';

interface FailedIconProps extends IconProps {
  width: string | number;
  height: string | number;
}

export const FailedIcon = ({ width = '94px', height = '94px' }: FailedIconProps) => {
  return (
    <Icon
      width={width}
      height={height}
      viewBox="0 0 94 94"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <g filter="url(#filter0_d_1044_28165)">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M47 76.3333C63.2004 76.3333 76.3333 63.2004 76.3333 47C76.3333 30.7996 63.2004 17.6667 47 17.6667C30.7996 17.6667 17.6667 30.7996 17.6667 47C17.6667 63.2004 30.7996 76.3333 47 76.3333ZM47 79C64.6731 79 79 64.6731 79 47C79 29.3269 64.6731 15 47 15C29.3269 15 15 29.3269 15 47C15 64.6731 29.3269 79 47 79Z"
          fill="#FF4A60"
        />
      </g>
      <g filter="url(#filter1_d_1044_28165)">
        <path
          d="M56.3334 39.5466L54.4534 37.6666L47.0001 45.12L39.5467 37.6666L37.6667 39.5466L45.1201 47L37.6667 54.4533L39.5467 56.3333L47.0001 48.88L54.4534 56.3333L56.3334 54.4533L48.8801 47L56.3334 39.5466Z"
          fill="#FF4A60"
        />
      </g>
      <defs>
        <filter
          id="filter0_d_1044_28165"
          x="0"
          y="0"
          width="94"
          height="94"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset />
          <feGaussianBlur stdDeviation="7.5" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 1 0 0 0 0 0.116667 0 0 0 0 0.222667 0 0 0 0.6 0"
          />
          <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_1044_28165" />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect1_dropShadow_1044_28165"
            result="shape"
          />
        </filter>
        <filter
          id="filter1_d_1044_28165"
          x="22.6667"
          y="22.6666"
          width="48.6667"
          height="48.6666"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feColorMatrix
            in="SourceAlpha"
            type="matrix"
            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
            result="hardAlpha"
          />
          <feOffset />
          <feGaussianBlur stdDeviation="7.5" />
          <feColorMatrix
            type="matrix"
            values="0 0 0 0 1 0 0 0 0 0.116667 0 0 0 0 0.222667 0 0 0 0.6 0"
          />
          <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_1044_28165" />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="effect1_dropShadow_1044_28165"
            result="shape"
          />
        </filter>
      </defs>
    </Icon>
  );
};
