import React, { useEffect, useState } from 'react';
import { getAuth, GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { getDatabase, ref, update } from 'firebase/database';
import { LogIn, LogOut } from 'lucide-react';
import { app } from '../Utils/Firebase';

const Authentication = ({ onUserChange }) => {
  const [user, setUser] = useState(null);
  const auth = getAuth(app);
  const db = getDatabase(app);
  const provider = new GoogleAuthProvider();

  auth.useDeviceLanguage();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (onUserChange) onUserChange(currentUser);
    });
    return () => unsubscribe();
  }, [auth, onUserChange]);

  const googleAuth = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const signedIn = result.user;

      await update(ref(db, 'users/' + signedIn.uid), {
        uid: signedIn.uid,
        displayName: signedIn.displayName,
        email: signedIn.email,
        photoURL: signedIn.photoURL,
        lastLogin: new Date().toISOString(),
      });

      setUser(signedIn);
      if (onUserChange) onUserChange(signedIn);
    } catch (error) {
      // Closing the popup is not an error worth surfacing
      if (error.code !== 'auth/popup-closed-by-user' && error.code !== 'auth/cancelled-popup-request') {
        console.error('Login failed:', error.code);
      }
    }
  };

  const handleSignout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error(error);
    }
  };

  if (!user) {
    return (
      <button onClick={googleAuth} className="btn-primary px-4 py-2">
        <LogIn className="h-4 w-4" />
        <span>Login</span>
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      {user.photoURL ? (
        <img
          src={user.photoURL}
          alt={user.displayName || 'Profile'}
          title={user.displayName || ''}
          referrerPolicy="no-referrer"
          className="h-9 w-9 rounded-full border-2 border-pink-400 object-cover"
        />
      ) : (
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-pink-500 text-sm font-bold text-white">
          {(user.displayName || 'U').charAt(0).toUpperCase()}
        </div>
      )}
      <button onClick={handleSignout} aria-label="Log out" title="Log out" className="btn-ghost px-3 py-2">
        <LogOut className="h-4 w-4" />
        <span className="hidden lg:inline">Log out</span>
      </button>
    </div>
  );
};

export default Authentication;
