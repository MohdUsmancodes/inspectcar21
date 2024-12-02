// Email templates
const createCustomerEmailContent = (orderData) => {
  const itemsList = orderData.items
    .map(item => `- ${item.name}: $${item.price.toFixed(2)}`)
    .join('\n');

  return `
Dear ${orderData.customerName},

Thank you for your order! Your order has been confirmed.

Order Details:
Order ID: #${orderData.id}
Total Amount: $${orderData.amount.toFixed(2)}

Items:
${itemsList}

Shipping Address:
${orderData.address}
${orderData.city}
${orderData.country}

We will process your order shortly. If you have any questions, please don't hesitate to contact us.

Best regards,
Vehicle Reports Team
  `;
};

const createAdminEmailContent = (orderData) => {
  const itemsList = orderData.items
    .map(item => `- ${item.name}: $${item.price.toFixed(2)}`)
    .join('\n');

  return `
New Order Received!

Order Details:
Order ID: #${orderData.id}
Status: ${orderData.status}
Date: ${new Date(orderData.createdAt).toLocaleString()}
Total Amount: $${orderData.amount.toFixed(2)}

Customer Information:
Name: ${orderData.customerName}
Email: ${orderData.customerEmail}
Phone: ${orderData.phoneNumber}

Items:
${itemsList}

Shipping Address:
${orderData.address}
${orderData.city}
${orderData.country}

PayPal Order ID: ${orderData.paypalOrderId}
  `;
};

// Send emails to both customer and admin
export async function sendOrderEmails(orderData) {
  try {
    // Send customer email
    const customerEmailResponse = await fetch('http://localhost:3000/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: orderData.customerEmail,
        subject: `Order Confirmation #${orderData.id}`,
        text: createCustomerEmailContent(orderData)
      }),
    });

    if (!customerEmailResponse.ok) {
      throw new Error('Failed to send customer email');
    }

    // Send admin email
    const adminEmailResponse = await fetch('http://localhost:3000/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: import.meta.env.VITE_ADMIN_EMAIL,
        subject: `New Order #${orderData.id}`,
        text: createAdminEmailContent(orderData)
      }),
    });

    if (!adminEmailResponse.ok) {
      throw new Error('Failed to send admin email');
    }

    return {
      success: true,
      message: 'Emails sent successfully'
    };
  } catch (error) {
    console.error('Error sending emails:', error);
    return {
      success: false,
      error: error.message || 'Failed to send emails'
    };
  }
}
