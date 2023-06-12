import React from "react";

interface SkylarkLogoProps {
  className?: string;
}

export const SkylarkLogo: React.FC<SkylarkLogoProps> = ({ className }) => (
  <svg
    className={className}
    fill="none"
    height="72"
    viewBox="0 0 84 72"
    width="84"
    xmlns="http://www.w3.org/2000/svg"
  >
    <title>{`Skylark Logo`}</title>
    <rect fill="#0E1825" height="24" width="24" x="36" y="24" />
    <path
      d="M12 24C12 17.6348 14.5286 11.5303 19.0294 7.02944C23.5303 2.52856 29.6348 0 36 0H84C84 6.3652 81.4714 12.4697 76.9706 16.9706C72.4697 21.4714 66.3652 24 60 24H36C42.3652 24 48.4697 26.5286 52.9706 31.0294C57.4714 35.5303 60 41.6348 60 48H36C29.6348 48 23.5303 45.4714 19.0294 40.9706C14.5286 36.4697 12 30.3652 12 24Z"
      fill="#0E1825"
    />
    <path
      d="M60 72H0C0 65.6348 2.52856 59.5303 7.02944 55.0294C11.5303 50.5286 17.6348 48 24 48H70L60 72Z"
      fill="#0D5AF1"
    />
    <path
      d="M60 72C66.3652 72 72.4697 69.4714 76.9706 64.9706C81.4714 60.4697 84 54.3652 84 48C84 41.6348 81.4714 35.5303 76.9706 31.0294C72.4697 26.5286 66.3652 24 60 24H36C42.3652 24 48.4697 26.5286 52.9706 31.0294C57.4714 35.5303 60 41.6348 60 48V72Z"
      fill="url(#paint0_linear_1041_895)"
    />
    <path d="M60 48H36L60 72V48Z" fill="url(#paint1_linear_1041_895)" />
    <defs>
      <linearGradient
        gradientUnits="userSpaceOnUse"
        id="paint0_linear_1041_895"
        x1="60"
        x2="60"
        y1="24"
        y2="58.5"
      >
        <stop offset="0.347826" stopColor="#226DFF" />
        <stop offset="1" stopColor="#0D5AF1" />
      </linearGradient>
      <linearGradient
        gradientUnits="userSpaceOnUse"
        id="paint1_linear_1041_895"
        x1="60"
        x2="48"
        y1="48"
        y2="60"
      >
        <stop stopOpacity="0.35" />
        <stop offset="1" stopOpacity="0" />
      </linearGradient>
    </defs>
  </svg>
);
