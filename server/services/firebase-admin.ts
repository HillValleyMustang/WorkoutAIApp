import admin from 'firebase-admin';

if (!admin.apps.length) {
  const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  const projectId = process.env.VITE_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID;
  
  console.log('Initializing Firebase Admin with project ID:', projectId);
  
  if (serviceAccount) {
    admin.initializeApp({
      credential: admin.credential.cert(JSON.parse(serviceAccount)),
      projectId: projectId,
    });
  } else {
    // For development, try to use the project ID without credentials
    // This works for emulator and some development scenarios
    try {
      admin.initializeApp({
        projectId: projectId,
      });
      console.log('Firebase Admin initialized with project ID only');
    } catch (error) {
      console.error('Failed to initialize Firebase Admin:', error);
      throw error;
    }
  }
}

export const auth = admin.auth();
export const firestore = admin.firestore();

export async function verifyIdToken(idToken: string) {
  try {
    console.log('Attempting to verify token...');
    const decodedToken = await auth.verifyIdToken(idToken);
    console.log('Token verified successfully for UID:', decodedToken.uid);
    return decodedToken;
  } catch (error) {
    console.error('Token verification error:', error);
    throw new Error('Invalid token');
  }
}
