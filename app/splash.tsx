import { useEffect } from 'react';
import { StyleSheet, View, Image } from 'react-native';
import { useRouter } from 'expo-router';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withSequence,
  withTiming,
  withRepeat,
  Easing
} from 'react-native-reanimated';

export default function Splash() {
  const router = useRouter();
  const scale = useSharedValue(1);

  useEffect(() => {
    // Start pulsing animation
    scale.value = withRepeat(
      withSequence(
        withTiming(1.1, { 
          duration: 700,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1)
        }),
        withTiming(1, { 
          duration: 700,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1)
        }),
      ),
      2,
      true
    );

    // Navigate to register after 1.5 seconds
    const timer = setTimeout(() => {
      router.replace('/register');
    }, 1500);

    return () => clearTimeout(timer);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }]
  }));

  return (
    <View style={styles.container}>
      <Animated.Image
        source={require('../assets/images/logo.png')}
        style={[styles.logo, animatedStyle]}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 200,
    height: 200,
  }
});