import { messaging } from './firebase';
import { getToken } from 'firebase/messaging';

const VAPID_KEY = 'BDnGebf7kUA4SLfjJC8bKZz-PRH7BgRhPwoab2Nt4XlZ7JpwxRFpvHvXvHSKcFy9E9ARcKcCT1wIb6Ik5X0Xxoo';

export async function requestFirebaseNotificationPermission(): Promise<string | null> {
    try {
        const token = await getToken(messaging, { vapidKey: VAPID_KEY });
        console.log('FCM Token:', token);
        return token;
    } catch (error) {
        console.error('Error getting FCM token:', error);
        return null;
    }
}
