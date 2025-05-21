import React, { createContext, useState, useContext, useEffect, ReactNode, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
  name: string;
  studentId: string;
}

interface UserContextType {
  user: User | null;
  isRegistered: boolean;
  registerUser: (name: string, studentId: string) => Promise<void>;
  logout: () => Promise<void>;
  loadingUser: boolean;
  checkStudentId: (studentId: string) => Promise<boolean>;
}

const UserContext = createContext<UserContextType>({
  user: null,
  isRegistered: false,
  registerUser: async () => {},
  logout: async () => {},
  loadingUser: true,
  checkStudentId: async () => false,
});

const USER_STORAGE_KEY = '@asistencia_movil_user';
const REGISTERED_IDS_KEY = '@asistencia_movil_registered_ids';

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const isMounted = useRef(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const storedUser = await AsyncStorage.getItem(USER_STORAGE_KEY);
        if (isMounted.current && storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      } finally {
        if (isMounted.current) {
          setLoadingUser(false);
        }
      }
    };

    loadUser();

    return () => {
      isMounted.current = false;
    };
  }, []);

  const checkStudentId = async (studentId: string): Promise<boolean> => {
    try {
      const registeredIds = await AsyncStorage.getItem(REGISTERED_IDS_KEY);
      const ids = registeredIds ? JSON.parse(registeredIds) : [];
      return ids.includes(studentId);
    } catch (error) {
      console.error('Error checking student ID:', error);
      return false;
    }
  };

  const registerUser = async (name: string, studentId: string) => {
    try {
      const userData: User = { name, studentId };
      await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(userData));
      
      const registeredIds = await AsyncStorage.getItem(REGISTERED_IDS_KEY);
      const ids = registeredIds ? JSON.parse(registeredIds) : [];
      if (!ids.includes(studentId)) {
        ids.push(studentId);
        await AsyncStorage.setItem(REGISTERED_IDS_KEY, JSON.stringify(ids));
      }
      
      if (isMounted.current) {
        setUser(userData);
      }
    } catch (error) {
      console.error('Error saving user data:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      await AsyncStorage.removeItem(USER_STORAGE_KEY);
      if (isMounted.current) {
        setUser(null);
      }
    } catch (error) {
      console.error('Error removing user data:', error);
      throw error;
    }
  };

  return (
    <UserContext.Provider
      value={{
        user,
        isRegistered: !!user,
        registerUser,
        logout,
        loadingUser,
        checkStudentId,
      }}
    >
      {!loadingUser && children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);