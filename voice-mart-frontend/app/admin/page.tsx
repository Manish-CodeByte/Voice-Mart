'use client';

import { useAuth } from '@clerk/nextjs';
import { Package, ShoppingBag, Users, TrendingUp, Eye, IndianRupee } from 'lucide-react';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';

export default function AdminDashboard() {
  const { getToken } = useAuth();
  const [stats, setStats] = useState<any>({
    orders: { totalOrders: 0, totalRevenue: 0, pendingOrders: 0, deliveredOrders: 0 },
    users: { totalUsers: 0 },
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const token = await getToken();
      if (!token) return;

      const [orderStatsRes, userStatsRes, ordersRes] = await Promise.all([
        api.getOrderStats(token),
        api.getUserStats(token),
        api.getAllOrdersAdmin(token),
      ]);

      if (orderStatsRes.success) {
        setStats((prev: any) => ({ ...prev, orders: orderStatsRes.data }));
      }

      if (userStatsRes.success) {
        setStats((prev: any) => ({ ...prev, users: userStatsRes.data }));
      }

      if (ordersRes.success && ordersRes.data) {
        setRecentOrders((ordersRes.data as any[]).slice(0, 5));
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Revenue',
      value: `₹${stats.orders.totalRevenue.toLocaleString()}`,
      icon: IndianRupee,
      color: 'text-green-600',
      bgColor: 'bg-green-500/10',
    },
    {
      title: 'Total Orders',
      value: stats.orders.totalOrders,
      icon: ShoppingBag,
      color: 'text-blue-600',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: 'Pending Orders',
      value: stats.orders.pendingOrders,
      icon: Package,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      title: 'Total Users',
      value: stats.users.totalUsers,
      icon: Users,
      color: 'text-purple-600',
      bgColor: 'bg-purple-500/10',
    },
  ];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your store</p>
      </div>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.title} className="p-6 rounded-2xl border-2 border-border bg-card">
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-xl ${stat.bgColor}`}>
                  <Icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
              <p className="text-3xl font-bold mb-1">{stat.value}</p>
              <p className="text-sm text-muted-foreground">{stat.title}</p>
            </div>
          );
        })}
      </div>

      {/* Recent Orders */}
      <div className="p-6 rounded-2xl border-2 border-border bg-card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Recent Orders</h2>
          <a
            href="/admin/orders"
            className="text-primary hover:underline font-semibold flex items-center gap-2"
          >
            View All
            <Eye className="h-4 w-4" />
          </a>
        </div>

        {recentOrders.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No recent orders</p>
        ) : (
          <div className="space-y-3">
            {recentOrders.map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between p-4 rounded-xl border border-border hover:bg-accent transition-all"
              >
                <div>
                  <p className="font-semibold">Order #{order.id.substring(0, 8)}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(order.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-primary">₹{order.totalPrice.toLocaleString()}</p>
                  <p className="text-sm text-muted-foreground capitalize">{order.status}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid md:grid-cols-3 gap-4 mt-6">
        <a
          href="/admin/products/new"
          className="p-6 rounded-2xl border-2 border-border bg-card hover:border-primary/30 transition-all text-center"
        >
          <Package className="h-8 w-8 mx-auto mb-3 text-primary" />
          <h3 className="font-bold text-lg mb-1">Add Product</h3>
          <p className="text-sm text-muted-foreground">Create a new product</p>
        </a>

        <a
          href="/admin/orders"
          className="p-6 rounded-2xl border-2 border-border bg-card hover:border-primary/30 transition-all text-center"
        >
          <ShoppingBag className="h-8 w-8 mx-auto mb-3 text-primary" />
          <h3 className="font-bold text-lg mb-1">Manage Orders</h3>
          <p className="text-sm text-muted-foreground">View and update orders</p>
        </a>

        <a
          href="/admin/users"
          className="p-6 rounded-2xl border-` border-border bg-card hover:border-primary/30 transition-all text-center"
        >
          <Users className="h-8 w-8 mx-auto mb-3 text-primary" />
          <h3 className="font-bold text-lg mb-1">View Users</h3>
          <p className="text-sm text-muted-foreground">See all registered users</p>
        </a>
      </div>
    </div>
  );
}
