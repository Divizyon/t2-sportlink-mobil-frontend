import { Stack, Slot } from "expo-router";
import { GluestackUIProvider } from "@gluestack-ui/themed";
import { config } from "@gluestack-ui/config";
import "@/global.css";

/**
 * Ana uygulama layoutu
 * Tüm ekranları kapsayan temel stack yapısı
 */
export default function RootLayout() {
  return (
    <GluestackUIProvider config={config}>
      <Slot />
    </GluestackUIProvider>
  );
}
