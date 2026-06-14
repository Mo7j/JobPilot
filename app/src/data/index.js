import { isDemoMode } from '../config';
import { firestoreAdapter } from './firestoreAdapter';
import { demoAdapter } from './demoAdapter';

/**
 * The single data seam. Every read/write in the app goes through this
 * object, live Firestore when configured, the in-memory demo otherwise.
 */
export const dataSource = isDemoMode ? demoAdapter : firestoreAdapter;
export { resetDemo } from './demoAdapter';
