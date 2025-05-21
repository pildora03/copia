import { useEffect, useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { COLORS } from '@/constants/colors';
import { SPACING } from '@/constants/layout';
import { StatusBar } from 'expo-status-bar';
import { useUser } from '@/contexts/UserContext';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, UserCheck } from 'lucide-react-native';

const validateName = (name: string) => {
  // Remove extra spaces and split into words
  const words = name.trim().replace(/\s+/g, ' ').split(' ');
  
  // Check if we have between 3 and 5 words (1-3 names + 2 apellidos)
  if (words.length < 3 || words.length > 5) {
    return 'Ingresa tu nombre completo (1-3 nombres y 2 apellidos)';
  }

  // Check if all characters are letters (including Spanish accents and ñ)
  const lettersOnly = /^[a-záéíóúñA-ZÁÉÍÓÚÑ\s]+$/;
  if (!lettersOnly.test(name)) {
    return 'El nombre solo debe contener letras';
  }

  // Check length
  if (name.length > 35) {
    return 'El nombre no debe exceder 35 caracteres';
  }

  return null;
};

const validateStudentId = (id: string) => {
  // Check if it contains only numbers
  if (!/^\d*$/.test(id)) {
    return 'La matrícula solo debe contener números';
  }

  // Check if it's exactly 8 digits
  if (!/^\d{8}$/.test(id)) {
    return 'La matrícula debe tener exactamente 8 dígitos';
  }

  // Check if it starts with "20"
  if (!id.startsWith('20')) {
    return 'La matrícula debe comenzar con "20"';
  }

  return null;
};

export default function Register() {
  const { registerUser, isRegistered, user, checkStudentId } = useUser();
  const router = useRouter();
  const [name, setName] = useState('');
  const [studentId, setStudentId] = useState('');
  const [errors, setErrors] = useState<{name?: string; studentId?: string}>({});
  const { edit } = useLocalSearchParams<{ edit?: string }>();
  const isEditing = edit === 'true';

  useEffect(() => {
    if (isEditing && user) {
      setName(user.name);
      setStudentId(user.studentId);
    }
  }, [isEditing, user]);

  useEffect(() => {
    if (isRegistered && !isEditing) {
      router.replace('/');
    }
  }, [isRegistered, isEditing, router]);

  const handleNameChange = (text: string) => {
    // Only allow letters, spaces, and Spanish accents
    const sanitizedText = text.replace(/[^a-záéíóúñA-ZÁÉÍÓÚÑ\s]/g, '');
    setName(sanitizedText);
    
    // Clear error when user starts typing
    if (errors.name) {
      setErrors(prev => ({ ...prev, name: undefined }));
    }
  };

  const handleStudentIdChange = (text: string) => {
    // Only allow numbers
    const numbersOnly = text.replace(/[^\d]/g, '');
    setStudentId(numbersOnly);
    
    // Clear error when user starts typing
    if (errors.studentId) {
      setErrors(prev => ({ ...prev, studentId: undefined }));
    }
  };

  const validateForm = async () => {
    const newErrors: {name?: string; studentId?: string} = {};
    
    const nameError = validateName(name);
    if (nameError) {
      newErrors.name = nameError;
    }
    
    const studentIdError = validateStudentId(studentId);
    if (studentIdError) {
      newErrors.studentId = studentIdError;
    } else if (!isEditing && await checkStudentId(studentId)) {
      newErrors.studentId = 'Esta matrícula ya está registrada';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async () => {
    const isValid = await validateForm();
    if (!isValid) return;

    try {
      await registerUser(name.trim(), studentId.trim());
      router.replace('/');
    } catch (error) {
      setErrors({ 
        name: 'Error al guardar los datos. Por favor intenta de nuevo.' 
      });
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.keyboardAvoid} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollView}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.container}>
          <StatusBar style="auto" />
          
          {isEditing && (
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <ArrowLeft size={24} color={COLORS.text} />
            </TouchableOpacity>
          )}

          <View style={styles.header}>
            <Text style={styles.title}>
              {isEditing ? 'Editar Perfil' : 'Bienvenido'}
            </Text>
            <Text style={styles.subtitle}>
              {isEditing 
                ? 'Actualiza tu información' 
                : 'Regístrate para comenzar a tomar asistencia'}
            </Text>
          </View>

          <View style={styles.formContainer}>
            <UserCheck size={40} color={COLORS.primary} style={styles.icon} />
            
            <Text style={styles.label}>Nombre completo</Text>
            <TextInput
              style={[styles.input, errors.name && styles.inputError]}
              placeholder="Ej. Juan Antonio Pérez González"
              placeholderTextColor={COLORS.placeholder}
              value={name}
              onChangeText={handleNameChange}
              autoCapitalize="words"
              autoCorrect={false}
              maxLength={35}
            />
            {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}

            <Text style={styles.label}>Matrícula</Text>
            <TextInput
              style={[styles.input, errors.studentId && styles.inputError]}
              placeholder="Ej. 20123456"
              placeholderTextColor={COLORS.placeholder}
              value={studentId}
              onChangeText={handleStudentIdChange}
              keyboardType="numeric"
              maxLength={8}
            />
            {errors.studentId && <Text style={styles.errorText}>{errors.studentId}</Text>}

            <TouchableOpacity 
              style={styles.button} 
              onPress={handleRegister}
            >
              <Text style={styles.buttonText}>
                {isEditing ? 'Actualizar' : 'Guardar'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              Asistencia Móvil - v1.0.0
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardAvoid: {
    flex: 1,
  },
  scrollView: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: SPACING.lg,
  },
  backButton: {
    marginTop: SPACING.xxl,
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
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
    lineHeight: 24,
  },
  formContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: SPACING.lg,
    marginVertical: SPACING.xl,
    shadowColor: COLORS.shadow,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  icon: {
    alignSelf: 'center',
    marginBottom: SPACING.md,
  },
  label: {
    fontFamily: 'Poppins-Medium',
    fontSize: 14,
    color: COLORS.textLight,
    marginBottom: SPACING.xs,
  },
  input: {
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontFamily: 'Poppins-Regular',
    fontSize: 16,
    color: COLORS.text,
    marginBottom: SPACING.md,
  },
  inputError: {
    borderColor: COLORS.error,
  },
  errorText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 14,
    color: COLORS.error,
    marginBottom: SPACING.sm,
  },
  button: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: SPACING.md,
  },
  buttonText: {
    fontFamily: 'Poppins-Medium',
    fontSize: 16,
    color: COLORS.white,
  },
  footer: {
    marginTop: 'auto',
    alignItems: 'center',
    paddingBottom: SPACING.md,
  },
  footerText: {
    fontFamily: 'Poppins-Regular',
    fontSize: 12,
    color: COLORS.textLight,
  },
});