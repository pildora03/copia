import { StyleSheet, Text, View, TouchableOpacity, Alert } from 'react-native';
import { useUser } from '@/contexts/UserContext';
import { COLORS } from '@/constants/colors';
import { SPACING } from '@/constants/layout';
import { useRouter } from 'expo-router';
import { CreditCard as Edit, LogOut, User } from 'lucide-react-native';

export default function Profile() {
  const { user, logout, isRegistered } = useUser();
  const router = useRouter();

  if (!isRegistered) {
    router.replace('/register');
    return null;
  }

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
          onPress: () => {
            logout();
            router.replace('/register');
          },
          style: 'destructive',
        },
      ]
    );
  };

  const handleEditProfile = () => {
    router.push('/register?edit=true');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Mi Perfil</Text>
        <Text style={styles.subtitle}>Información de estudiante</Text>
      </View>

      <View style={styles.profileCard}>
        <View style={styles.avatarContainer}>
          <User size={40} color={COLORS.white} />
        </View>
        <Text style={styles.nameText}>{user?.name}</Text>
        <Text style={styles.roleText}>Estudiante</Text>

        <View style={styles.infoContainer}>
          <View style={styles.infoItem}>
            <Text style={styles.infoLabel}>Nombre:</Text>
            <Text style={styles.infoValue}>{user?.name}</Text>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.editButton}
          onPress={handleEditProfile}
        >
          <Edit size={18} color={COLORS.primary} />
          <Text style={styles.editButtonText}>Editar información</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <LogOut size={20} color={COLORS.error} />
          <Text style={styles.logoutText}>Cerrar sesión</Text>
        </TouchableOpacity>
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
  profileCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: SPACING.lg,
    marginVertical: SPACING.md,
    alignItems: 'center',
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  nameText: {
    fontFamily: 'Poppins-SemiBold',
    fontSize: 22,
    color: COLORS.text,
    marginBottom: SPACING.xs,
  },
  roleText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    color: COLORS.textLight,
    marginBottom: SPACING.lg,
  },
  infoContainer: {
    width: '100%',
    marginVertical: SPACING.md,
  },
  infoItem: {
    flexDirection: 'row',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    width: '100%',
  },
  infoLabel: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: COLORS.textLight,
    width: '30%',
  },
  infoValue: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: COLORS.text,
    flex: 1,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: SPACING.md,
    padding: SPACING.sm,
  },
  editButtonText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: COLORS.primary,
    marginLeft: SPACING.xs,
  },
  footer: {
    marginTop: 'auto',
    alignItems: 'center',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
  },
  logoutText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
    color: COLORS.error,
    marginLeft: SPACING.xs,
  },
});