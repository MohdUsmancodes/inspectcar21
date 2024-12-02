import React, { useState, useEffect, useMemo } from "react";
import { toast } from "react-hot-toast";
import { ArrowLeft, Trash2, Lock, ArrowRight, CheckCircle, XCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import axios from 'axios';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Separator } from "../components/ui/separator";
import Header from "../components/navbar";
import { sendOrderEmails } from '../api/email';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/firebaseConfig';
import { useAuth } from '../context/AuthContext';

const CartItem = ({ item, onRemove, prices, fadeOut }) => {
  const getPrice = (reportType) => {
    return prices?.[reportType] || 0;
  };

  return (
    <Card className="relative overflow-hidden bg-gray-900/50 border-gray-800 hover:bg-gray-900/70 transition-all duration-300">
      <div
        className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ${
          fadeOut === item.cartId ? "opacity-100" : "opacity-0"
        }`}
      />
      <CardHeader className="relative">
        <div className="flex justify-between items-start">
          <div className="space-y-3">
            <div>
              <CardTitle className="text-xl font-bold text-white mb-1">{item.title}</CardTitle>
              <CardDescription className="text-base text-zinc-400">
                {item.reportType.replace(/([A-Z])/g, ' $1').trim()}
              </CardDescription>
            </div>
            <div className="space-y-2">
              <div className="flex items-center text-zinc-300">
                <span className="text-zinc-400 mr-2">VIN:</span>
                {item.vin || 'Not specified'}
              </div>
              <div className="text-lg font-semibold text-white">
                ${getPrice(item.reportType).toFixed(2)}
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="text-zinc-400 hover:text-red-500 hover:bg-red-500/10"
            onClick={() => onRemove(item.cartId)}
          >
            <Trash2 className="h-5 w-5" />
          </Button>
        </div>
      </CardHeader>
    </Card>
  );
};

// Customer Information Form Component
function CustomerInfoForm({ formData, setFormData, errors }) {
  return (
    <Card className="bg-gray-900/50 border-gray-800">
      <CardHeader>
        <CardTitle>Customer Information</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="customerName">Full Name</Label>
          <Input
            id="customerName"
            value={formData.customerName}
            onChange={(e) =>
              setFormData({ ...formData, customerName: e.target.value })
            }
            className="bg-gray-800/50 border-gray-700"
          />
          {errors.customerName && (
            <p className="text-red-500 text-sm">{errors.customerName}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="customerEmail">Email Address</Label>
          <Input
            id="customerEmail"
            type="email"
            value={formData.customerEmail}
            onChange={(e) =>
              setFormData({
                ...formData,
                customerEmail: e.target.value,
              })
            }
            className="bg-gray-800/50 border-gray-700"
          />
          {errors.customerEmail && (
            <p className="text-red-500 text-sm">{errors.customerEmail}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="vinNumber">VIN Number</Label>
          <Input
            id="vinNumber"
            value={formData.vinNumber}
            onChange={(e) =>
              setFormData({
                ...formData,
                vinNumber: e.target.value.toUpperCase(),
              })
            }
            className="bg-gray-800/50 border-gray-700"
            maxLength={17}
          />
          {errors.vinNumber && (
            <p className="text-red-500 text-sm">{errors.vinNumber}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="address">Address</Label>
          <Input
            id="address"
            value={formData.address || ""}
            onChange={(e) =>
              setFormData({ ...formData, address: e.target.value })
            }
            className="bg-gray-800/50 border-gray-700"
          />
          {errors.address && (
            <p className="text-red-500 text-sm">{errors.address}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="city">City</Label>
          <Input
            id="city"
            value={formData.city || ""}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            className="bg-gray-800/50 border-gray-700"
          />
          {errors.city && <p className="text-red-500 text-sm">{errors.city}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="country">Country</Label>
          <Input
            id="country"
            value={formData.country || ""}
            onChange={(e) =>
              setFormData({ ...formData, country: e.target.value })
            }
            className="bg-gray-800/50 border-gray-700"
          />
          {errors.country && (
            <p className="text-red-500 text-sm">{errors.country}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phoneNumber">Phone Number</Label>
          <Input
            id="phoneNumber"
            type="tel"
            value={formData.phoneNumber || ""}
            onChange={(e) =>
              setFormData({ ...formData, phoneNumber: e.target.value })
            }
            className="bg-gray-800/50 border-gray-700"
          />
          {errors.phoneNumber && (
            <p className="text-red-500 text-sm">{errors.phoneNumber}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Main Cart Component
export default function Cart() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fadeOut, setFadeOut] = useState(null);
  const [prices, setPrices] = useState({
    basicReport: 29.99,
    fullReport: 49.99,
    premiumReport: 79.99,
    motorcycleReport: 39.99,
    truckReport: 59.99,
  });
  const [formData, setFormData] = useState({
    customerName: "",
    customerEmail: "",
    vinNumber: "",
    address: "",
    city: "",
    country: "",
    phoneNumber: "",
  });
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    if (!formData.customerName.trim()) newErrors.customerName = "Name is required";
    if (!formData.customerEmail.trim() || !/\S+@\S+\.\S+/.test(formData.customerEmail)) 
      newErrors.customerEmail = "Valid email is required";
    if (!formData.vinNumber || formData.vinNumber.length !== 17) 
      newErrors.vinNumber = "Valid 17-character VIN is required";
    if (!formData.phoneNumber) newErrors.phoneNumber = "Phone number is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + prices[item.reportType], 0).toFixed(2);
  };

  const handleDirectCheckout = async () => {
    if (!validateForm()) {
      toast.error("Please fill out all required fields correctly");
      return;
    }

    try {
      setLoading(true);
      const orderRef = await addDoc(collection(db, 'orders'), {
        userId: currentUser?.uid || 'guest',
        items: cart.map(item => ({
          title: item.title,
          reportType: item.reportType,
          vin: item.vin,
          price: prices[item.reportType]
        })),
        totalPrice: parseFloat(calculateTotal()),
        status: 'pending',
        customerDetails: formData,
        paymentMethod: 'direct',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      // Send confirmation email (optional)
      await sendOrderEmails({
        email: formData.customerEmail,
        orderDetails: {
          orderId: orderRef.id,
          items: cart,
          total: calculateTotal()
        }
      });

      toast.success('Order placed successfully!');
      setCart([]); // Clear cart
      navigate('/');
    } catch (error) {
      console.error('Direct checkout error:', error);
      toast.error('Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const savedCart = localStorage.getItem("vehicle_reports_cart");
    if (savedCart) {
      setCart(JSON.parse(savedCart));
    }

    // Fetch prices from the server
    const fetchPrices = async () => {
      try {
        const response = await fetch("/api/prices");
        const data = await response.json();
        if (data.success) {
          setPrices(data.prices);
        }
      } catch (error) {
        console.error("Error fetching prices:", error);
      }
    };

    fetchPrices();
  }, []);

  // Calculate total using the current prices
  const total = useMemo(() => {
    return cart.reduce((sum, item) => {
      const price = prices?.[item.reportType] || 0;
      return sum + price;
    }, 0);
  }, [cart, prices]);

  const getItemPrice = (reportType) => {
    return prices?.[reportType] || 0;
  };

  const subtotal = useMemo(() => {
    return cart.reduce(
      (total, item) => total + getItemPrice(item.reportType),
      0
    );
  }, [cart, prices]);

  useEffect(() => {
    const valid = validateForm();
    console.log("Form validation result:", valid, formData);
  }, [formData]);

  const removeFromCart = (cartId) => {
    setFadeOut(cartId);
    setTimeout(() => {
      const newCart = cart.filter((item) => item.cartId !== cartId);
      setCart(newCart);
      localStorage.setItem("vehicle_reports_cart", JSON.stringify(newCart));
      setFadeOut(null);
    }, 300);
  };

  const handleCheckout = async () => {
    try {
      setLoading(true);
      
      // Save order
      const saveOrderResponse = await fetch(
        "http://localhost:3000/api/save-order",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            customerName: formData.customerName,
            customerEmail: formData.customerEmail,
            items: cart,
            amount: total,
            address: formData.address,
            city: formData.city,
            country: formData.country,
            phoneNumber: formData.phoneNumber,
            prices: prices
          }),
        }
      );

      const saveOrderResult = await saveOrderResponse.json();
      if (!saveOrderResult.success) {
        throw new Error(
          saveOrderResult.message || "Failed to save order"
        );
      }

      // Send confirmation email
      const emailResult = await sendOrderEmails({
        customerName: formData.customerName,
        customerEmail: formData.customerEmail,
        vinNumber: formData.vinNumber,
        items: cart,
        amount: total
      });
      if (!emailResult.success) {
        throw new Error(emailResult.error || "Failed to send emails");
      }

      // Clear cart and redirect
      localStorage.removeItem("vehicle_reports_cart");
      toast.success("Order placed successfully!");
      navigate("/success");
    } catch (error) {
      console.error("Error processing order:", error);
      toast.error(error.message || "Failed to process order");
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = async (details, data) => {
    try {
      const orderData = {
        orderId: `ORD${Date.now()}`,
        customerName: formData.customerName,
        customerEmail: formData.customerEmail,
        customerPhone: formData.customerPhone,
        vinNumber: cart[0]?.vin || '',
        amount: total,
        items: cart.map(item => ({
          id: item.cartId,
          title: item.title,
          reportType: item.reportType,
          price: prices[item.reportType],
          quantity: 1
        })),
        paymentStatus: 'completed',
        createdAt: new Date().toISOString()
      };

      // Send order data to backend
      const response = await axios.post('http://localhost:3000/api/orders', orderData);
      if (response.status === 201) {
        await sendOrderEmails(orderData);
        setCart([]);
        localStorage.removeItem('vehicle_reports_cart');
        navigate('/checkout');
      }
    } catch (error) {
      console.error('Error processing order:', error);
      toast.error('Failed to process order. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-950 to-gray-900 text-white">
      <Header />
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center mb-8">
          <Button
            variant="ghost"
            className="text-zinc-400 hover:text-white"
            onClick={() => navigate(-1)}
          >
            <ArrowLeft className="mr-2 h-5 w-5" />
            Back
          </Button>
          <h1 className="text-2xl font-bold ml-4">Shopping Cart</h1>
        </div>

        {cart.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-zinc-400 mb-4">Your cart is empty</p>
            <Button onClick={() => navigate("/")}>Browse Reports</Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
            {/* Cart Items and Customer Info - Left Side */}
            <div className="md:col-span-8 space-y-6">
              <div className="space-y-4">
                {cart.map((item) => (
                  <CartItem
                    key={item.cartId}
                    item={item}
                    onRemove={removeFromCart}
                    prices={prices}
                    fadeOut={fadeOut}
                  />
                ))}
              </div>

              <CustomerInfoForm
                formData={formData}
                setFormData={setFormData}
                errors={errors}
              />
            </div>

            {/* Order Summary and Payment - Right Side */}
            <div className="md:col-span-4">
              <Card className="bg-gray-900/50 border-gray-800 sticky top-4">
                <CardHeader>
                  <CardTitle className="text-xl">Order Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center text-zinc-400">
                      <span>Subtotal</span>
                      <span>${total.toFixed(2)}</span>
                    </div>
                    <Separator className="bg-gray-800" />
                    <div className="flex justify-between items-center pt-2">
                      <span className="text-lg font-semibold">Total</span>
                      <span className="text-xl font-bold text-white">${total.toFixed(2)}</span>
                    </div>
                  </div>

                  <Button
                    variant="primary"
                    size="lg"
                    className="w-full"
                    onClick={handleDirectCheckout}
                  >
                    Direct Checkout
                  </Button>

                  <PayPalScriptProvider
                    options={{
                      clientId: import.meta.env.VITE_PAYPAL_CLIENT_ID,
                      currency: "USD",
                    }}
                  >
                    <PayPalButtons
                      style={{ 
                        layout: "vertical",
                        color: "blue",
                        shape: "rect",
                        label: "pay"
                      }}
                      disabled={loading}
                      forceReRender={[total, validateForm()]}
                      createOrder={(data, actions) => {
                        return actions.order.create({
                          purchase_units: [
                            {
                              amount: {
                                value: total.toFixed(2),
                                currency_code: "USD",
                              },
                            },
                          ],
                        });
                      }}
                      onApprove={async (data, actions) => {
                        try {
                          setLoading(true);
                          await actions.order.capture();

                          // Save order to JSON
                          const orderData = {
                            id: Date.now().toString(),
                            status: 'confirmed',
                            createdAt: new Date().toISOString(),
                            paypalOrderId: data.orderID,
                            customerName: formData.customerName,
                            customerEmail: formData.customerEmail,
                            items: cart,
                            amount: total,
                            address: formData.address,
                            city: formData.city,
                            country: formData.country,
                            phoneNumber: formData.phoneNumber,
                            prices: prices
                          };

                          // Save order
                          const saveOrderResponse = await fetch(
                            "http://localhost:3000/api/save-order",
                            {
                              method: "POST",
                              headers: {
                                "Content-Type": "application/json",
                              },
                              body: JSON.stringify(orderData),
                            }
                          );

                          const saveOrderResult = await saveOrderResponse.json();
                          if (!saveOrderResult.success) {
                            throw new Error(
                              saveOrderResult.message || "Failed to save order"
                            );
                          }

                          // Send emails to customer and admin
                          const emailResult = await sendOrderEmails(orderData);
                          if (!emailResult.success) {
                            throw new Error(emailResult.error || "Failed to send emails");
                          }

                          // Clear cart and show success
                          localStorage.removeItem("vehicle_reports_cart");
                          toast.success("Order confirmed successfully!");
                          navigate('/');
                        } catch (error) {
                          console.error("Error processing order:", error);
                          toast.error(error.message || "Failed to process order");
                        } finally {
                          setLoading(false);
                        }
                      }}
                      onError={(err) => {
                        console.error("PayPal error:", err);
                        toast.error("Payment failed. Please try again.");
                      }}
                      onSuccess={handlePaymentSuccess}
                    />
                  </PayPalScriptProvider>

                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
