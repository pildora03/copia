import { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { COLORS } from '@/constants/colors';
import { useUser } from '@/contexts/UserContext';
import { SPACING } from '@/constants/layout';
import { CircleCheck as CheckCircle, WifiOff, Clock, LogOut } from 'lucide-react-native';
import Animated, { useSharedValue, useAnimatedStyle, withSpring, withSequence, withDelay } from 'react-native-reanimated';
import { submitAttendance } from '@/utils/api';
import { Alert } from 'react-native';

export default function AttendancePage() {
  const { user, isRegistered, logout } = useUser();
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const buttonScale = useSharedValue(1);
  const successOpacity = useSharedValue(0);

  useEffect(() => {
    if (!isRegistered) {
      router.replace('/register');
    }
  }, [isRegistered, router]);

  const buttonAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: buttonScale.value }],
    };
  });

  const successAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: successOpacity.value,
    };
  });

  const handleLogout = () => {
    Alert.alert(
      'Cerrar sesión',
      '¿Estás seguro que deseas cerrar tu sesión? Necesitarás volver a registrarte.',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Cerrar sesión',
          onPress: async () => {
            await logout();
            router.replace('/register');
          },
          style: 'destructive',
        },
      ]
    );
  };

  const handleAttendance = async () => {
    if (submitting || !user) return;

    try {
      setSubmitting(true);
      setError(null);
      
      buttonScale.value = withSequence(
        withSpring(0.95, { damping: 10, stiffness: 100 }),
        withSpring(1, { damping: 10, stiffness: 100 })
      );

      const now = new Date();
      const formattedTime = now.toLocaleTimeString();
      
      await submitAttendance(user.name, user.studentId, formattedTime);

      successOpacity.value = withSequence(
        withDelay(
          300,
          withSpring(1, { damping: 20, stiffness: 90 })
        ),
        withDelay(
          2000,
          withSpring(0, { damping: 20, stiffness: 90 })
        )
      );

      setSubmitted(true);
      
      setTimeout(() => {
        setSubmitted(false);
      }, 3000);
    } catch (err) {
      // Handle the specific network error message
      const errorMessage = err instanceof Error ? err.message : 'No se pudo registrar la asistencia. Verifica tu conexión.';
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isRegistered) {
    return null;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Asistencia Móvil</Text>
        <Text style={styles.subtitle}>Registra tu asistencia a clases</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.userInfo}>
          <Text style={styles.userInfoLabel}>Nombre:</Text>
          <Text style={styles.userInfoValue}>{user?.name}</Text>
          <Text style={styles.userInfoLabel}>Matrícula:</Text>
          <Text style={styles.userInfoValue}>{user?.studentId}</Text>
        </View>

        <Text style={styles.instructionsText}>
          Para registrar tu asistencia, presiona el botón a continuación.
        </Text>

        <Animated.View style={[styles.successContainer, successAnimatedStyle]}>
          <CheckCircle size={32} color={COLORS.success} />
          <Text style={styles.successText}>¡Asistencia registrada!</Text>
        </Animated.View>

        {error && (
          <View style={styles.errorContainer}>
            <WifiOff size={24} color={COLORS.error} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <View style={styles.currentTime}>
          <Clock size={20} color={COLORS.textLight} />
          <Text style={styles.timeText}>
            {new Date().toLocaleTimeString()}
          </Text>
        </View>

        <Animated.View style={buttonAnimatedStyle}>
          <TouchableOpacity
            style={[
              styles.button,
              submitted && styles.buttonSubmitted,
              submitting && styles.buttonSubmitting,
            ]}
            onPress={handleAttendance}
            disabled={submitting || submitted}
          >
            {submitting ? (
              <ActivityIndicator color={COLORS.white} />
            ) : (
              <Text style={styles.buttonText}>
                {submitted ? 'Registrado' : 'Tomar Asistencia'}
              </Text>
            )}
          </TouchableOpacity>
        </Animated.View>

        <TouchableOpacity 
          style={styles.logoutButton} 
          onPress={handleLogout}
        >
          <LogOut size={20} color={COLORS.error} />
          <Text style={styles.logoutText}>Cerrar sesión</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          La asistencia se enviará a través de la red WiFi local
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: SPACING.lg,
  },
  header: {
    marginTop: SPACING.xxl,
    marginBottom: SPACING.xl,
  },
  title: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 28,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    color: COLORS.textLight,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: SPACING.lg,
    marginVertical: SPACING.md,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  userInfo: {
    backgroundColor: COLORS.background,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.lg,
  },
  userInfoLabel: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: COLORS.textLight,
    marginBottom: SPACING.xs,
  },
  userInfoValue: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 16,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  instructionsText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: COLORS.textLight,
    marginBottom: SPACING.lg,
    lineHeight: 22,
  },
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.md,
  },
  buttonSubmitted: {
    backgroundColor: COLORS.success,
  },
  buttonSubmitting: {
    backgroundColor: COLORS.primaryLight,
  },
  buttonText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
    color: COLORS.white,
  },
  successContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.successLight,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  successText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
    color: COLORS.success,
    marginLeft: SPACING.sm,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.errorLight,
    borderRadius: 12,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  errorText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: COLORS.error,
    marginLeft: SPACING.sm,
    flex: 1,
  },
  currentTime: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.md,
  },
  timeText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: COLORS.textLight,
    marginLeft: SPACING.xs,
  },
  footer: {
    marginTop: 'auto',
    alignItems: 'center',
  },
  footerText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    color: COLORS.textLight,
    textAlign: 'center',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.xl,
    padding: SPACING.sm,
  },
  logoutText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: COLORS.error,
    marginLeft: SPACING.xs,
  },
});