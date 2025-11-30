'use client';

import { useUser } from '@clerk/nextjs';
import { Package, Clock, CheckCircle, XCircle, Eye } from 'lucide-react';
import { redirect } from 'next/navigation';

export default function OrdersPage() {
  const { user, isLoaded } = useUser();

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    redirect('/');
  }

  // Mock orders data
  const orders = [
    {
      id: 'ORD-2024-001',
      date: '2024-11-28',
      status: 'delivered',
      total: 2499,
      items: 2,
      product: 'Wireless Headphones',
    },
    {
      id: 'ORD-2024-002',
      date: '2024-11-25',
      status: 'processing',
      total: 1299,
      items: 1,
      product: 'Smart Watch',
    },
    {
      id: 'ORD-2024-003',
      date: '2024-11-20',
      status: 'cancelled',
      total: 899,
      items: 1,
      product: 'Phone Case',
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'delivered':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'processing':
        return <Clock className="h-5 w-5 text-primary" />;
      case 'cancelled':
        return <XCircle className="h-5 w-5 text-destructive" />;
      default:
        return <Package className="h-5 w-5" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'delivered':
        return 'bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20';
      case 'processing':
        return 'bg-primary/10 text-primary border-primary/20';
      case 'cancelled':
        return 'bg-destructive/10 text-destructive border-destructive/20';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-16 px-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">My Orders</h1>
          <p className="text-muted-foreground">Track and manage your orders</p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <div className="p-6 rounded-2xl border-2 border-border bg-card">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 rounded-xl bg-primary/10 text-primary">
                <Package className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">3</p>
                <p className="text-sm text-muted-foreground">Total Orders</p>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl border-2 border-border bg-card">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 rounded-xl bg-green-500/10 text-green-600">
                <CheckCircle className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">1</p>
                <p className="text-sm text-muted-foreground">Delivered</p>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-2xl border-2 border-border bg-card">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 rounded-xl bg-primary/10 text-primary">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <p className="text-2xl font-bold">1</p>
                <p className="text-sm text-muted-foreground">Processing</p>
              </div>
            </div>
          </div>
        </div>

        {/* Orders List */}
        <div className="space-y-4">
          {orders.map((order) => (
            <div
              key={order.id}
              className="p-6 rounded-2xl border-2 border-border bg-card hover:border-primary/30 hover:shadow-xl transition-all"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-xl bg-primary/10 text-primary">
                    <Package className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg mb-1">{order.product}</h3>
                    <p className="text-sm text-muted-foreground mb-2">Order #{order.id}</p>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-muted-foreground">
                        {new Date(order.date).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric', 
                          year: 'numeric' 
                        })}
                      </span>
                      <span className="text-muted-foreground">{order.items} item(s)</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-bold text-xl mb-2">₹{order.total.toLocaleString()}</p>
                    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border font-semibold text-sm ${getStatusColor(order.status)}`}>
                      {getStatusIcon(order.status)}
                      <span className="capitalize">{order.status}</span>
                    </div>
                  </div>

                  <button className="p-3 rounded-lg border-2 border-border hover:border-primary/30 hover:bg-accent transition-all">
                    <Eye className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State (if no orders) */}
        {orders.length === 0 && (
          <div className="text-center py-16">
            <div className="inline-flex p-6 rounded-2xl bg-accent mb-4">
              <Package className="h-12 w-12 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-bold mb-2">No orders yet</h3>
            <p className="text-muted-foreground mb-6">Start shopping to see your orders here</p>
            <button className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all">
              Browse Products
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
