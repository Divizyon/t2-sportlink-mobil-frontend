// react-native-paper modülü için özel tip tanımları
declare module 'react-native-paper' {
  export interface ThemeColors {
    primary: string;
    onPrimary: string;
    primaryContainer: string;
    onPrimaryContainer: string;
    secondary: string;
    onSecondary: string;
    secondaryContainer: string;
    onSecondaryContainer: string;
    tertiary: string;
    onTertiary: string;
    tertiaryContainer: string;
    onTertiaryContainer: string;
    error: string;
    onError: string;
    errorContainer: string;
    onErrorContainer: string;
    background: string;
    onBackground: string;
    surface: string;
    onSurface: string;
    surfaceVariant: string;
    onSurfaceVariant: string;
    outline: string;
    outlineVariant: string;
    shadow: string;
    scrim: string;
    inverseSurface: string;
    inverseOnSurface: string;
    inversePrimary: string;
    elevation: {
      level0: string;
      level1: string;
      level2: string;
      level3: string;
      level4: string;
      level5: string;
    };
    surfaceDisabled: string;
    onSurfaceDisabled: string;
    backdrop: string;
    border: string;
  }

  export const MD3LightTheme: { colors: ThemeColors };
  export const MD3DarkTheme: { colors: ThemeColors };

  export interface ButtonProps {
    mode?: 'text' | 'outlined' | 'contained' | 'elevated' | 'contained-tonal';
    onPress?: () => void;
    compact?: boolean;
    style?: any;
    labelStyle?: any;
    children?: React.ReactNode;
    dark?: boolean;
    uppercase?: boolean;
    icon?: any;
    loading?: boolean;
    disabled?: boolean;
    contentStyle?: any;
    color?: string;
  }

  export const Button: React.ComponentType<ButtonProps>;
}

// react-native-maps modülü için özel tip tanımları
declare module 'react-native-maps' {
  import * as React from 'react';
  import { ViewProps } from 'react-native';

  export interface Region {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  }

  export interface MapViewProps extends ViewProps {
    provider?: 'google' | null;
    region?: Region;
    initialRegion?: Region;
    onRegionChangeComplete?: (region: Region) => void;
    showsUserLocation?: boolean;
    showsMyLocationButton?: boolean;
    style?: any;
    children?: React.ReactNode;
  }

  export interface MarkerProps {
    coordinate: {
      latitude: number;
      longitude: number;
    };
    title?: string;
    description?: string;
    pinColor?: string;
    onPress?: () => void;
    onCalloutPress?: () => void;
    children?: React.ReactNode;
    key?: string | number;
    image?: any;
    anchor?: { x: number; y: number };
    calloutAnchor?: { x: number; y: number };
    callout?: React.ReactNode;
    centerOffset?: { x: number; y: number };
    flat?: boolean;
    identifier?: string;
    opacity?: number;
    rotation?: number;
    style?: any;
    tracksInfoWindowChanges?: boolean;
    tracksViewChanges?: boolean;
    zIndex?: number;
  }

  export interface CalloutProps {
    title?: string;
    description?: string;
    onPress?: () => void;
    style?: any;
    children?: React.ReactNode;
  }

  export const PROVIDER_GOOGLE: 'google';
  export const PROVIDER_DEFAULT: null;

  export class Marker extends React.Component<MarkerProps> {}
  export class Callout extends React.Component<CalloutProps> {}
  
  export default class MapView extends React.Component<MapViewProps> {
    static Marker: typeof Marker;
    static Callout: typeof Callout;
  }
} 