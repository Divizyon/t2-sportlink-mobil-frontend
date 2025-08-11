import { useEffect, useRef } from 'react';
import { BackHandler, Platform, ToastAndroid } from 'react-native';
import { navigationRef } from '../navigation/navigationRef';

/**
 * Android donanım geri tuşu yönetimi.
 * - Stack'te geri gidilebiliyorsa goBack
 * - Root'taysa çift basışta uygulamadan çık
 */
export function useAndroidBackHandler() {
  const lastBackPressTimestampRef = useRef<number>(0);

  useEffect(() => {
    if (Platform.OS !== 'android') return;

    const onHardwareBackPress = () => {
      try {
        if (navigationRef.isReady()) {
          // Eğer herhangi bir navigator geri gidebiliyorsa
          if (navigationRef.canGoBack()) {
            navigationRef.goBack();
            return true; // default davranışı engelle
          }
        }

        // Kök seviyedeysek: çift basışla çıkış
        const now = Date.now();
        if (now - lastBackPressTimestampRef.current < 1500) {
          BackHandler.exitApp();
          return true;
        }
        lastBackPressTimestampRef.current = now;
        ToastAndroid.show('Çıkmak için tekrar basın', ToastAndroid.SHORT);
        return true;
      } catch (error) {
        // Hata halinde varsayılan davranışı uygula
        return false;
      }
    };

    const subscription = BackHandler.addEventListener('hardwareBackPress', onHardwareBackPress);
    return () => subscription.remove();
  }, []);
}


