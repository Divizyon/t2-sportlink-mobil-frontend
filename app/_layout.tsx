import { Stack } from "expo-router";

import "@/global.css";
import { GluestackUIProvider } from "@gluestack-ui/themed";
import { config } from "@gluestack-ui/config";

export default function Layout() {
  return (
    <GluestackUIProvider config={config}>
      <Stack>
        {/* Uygulama başlangıç ekranı */}
        <Stack.Screen
          name="index"
          options={{
            headerShown: false,
          }}
        />
        
        {/* Giriş ve kayıt ekranları - header yok */}
        <Stack.Screen
          name="signin"
          options={{
            headerShown: false,
            presentation: 'modal',
          }}
        />
        
        <Stack.Screen
          name="signup"
          options={{
            headerShown: false,
            presentation: 'modal',
          }}
        />
        
        {/* Ana sayfalar - header yok (kendi header'ları var) */}
        <Stack.Screen
          name="home"
          options={{
            headerShown: false,
          }}
        />
        
        {/* Harita sayfası */}
        <Stack.Screen
          name="map"
          options={{
            headerShown: false,
          }}
        />
        
        {/* Tesisler sayfası */}
        <Stack.Screen
          name="facilities"
          options={{
            headerShown: false,
          }}
        />
      </Stack>
    </GluestackUIProvider>
  );
}
