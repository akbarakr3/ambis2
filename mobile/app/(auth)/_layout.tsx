import { Stack } from 'expo-router';
import { useAuthStore } from '../../lib/stores/authStore';
import { useEffect } from 'react';

export default function AuthLayout() {
  const user = useAuthStore((state) => state.user);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="login" />
    </Stack>
  );
}
