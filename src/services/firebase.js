import { initializeApp } from 'firebase/app'
import { getAuth, connectAuthEmulator } from 'firebase/auth'
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore'
import { getStorage, connectStorageEmulator } from 'firebase/storage'

// Firebase configuration - Replace with your actual config
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "demo-api-key",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "mediq-demo.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "mediq-demo",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "mediq-demo.appspot.com",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:123456789:web:abcdef"
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Firebase services
export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)

// Connect to emulators in development (optional)
if (import.meta.env.DEV && import.meta.env.VITE_USE_FIREBASE_EMULATOR === 'true') {
  try {
    // Auth emulator
    if (!auth._delegate._config.emulator) {
      connectAuthEmulator(auth, 'http://localhost:9099')
    }
    
    // Firestore emulator
    if (!db._delegate._databaseId.projectId.includes('demo')) {
      connectFirestoreEmulator(db, 'localhost', 8080)
    }
    
    // Storage emulator
    if (!storage._delegate._host.includes('localhost')) {
      connectStorageEmulator(storage, 'localhost', 9199)
    }
    
    console.log('🔥 Firebase emulators connected')
  } catch (error) {
    console.log('Firebase emulators not available:', error.message)
  }
}

// Export the app instance
export default app

// Helper function to check if Firebase is properly configured
export const isFirebaseConfigured = () => {
  const requiredKeys = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId']
  return requiredKeys.every(key => firebaseConfig[key] && !firebaseConfig[key].includes('demo'))
}

// Firebase configuration validation
if (import.meta.env.PROD && !isFirebaseConfigured()) {
  console.error('⚠️ Firebase is not properly configured. Please check your environment variables.')
}
