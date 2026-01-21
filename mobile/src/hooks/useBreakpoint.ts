import { useWindowDimensions } from 'react-native';

const BREAKPOINTS = {
  tablet: 768,
  desktop: 1024,
};

export type BreakpointState = {
  width: number;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
};

export function useBreakpoint(): BreakpointState {
  const { width } = useWindowDimensions();

  const isMobile = width < BREAKPOINTS.tablet;
  const isTablet = width >= BREAKPOINTS.tablet && width < BREAKPOINTS.desktop;
  const isDesktop = width >= BREAKPOINTS.desktop;

  return {
    width,
    isMobile,
    isTablet,
    isDesktop,
  };
}
