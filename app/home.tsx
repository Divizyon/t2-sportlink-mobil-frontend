import { Redirect } from 'expo-router';

/**
 * Ana sayfa redirector
 * Direkt olarak ana tab içerisindeki home ekranına yönlendirir
 */
export default function Home() {
  return <Redirect href="/(tabs)/home" />;
} 