import { Stack } from "expo-router";
import { useThemeStore } from "../store";
import { useEffect } from "react";
import { StatusBar } from "expo-status-bar";

export default function RootLayout() {
  const { isDarkMode } = useThemeStore();
  
  useEffect(() => {
    // Tema değişimi uygulandığında yapılacak işlemler
  }, [isDarkMode]);

  return (
    <>
      <StatusBar style={isDarkMode ? "light" : "dark"} />
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: isDarkMode ? '#121212' : '#f5f5f5',
          },
          headerTintColor: isDarkMode ? '#fff' : '#333',
          contentStyle: {
            backgroundColor: isDarkMode ? '#121212' : '#f5f5f5',
          },
        }}
      >
        <Stack.Screen name="index" options={{ headerTitle: "Ana Sayfa" }} />
        <Stack.Screen name="(auth)/login" options={{ headerTitle: "Giriş Yap" }} />
        <Stack.Screen name="(auth)/register" options={{ headerTitle: "Kayıt Ol" }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </>
  );
}
