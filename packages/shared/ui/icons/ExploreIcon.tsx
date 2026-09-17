import React from 'react';
import Svg, { Path } from 'react-native-svg';

interface ExploreIconProps {
  color: string;
  size?: number;
}

/**
 * Custom "explore" mark (binoculars) for the nav bar — supplied as SVG art.
 * viewBox normalized to 0 0 100 100 so the glyph centers in its box.
 */
export const ExploreIcon = ({ color, size = 24 }: ExploreIconProps) => (
  <Svg width={size} height={size} viewBox="0 0 100 100">
    <Path
      fill={color}
      fillRule="evenodd"
      clipRule="evenodd"
      d="M64.5,20.1c3.8,0,7.2,2.2,8.8,5.5c2.3,0.6,4.2,2.1,5.5,4L92,50c1.9,3,3,6.6,3,10.4c0,10.8-8.8,19.6-19.6,19.6 c-10,0-18.2-7.5-19.4-17.2c-1.8,1-3.8,1.5-6,1.5c-2.2,0-4.2-0.6-6-1.5c-1.2,9.7-9.4,17.2-19.4,17.2C13.8,79.9,5,71.2,5,60.4 C5,56.5,6.1,53,8,50l13.2-20.3c1.3-2,3.3-3.5,5.6-4.2c1.6-3.2,4.9-5.5,8.8-5.5c3.7,0,6.9,2.1,8.6,5.1h11.8 C57.6,22.1,60.8,20.1,64.5,20.1z M24.6,46.3c-7.8,0-14.1,6.3-14.1,14.1s6.3,14.1,14.1,14.1s14.1-6.3,14.1-14.1S32.3,46.3,24.6,46.3 z M75.4,46.3c-7.8,0-14.1,6.3-14.1,14.1s6.3,14.1,14.1,14.1s14.1-6.3,14.1-14.1S83.2,46.3,75.4,46.3z M50,43.9 c-4.3,0-7.8,3.5-7.8,7.8s3.5,7.8,7.8,7.8s7.8-3.5,7.8-7.8S54.3,43.9,50,43.9z"
    />
  </Svg>
);
