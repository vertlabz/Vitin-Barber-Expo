import React from 'react';
import { View, ViewProps } from 'react-native';
import { useBreakpoint } from '../../hooks/useBreakpoint';

type ResponsiveStackProps = ViewProps & {
  spacing?: number;
};

export function ResponsiveStack({
  spacing = 24,
  style,
  ...rest
}: ResponsiveStackProps) {
  const { isDesktop } = useBreakpoint();

  return (
    <View
      style={[
        {
          flexDirection: isDesktop ? 'row' : 'column',
          gap: spacing,
        },
        style,
      ]}
      {...rest}
    />
  );
}
