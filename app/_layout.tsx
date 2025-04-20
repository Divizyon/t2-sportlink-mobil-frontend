import { Stack } from "expo-router";
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
      <Stack screenOptions={{ headerShown: false }}>
        {/* Karşılama ekranı */}
        <Stack.Screen
          name="index"
          options={{
            headerShown: false,
          }}
        />

        {/* Auth navigasyonu */}
        <Stack.Screen
          name="auth"
          options={{
            headerShown: false,
          }}
        />

        {/* Ana tab navigasyonu */}
        <Stack.Screen
          name="(tabs)"
          options={{
            headerShown: false,
          }}
        />

        {/* Detay sayfaları ve diğer rotalar */}
        <Stack.Screen
          name="routes/[id]"
          options={{
            headerShown: true,
            headerTitle: "Rota Detayı",
          }}
        />

        <Stack.Screen
          name="facilities/[id]"
          options={{
            headerShown: true,
            headerTitle: "Tesis Detayı",
          }}
        />
      </Stack>
    </GluestackUIProvider>
  );
}
