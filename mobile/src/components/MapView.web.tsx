import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

// Web fallback for MapView - react-native-maps doesn't support web
const MapView = React.forwardRef(({ style, children, ...props }: any, ref) => {
  return (
    <View style={[styles.container, style]}>
      <Text style={styles.text}>Map view is not available on web</Text>
      <Text style={styles.subtext}>Please use the mobile app to select location</Text>
    </View>
  );
});

export const Marker = ({ children, ...props }: any) => null;
export const PROVIDER_GOOGLE = null;

export default MapView;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e0e0e0',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
  },
  subtext: {
    fontSize: 14,
    color: '#888',
    marginTop: 8,
  },
});
