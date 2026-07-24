import admin from 'firebase-admin';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Inicializar Firebase Admin SDK
 */
let app;

if (!admin.apps.length) {
    const serviceAccount = {
        projectId: process.env.GOOGLE_PROJECT_ID,
        privateKey: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        clientEmail: process.env.GOOGLE_CLIENT_EMAIL
    };

    app = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: process.env.FIREBASE_DATABASE_URL,
        projectId: process.env.GOOGLE_PROJECT_ID
    });
}

const db = admin.database();
const auth = admin.auth();

export { app, db, auth, admin };
