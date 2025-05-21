import { Platform } from 'react-native';
import { supabase } from './supabase';

export const submitAttendance = async (name: string, studentId: string, time: string): Promise<void> => {
  try {
    // Check if student exists
    let { data: student, error: fetchError } = await supabase
      .from('students')
      .select('id')
      .eq('student_id', studentId)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Error fetching student:', fetchError);
      throw new Error('Error al buscar estudiante');
    }

    if (!student) {
      // Create student if not exists
      const { data: newStudent, error: studentError } = await supabase
        .from('students')
        .insert([{ name, student_id: studentId }])
        .select('id')
        .single();

      if (studentError) {
        console.error('Error creating student:', studentError);
        throw new Error('Error al registrar estudiante');
      }
      student = newStudent;
    }

    // Check if student already submitted attendance today
    const today = new Date().toISOString().split('T')[0];
    const { data: existingAttendance, error: attendanceCheckError } = await supabase
      .from('attendance_records')
      .select('id')
      .eq('student_id', student.id)
      .gte('check_in_time', today)
      .lt('check_in_time', today + 'T23:59:59.999Z')
      .single();

    if (attendanceCheckError && attendanceCheckError.code !== 'PGRST116') {
      console.error('Error checking attendance:', attendanceCheckError);
      throw new Error('Error al verificar asistencia');
    }

    if (existingAttendance) {
      throw new Error('Ya registraste tu asistencia hoy');
    }

    // Submit attendance
    const { error: attendanceError } = await supabase
      .from('attendance_records')
      .insert([
        {
          student_id: student.id,
          check_in_time: new Date().toISOString(),
        }
      ]);

    if (attendanceError) {
      console.error('Error submitting attendance:', attendanceError);
      throw new Error('Error al registrar asistencia');
    }

  } catch (error) {
    console.error('Error submitting attendance:', error);
    
    if (error instanceof Error) {
      throw error;
    }
    
    throw new Error('Error al registrar asistencia');
  }
};