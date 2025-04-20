import React, { useEffect, useState } from 'react'
import { getAuth, GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut } from "firebase/auth";
import { getDatabase, ref, set } from 'firebase/database';
import { app } from '../Utils/Firebase.Jsx';

const Authentication = ({ onUserChange }) => {
  const [user, setUser] = useState(null);
  const auth = getAuth(app);
  const db = getDatabase(app);
  const provider = new GoogleAuthProvider();

  auth.useDeviceLanguage();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log("User logged in:", user);
        console.log("Photo URL:", user.photoURL);
        setUser(user);
        if (onUserChange) onUserChange(user);
      } else {
        setUser(null);
        if (onUserChange) onUserChange(null);
      }
    });
    return () => unsubscribe();
  }, [auth, onUserChange]);

  const googleAuth = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      console.log("Google Auth result:", user);
      console.log("Photo URL from Google:", user.photoURL);
      
      await set(ref(db, 'users/' + user.uid), {
        uid: user.uid,
        displayName: user.displayName,
        email: user.email,
        photoURL: user.photoURL,
        lastLogin: new Date().toISOString()
      });

      setUser(user);
      if (onUserChange) onUserChange(user);
    } catch (error) {
      console.log(error.code);
      console.log(error.email);
    }
  };

  const handleSignout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <div className="flex items-center">
      {!user ? (
        <button 
          className="bg-pink-500 hover:bg-pink-600 text-white py-1 px-4 rounded-md text-sm font-medium transition-colors duration-200 shadow-md"
          onClick={googleAuth}
        >
          Login
        </button>
      ) : (
        <button 
          className="bg-gray-700 hover:bg-gray-800 text-white py-1 px-4 rounded-md text-sm font-medium transition-colors duration-200 shadow-md"
          onClick={handleSignout}
        >
          Logout
        </button>
      )}
    </div>
  );
};

export default Authentication;