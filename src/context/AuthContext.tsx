import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  User, 
  signInWithPopup, 
  signOut, 
  onAuthStateChanged 
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, googleProvider, handleFirestoreError, OperationType } from '../lib/firebase';

export interface StaffProfile {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: 'doctor' | 'nurse' | 'admin' | 'staff';
  department: string;
  badgeNumber: string;
  isAdmin: boolean;
}

interface AuthContextType {
  user: User | null;
  staffProfile: StaffProfile | null;
  loading: boolean;
  signInWithGoogle: () => Promise<void>;
  signOutUser: () => Promise<void>;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [staffProfile, setStaffProfile] = useState<StaffProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const userDocRef = doc(db, 'users', currentUser.uid);
          const userSnap = await getDoc(userDocRef);

          const isMainAdmin = currentUser.email?.toLowerCase() === 'shalinidamu2007@gmail.com';
          
          let profile: StaffProfile;
          if (userSnap.exists()) {
            profile = userSnap.data() as StaffProfile;
            if (isMainAdmin && !profile.isAdmin) {
              profile.isAdmin = true;
              profile.role = 'doctor';
            }
          } else {
            // Initialize default profile
            profile = {
              id: currentUser.uid,
              email: currentUser.email || '',
              displayName: currentUser.displayName || (isMainAdmin ? 'Dr. Shalini Damu' : 'Hospital Staff'),
              photoURL: currentUser.photoURL || undefined,
              role: isMainAdmin ? 'doctor' : 'nurse',
              department: isMainAdmin ? 'Emergency & Clinical Decision Support' : 'Triage & Caregiving',
              badgeNumber: isMainAdmin ? 'CMO-001' : `STF-${currentUser.uid.slice(0, 5).toUpperCase()}`,
              isAdmin: isMainAdmin,
            };

            await setDoc(userDocRef, {
              ...profile,
              createdAt: new Date().toISOString(),
            });
          }
          setStaffProfile(profile);
        } catch (err: any) {
          console.warn('Could not sync user profile with Firestore:', err?.message);
          // Fallback in-memory profile
          const isMainAdmin = currentUser.email?.toLowerCase() === 'shalinidamu2007@gmail.com';
          setStaffProfile({
            id: currentUser.uid,
            email: currentUser.email || '',
            displayName: currentUser.displayName || (isMainAdmin ? 'Dr. Shalini Damu' : 'Hospital Staff'),
            role: isMainAdmin ? 'doctor' : 'nurse',
            department: isMainAdmin ? 'Emergency & Clinical Decision Support' : 'Triage & Caregiving',
            badgeNumber: isMainAdmin ? 'CMO-001' : 'STF-001',
            isAdmin: isMainAdmin,
          });
        }
      } else {
        setStaffProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const signInWithGoogle = async () => {
    setError(null);
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      console.error('Google Sign-In failed:', err);
      setError(err?.message || 'Authentication with Google failed.');
    }
  };

  const signOutUser = async () => {
    try {
      await signOut(auth);
      setStaffProfile(null);
    } catch (err: any) {
      console.error('Sign-Out failed:', err);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        staffProfile,
        loading,
        signInWithGoogle,
        signOutUser,
        error,
        clearError: () => setError(null),
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
