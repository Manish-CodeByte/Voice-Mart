'use client';

import { useUser, useAuth } from '@clerk/nextjs';
import { Package, Clock, CheckCircle, XCircle, Eye, Truck, Box, MapPin, CreditCard, Calendar, X, Star } from 'lucide-react';
import { redirect } from 'next/navigation';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import Breadcrumbs from '@/components/Breadcrumbs';
import { toast } from 'sonner';

import { Trans } from '@/app/context/Translator';

export default function OrdersPage() {
  const { user, isLoaded } = useUser();
  const { getToken } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (isLoaded && user) {
      fetchOrders();
    }
  }, [isLoaded, user]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const token = await getToken();
      if (!token) return;

      const response = await api.getOrders(token);
      if (response.success && response.data) {
        setOrders(response.data as any[]);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  // Listen for voice order cancellation
  useEffect(() => {
    const handleVoiceCancel = (event: any) => {
      const { orderId } = event.detail;
      console.log('Voice cancel orderId:', orderId); // Debug
      
      // Get cancelable orders
      const cancelableOrders = orders.filter(o => 
        o.status === 'pending' || o.status === 'processing'
      );
      
      if (cancelableOrders.length === 0) {
        toast.error('No cancelable orders found');
        return;
      }
      
      // Check for "latest" or "current_order" (including "latest_order")
      const orderIdLower = orderId.toLowerCase();
      if (orderIdLower === 'current_order' || 
          orderIdLower.includes('latest') || 
          orderIdLower === 'latest_order') {
        const order = cancelableOrders[0]; // First order is latest
        console.log('Latest order:', order); // Debug
        const productNames = order.items.map((item: any) => item.productName).join(', ');
        const orderIdToCancel = order.id || order._id;
        console.log('Cancelling order ID:', orderIdToCancel); // Debug
        toast.info(`Cancelling latest order: ${productNames}`);
        handleCancelOrder(orderIdToCancel);
        return;
      }
      
      // Check if orderId is a number (order index)
      const orderNumber = parseInt(orderId);
      if (!isNaN(orderNumber) && orderNumber >= 1 && orderNumber <= cancelableOrders.length) {
        const order = cancelableOrders[orderNumber - 1];
        const productNames = order.items.map((item: any) => item.productName).join(', ');
        const orderIdToCancel = order.id || order._id;
        toast.info(`Cancelling order ${orderNumber}: ${productNames}`);
        handleCancelOrder(orderIdToCancel);
        return;
      }
      
      // Check if orderId matches a product name
      const orderByProduct = cancelableOrders.find(order => {
        return order.items.some((item: any) => 
          item.productName.toLowerCase().includes(orderId.toLowerCase())
        );
      });
      
      if (orderByProduct) {
        const productNames = orderByProduct.items.map((item: any) => item.productName).join(', ');
        const orderIdToCancel = orderByProduct.id || orderByProduct._id;
        toast.info(`Cancelling order with: ${productNames}`);
        handleCancelOrder(orderIdToCancel);
        return;
      }
      
      if (cancelableOrders.length === 1) {
        // Only one order, cancel it
        const order = cancelableOrders[0];
        const productNames = order.items.map((item: any) => item.productName).join(', ');
        const orderIdToCancel = order.id || order._id;
        toast.info(`Cancelling order: ${productNames}`);
        handleCancelOrder(orderIdToCancel);
      } else {
        // Multiple orders - show list and ask user
        const orderList = cancelableOrders.map((order: any, index: number) => {
          const productNames = order.items.map((item: any) => item.productName).join(', ');
          console.log('Order items:', order.items); // Debug
          // Calculate total from items
          const total = order.items.reduce((sum: number, item: any) => {
            console.log(`Item: ${item.productName}, Price: ${item.price}, Qty: ${item.quantity}`); // Debug
            return sum + (item.price * item.quantity);
          }, 0);
          console.log('Calculated total:', total); // Debug
          return `${index + 1}. ${productNames} - ₹${total}`;
        }).join('\n');
        
        toast.info(`Multiple orders found:\n${orderList}\n\nSay "cancel order 1" or "cancel latest order"`, {
          duration: 10000,
        });
      }
    };

    window.addEventListener('voice-cancel-order', handleVoiceCancel);
    return () => window.removeEventListener('voice-cancel-order', handleVoiceCancel);
  }, [orders]);

  const handleCancelOrder = async (orderId: string) => {


    setCancelling(true);
    try {
      const token = await getToken();
      if (!token) return;

      const response = await api.cancelOrder(orderId, token);
      if (response.success) {
        await fetchOrders();
        setSelectedOrder(null);
        toast.success('Order cancelled successfully');
      }
    } catch (error) {
      console.error('Error cancelling order:', error);
      toast.error('Failed to cancel order');
    } finally {
      setCancelling(false);
    }
  };

  if (!isLoaded || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    redirect('/');
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'shipped':
      case 'out_for_delivery':
        return <Truck className="h-5 w-5 text-blue-500" />;
      case 'processing':
      case 'confirmed':
      case 'packed':
        return <Clock className="h-5 w-5 text-primary" />;
      case 'cancelled':
      case 'failed':
        return <XCircle className="h-5 w-5 text-destructive" />;
      default:
        return <Package className="h-5 w-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20';
      case 'shipped':
      case 'out_for_delivery':
        return 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20';
      case 'processing':
      case 'confirmed':
      case 'packed':
        return 'bg-primary/10 text-primary border-primary/20';
      case 'cancelled':
      case 'failed':
        return 'bg-destructive/10 text-destructive border-destructive/20';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const totalOrders = orders.length;
  const deliveredCount = orders.filter(o => o.status === 'delivered').length;
  const activeCount = orders.filter(o => ['pending', 'confirmed', 'processing', 'packed', 'shipped', 'out_for_delivery'].includes(o.status)).length;

  return (
    <div className="min-h-screen pt-24 pb-16 px-6">
      <div className="max-w-6xl mx-auto">
        <Breadcrumbs />
        
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2"><Trans>My Orders</Trans></h1>
          <p className="text-muted-foreground"><Trans>Track and manage your orders</Trans></p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <div className="p-6 rounded-2xl border-2 border-border bg-card">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 rounded-xl bg-primary/10 text-primary">
                <Package className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{totalOrders}</p>
                <p className="text-sm text-muted-foreground"><Trans>Total Orders</Trans></p>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl border-2 border-border bg-card">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 rounded-xl bg-blue-500/10 text-blue-600">
                <Truck className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{activeCount}</p>
                <p className="text-sm text-muted-foreground"><Trans>Active</Trans></p>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl border-2 border-border bg-card">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 rounded-xl bg-green-500/10 text-green-600">
                <CheckCircle className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">{deliveredCount}</p>
                <p className="text-sm text-muted-foreground"><Trans>Delivered</Trans></p>
              </div>
            </div>
          </div>
        </div>

        {/* Orders List */}
        {orders.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-flex p-6 rounded-2xl bg-accent mb-4">
              <Package className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-bold mb-2"><Trans>No orders yet</Trans></h3>
            <p className="text-muted-foreground mb-6"><Trans>Start shopping to see your orders here</Trans></p>
            <button
              onClick={() => window.location.href = '/shop'}
              className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all"
            >
              <Trans>Browse Products</Trans>
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="p-6 rounded-2xl border-2 border-border bg-card hover:border-primary/30 transition-all"
              >
                <div className="flex flex-col gap-4">
                  {/* Order Header */}
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-bold text-xl">
                          {order.items[0]?.productName}
                          {order.items.length > 1 && ` +${order.items.length - 1} more`}
                        </h3>
                        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border font-semibold text-sm ${getStatusColor(order.status)}`}>
                          {getStatusIcon(order.status)}
                          <span className="capitalize">{order.status.replace('_', ' ')}</span>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-1"><Trans>Order ID</Trans>: #{order.id.substring(0, 12)}</p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {new Date(order.createdAt).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric', 
                            year: 'numeric' 
                          })}
                        </span>
                        <span>{order.totalItems} <Trans>item(s)</Trans></span>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="font-bold text-2xl text-primary mb-2">₹{order.totalPrice.toLocaleString()}</p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="px-4 py-2 rounded-lg border-2 border-border hover:border-primary/30 hover:bg-accent transition-all flex items-center gap-2 font-semibold"
                        >
                          <Eye className="h-4 w-4" />
                          <Trans>View Details</Trans>
                        </button>
                        {!['delivered', 'cancelled', 'failed'].includes(order.status) && (
                          <button
                            onClick={() => handleCancelOrder(order.id)}
                            disabled={cancelling}
                            className="px-4 py-2 rounded-lg border-2 border-destructive/50 text-destructive hover:bg-destructive/10 transition-all font-semibold disabled:opacity-50"
                          >
                            <Trans>Cancel</Trans>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Order Items Preview */}
                  <div className="flex gap-3 overflow-x-auto pb-2">
                    {order.items.slice(0, 4).map((item: any, idx: number) => (
                      <div key={idx} className="shrink-0">
                        <img
                          src={item.productImage || 'https://via.placeholder.com/80'}
                          alt={item.productName}
                          className="w-20 h-20 rounded-lg object-cover bg-accent"
                        />
                      </div>
                    ))}
                    {order.items.length > 4 && (
                      <div className="w-20 h-20 rounded-lg bg-accent flex items-center justify-center text-muted-foreground font-semibold">
                        +{order.items.length - 4}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Order Details Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-card rounded-2xl border-2 border-border max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-card border-b border-border p-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold"><Trans>Order Details</Trans></h2>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-2 rounded-lg hover:bg-accent transition-all"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* Status & ID */}
                <div>
                  <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border font-semibold mb-3 ${getStatusColor(selectedOrder.status)}`}>
                    {getStatusIcon(selectedOrder.status)}
                    <span className="capitalize">{selectedOrder.status.replace('_', ' ')}</span>
                  </div>
                  <p className="text-sm text-muted-foreground"><Trans>Order ID</Trans>: #{selectedOrder.id}</p>
                  <p className="text-sm text-muted-foreground">
                    <Trans>Placed on</Trans> {new Date(selectedOrder.createdAt).toLocaleDateString('en-US', { 
                      month: 'long', 
                      day: 'numeric', 
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>

                {/* Items */}
                <div>
                  <h3 className="font-bold text-lg mb-3"><Trans>Items</Trans> ({selectedOrder.totalItems})</h3>
                  <div className="space-y-3">
                    {selectedOrder.items.map((item: any, idx: number) => (
                      <div key={idx} className="flex gap-4 p-4 rounded-xl bg-accent/50">
                        <img
                          src={item.productImage || 'https://via.placeholder.com/80'}
                          alt={item.productName}
                          className="w-20 h-20 rounded-lg object-cover bg-accent"
                        />
                        <div className="flex-1">
                          <h4 className="font-semibold mb-1">{item.productName}</h4>
                          <p className="text-sm text-muted-foreground mb-2"><Trans>Qty</Trans>: {item.quantity}</p>
                          <p className="font-bold text-primary">₹{(item.price * item.quantity).toLocaleString()}</p>
                          
                          {/* Write Review Button (only for delivered orders) */}
                          {selectedOrder.status === 'delivered' && (
                            <a
                              href={`/shop/${item.productId}#reviews`}
                              className="inline-flex items-center gap-1 mt-2 text-sm px-3 py-1.5 rounded-lg border border-primary text-primary hover:bg-primary hover:text-primary-foreground transition-all font-semibold"
                            >
                              <Star className="h-3.5 w-3.5" />
                              <Trans>Write Review</Trans>
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Shipping Address */}
                <div>
                  <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    <Trans>Shipping Address</Trans>
                  </h3>
                  <div className="p-4 rounded-xl bg-accent/50">
                    <p className="font-semibold mb-1">{selectedOrder.shippingAddress.fullName}</p>
                    <p className="text-sm text-muted-foreground mb-1">{selectedOrder.shippingAddress.address}</p>
                    <p className="text-sm text-muted-foreground mb-1">
                      {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} - {selectedOrder.shippingAddress.pincode}
                    </p>
                    <p className="text-sm text-muted-foreground"><Trans>Phone</Trans>: {selectedOrder.shippingAddress.phone}</p>
                  </div>
                </div>

                {/* Payment */}
                <div>
                  <h3 className="font-bold text-lg mb-3 flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    <Trans>Payment</Trans>
                  </h3>
                  <div className="p-4 rounded-xl bg-accent/50">
                    <p className="text-sm text-muted-foreground capitalize">{selectedOrder.paymentMethod.replace('_', ' ')}</p>
                    <p className="font-bold text-2xl text-primary mt-2">₹{selectedOrder.totalPrice.toLocaleString()}</p>
                  </div>
                </div>

                {/* Actions */}
                {!['delivered', 'cancelled', 'failed'].includes(selectedOrder.status) && (
                  <button
                    onClick={() => handleCancelOrder(selectedOrder.id)}
                    disabled={cancelling}
                    className="w-full px-4 py-3 rounded-xl border-2 border-destructive/50 text-destructive hover:bg-destructive/10 transition-all font-semibold disabled:opacity-50"
                  >
                    {cancelling ? <Trans>Cancelling...</Trans> : <Trans>Cancel Order</Trans>}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
