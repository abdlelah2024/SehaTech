
"use client";

import { useEffect } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, rtdb } from '@/lib/firebase';
import { ref, onValue, onDisconnect, set, serverTimestamp } from 'firebase/database';

export function useUserPresence() {
  const [user] = useAuthState(auth);

  useEffect(() => {
    if (user) {
      const userStatusRef = ref(rtdb, `users/${user.uid}`);
      const isOfflineForDatabase = {
        state: 'offline',
        last_changed: serverTimestamp(),
      };
      const isOnlineForDatabase = {
        state: 'online',
        last_changed: serverTimestamp(),
      };

      const conRef = ref(rtdb, '.info/connected');

      onValue(conRef, (snap) => {
        if (snap.val() === false) {
          // If not connected, don't do anything
          return;
        }
        
        // When the user disconnects, set their status to offline
        onDisconnect(userStatusRef).set(isOfflineForDatabase).then(() => {
          // When the user is connected, set their status to online
          set(userStatusRef, isOnlineForDatabase);
        });
      });
    }
  }, [user]);
}
