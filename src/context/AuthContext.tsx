import React, { useEffect, useState, createContext, useContext } from 'react';
import { signIn as apiSignIn } from '../service/api/auth';
import { api } from '../service/api/api';
interface Staff {
  id: string;
  name: string | null;
  counter: string | null;
  token: string;
}
interface AuthContextType {
  staff: Staff | null;
  signIn: (email: string, password: string, counterId: string) => Promise<void>;
  signOut: () => Promise<{
    success: boolean;
    message?: string;
  }>;
  isAuthenticated: boolean;
}
const AuthContext = createContext<AuthContextType | undefined>(undefined);
export const AuthProvider: React.FC<{
  children: React.ReactNode;
}> = ({
  children
}) => {
  // Initialize staff state from localStorage if available
  const [staff, setStaff] = useState<Staff | null>(() => {
    const savedStaff = localStorage.getItem('staff');
    return savedStaff ? JSON.parse(savedStaff) : null;
  });
  const signIn = async (email: string, password: string, counterId: string) => {
    try {
      // Call the API to sign in
      const response = await apiSignIn({
        email,
        password
      }, counterId);
      // Create staff data object with the token
      const staffData = {
        id: email,
        name: response.staffName,
        counter: counterId,
        token: response.token // Save the token in the staff object
      };
      // Update the state
      setStaff(staffData);
      // Save to localStorage
      localStorage.setItem('staff', JSON.stringify(staffData));
      // Set the token in API headers for future requests
      api.defaults.headers.common['Authorization'] = `Bearer ${response.token}`;
    } catch (error: any) {
      console.error('Sign in error:', error);
      if (error.response) {
        switch (error.response.status) {
          case 401:
            throw new Error('Invalid credentials');
          case 403:
            throw new Error('User is not assigned to this counter');
          default:
            throw new Error('An error occurred during sign in');
        }
      }
      throw new Error('Network error occurred');
    }
  };
  const signOut = async () => {
    // Return success object for handling in components
    return {
      success: true
    };
  };
  // Set up auth token for API calls on initial load
  useEffect(() => {
    if (staff?.token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${staff.token}`;
    }
  }, []);
  return <AuthContext.Provider value={{
    staff,
    signIn,
    signOut,
    isAuthenticated: !!staff
  }}>
      {children}
    </AuthContext.Provider>;
};
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};