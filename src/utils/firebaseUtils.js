import { db } from './firebaseConfig';
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  updateDoc, 
  doc, 
  deleteDoc 
} from 'firebase/firestore';

// Save cart data to Firebase
export const saveCartToFirebase = async (userId, cartData) => {
  try {
    // Remove any existing cart for this user
    const q = query(collection(db, 'carts'), where('userId', '==', userId));
    const querySnapshot = await getDocs(q);
    querySnapshot.forEach(async (document) => {
      await deleteDoc(document.ref);
    });

    // Add new cart
    const cartRef = await addDoc(collection(db, 'carts'), {
      userId,
      items: cartData,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    return cartRef.id;
  } catch (error) {
    console.error('Error saving cart:', error);
    throw error;
  }
};

// Fetch user's cart
export const fetchUserCart = async (userId) => {
  try {
    const q = query(
      collection(db, 'carts'), 
      where('userId', '==', userId), 
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const cartDoc = querySnapshot.docs[0];
      return { id: cartDoc.id, ...cartDoc.data() };
    }
    return null;
  } catch (error) {
    console.error('Error fetching cart:', error);
    throw error;
  }
};

// Save order to Firebase
export const saveOrderToFirebase = async (userId, orderData) => {
  try {
    const orderRef = await addDoc(collection(db, 'orders'), {
      userId,
      ...orderData,
      createdAt: new Date(),
      status: 'pending'
    });

    return orderRef.id;
  } catch (error) {
    console.error('Error saving order:', error);
    throw error;
  }
};

// Fetch user's orders
export const fetchUserOrders = async (userId) => {
  try {
    const q = query(
      collection(db, 'orders'), 
      where('userId', '==', userId), 
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error fetching orders:', error);
    throw error;
  }
};

// Update prices in Firebase
export const updatePricesInFirebase = async (prices) => {
  try {
    const pricesRef = doc(db, 'settings', 'prices');
    await updateDoc(pricesRef, prices);
    return true;
  } catch (error) {
    console.error('Error updating prices:', error);
    
    // If document doesn't exist, create it
    if (error.code === 'not-found') {
      await addDoc(collection(db, 'settings'), {
        prices,
        updatedAt: new Date()
      });
    }
    
    throw error;
  }
};

// Fetch current prices
export const fetchCurrentPrices = async () => {
  try {
    const q = query(collection(db, 'settings'), where('prices', '!=', null));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const pricesDoc = querySnapshot.docs[0];
      return pricesDoc.data().prices;
    }
    
    // Default prices if not found
    return {
      basicReport: 29.99,
      fullReport: 49.99,
      premiumReport: 79.99,
      motorcycleReport: 39.99,
      truckReport: 59.99
    };
  } catch (error) {
    console.error('Error fetching prices:', error);
    throw error;
  }
};
