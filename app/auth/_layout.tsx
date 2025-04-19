import { Stack } from "expo-router";

/**
 * Auth ekranları için layout
 * Giriş ve kayıt ekranlarını içerir
 */
export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, presentation: 'modal' }}>
      <Stack.Screen
        name="signin"
        options={{
          title: "Giriş Yap",
        }}
      />
      
      <Stack.Screen
        name="signup"
        options={{
          title: "Kayıt Ol",
        }}
      />
    </Stack>
  );
} 