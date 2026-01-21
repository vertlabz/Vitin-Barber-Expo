import React from 'react';
import { StyleSheet, View, ViewProps } from 'react-native';
import { useBreakpoint } from '../../hooks/useBreakpoint';

type ContainerProps = ViewProps & {
  maxWidth?: number;
  paddingHorizontal?: number;
};

export function Container({
  style,
  children,
  maxWidth = 960,
  paddingHorizontal,
  ...rest
}: ContainerProps) {
  const { isMobile, isTablet } = useBreakpoint();
  const horizontalPadding =
    paddingHorizontal ?? (isMobile ? 24 : isTablet ? 32 : 40);

  return (
    <View
      style={[
        styles.base,
        { maxWidth, paddingHorizontal: horizontalPadding },
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    width: '100%',
    alignSelf: 'center',
  },
});
