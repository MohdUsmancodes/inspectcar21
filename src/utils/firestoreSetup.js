import { 
  collection, 
  doc, 
  setDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';

export const initializeFirestoreCollections = async () => {
  try {
    // Users Collection - Sample Admin User
    const usersRef = collection(db, 'users');
    await setDoc(doc(usersRef, 'admin-sample'), {
      email: 'admin@inspect.com',
      role: 'admin',
      displayName: 'Admin User',
      createdAt: serverTimestamp(),
      lastLogin: serverTimestamp(),
      isActive: true
    });

    // Vehicles Collection - Sample Vehicle
    const vehiclesRef = collection(db, 'vehicles');
    await setDoc(doc(vehiclesRef, 'vehicle-sample-1'), {
      make: 'Toyota',
      model: 'Camry',
      year: 2022,
      vin: '1HGCM82633A123456',
      mileage: 15000,
      condition: 'Excellent',
      price: 25000,
      imageUrls: [],
      status: 'available',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    // Orders Collection - Sample Order
    const ordersRef = collection(db, 'orders');
    await setDoc(doc(ordersRef, 'order-sample-1'), {
      userId: 'admin-sample',
      vehicleId: 'vehicle-sample-1',
      totalPrice: 25000,
      status: 'pending',
      paymentMethod: 'Credit Card',
      shippingAddress: {
        street: '123 Main St',
        city: 'Anytown',
        state: 'CA',
        zipCode: '12345',
        country: 'USA'
      },
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });

    console.log('Firestore collections initialized successfully');
    return true;
  } catch (error) {
    console.error('Error initializing Firestore collections:', error);
    return false;
  }
};

// Optional: Call this function when setting up the app
// initializeFirestoreCollections();
