import fs from 'fs/promises';
import path from 'path';

const ORDERS_FILE = path.join(process.cwd(), 'src/pages/admin/orders.json');

export async function removeOrder(orderId) {
  try {
    // Read existing orders
    const data = await fs.readFile(ORDERS_FILE, 'utf8');
    const orders = JSON.parse(data);

    // Find and remove the order
    const orderIndex = orders.orders.findIndex(order => order.id === orderId);
    if (orderIndex === -1) {
      return { success: false, message: 'Order not found' };
    }

    // Remove the order
    orders.orders.splice(orderIndex, 1);

    // Save updated orders back to file
    await fs.writeFile(ORDERS_FILE, JSON.stringify(orders, null, 2));

    return { success: true };
  } catch (error) {
    console.error('Error removing order:', error);
    return { success: false, error: error.message };
  }
}
