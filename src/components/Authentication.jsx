import React, { useEffect, useState } from 'react'
import { getAuth , GoogleAuthProvider,onAuthStateChanged, signInWithPopup,signOut} from "firebase/auth";
import { getDatabase,ref,set } from 'firebase/database';
import { app } from '../Utils/Firebase.Jsx';
import Watchlist from './Watchlist';


const Authentication = () => {
    const [user, setUser] = useState(null);
    const auth = getAuth(app);
    const db = getDatabase(app);
    const provider = new GoogleAuthProvider();
    
    auth.useDeviceLanguage();

    useEffect(()=>{
        const unsubscribe = onAuthStateChanged(auth, (user) =>{
            if(user){
                // const uid = user.uid
                setUser(user);
                
            }else{
               setUser(null) 
            }
        })
        return ()=> unsubscribe();
    },[auth])
    const googleAuth = async () => {
    try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        await set(ref(db, 'users/' + user.uid), {
            uid: user.uid,
            lastLogin: new Date().toISOString()
          });
    
          setUser(user);
        // const credential = GoogleAuthProvider.credentialFromResult(result);
        // const token = credential.accessToken;
       
        
    } catch (error) {
        console.log(error.code);
        console.log(error.email);
    }
    }

    const handleSignout = async ()=>{
        try {
            await signOut(auth)
        } catch (error) {
            console.log(error)
        }   
    }
  return (
    <>
    <div>
          <button onClick={googleAuth}>Login</button>
          <button onClick={handleSignout}>Logout</button>
          <p>{user ? `Logged in as ${user.displayName}` : "Not logged in"}</p>
      </div>
      <Authentication user={user} />
      <Watchlist user = {user} />
      </>
  )
}

export default Authentication