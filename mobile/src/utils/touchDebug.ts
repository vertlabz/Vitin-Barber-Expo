import type { ViewProps } from 'react-native';

type TouchDebugProps = Pick<ViewProps, 'onTouchStart' | 'onTouchEnd'>;

export function getTouchDebugProps(label: string): TouchDebugProps {
  if (!__DEV__) {
    return {};
  }

  return {
    onTouchStart: () => {
      console.log(`[touch] ${label} start`);
    },
    onTouchEnd: () => {
      console.log(`[touch] ${label} end`);
    },
  };
}
