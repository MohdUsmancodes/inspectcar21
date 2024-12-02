import fs from 'fs/promises';
import path from 'path';

const ORDERS_FILE = path.join(process.cwd(), 'src/pages/admin/orders.json');

export async function saveOrder(orderData) {
  try {
    // Read existing orders
    let orders = { orders: [] };
    try {
      const data = await fs.readFile(ORDERS_FILE, 'utf8');
      orders = JSON.parse(data);
    } catch (error) {
      // If file doesn't exist or is invalid, start with empty orders array
      console.log('Starting with empty orders array');
    }

    // Create new order object
    const newOrder = {
      id: `ORD-${Date.now()}`,
      customerName: orderData.customerName,
      email: orderData.customerEmail,
      products: orderData.items.map(item => ({
        name: item.title,
        reportType: item.reportType,
        vin: item.vin,
        price: orderData.prices[item.reportType]
      })),
      totalAmount: orderData.amount,
      status: 'completed',
      orderDate: new Date().toISOString(),
      shippingAddress: {
        address: orderData.address,
        city: orderData.city,
        country: orderData.country
      },
      paymentMethod: 'PayPal',
      paypalOrderId: orderData.paypalOrderId,
      phoneNumber: orderData.phoneNumber
    };

    // Add new order to existing orders
    orders.orders.unshift(newOrder); // Add to beginning of array

    // Save updated orders back to file
    await fs.writeFile(ORDERS_FILE, JSON.stringify(orders, null, 2));

    return { success: true, order: newOrder };
  } catch (error) {
    console.error('Error saving order:', error);
    return { success: false, error: error.message };
  }
}
