import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuthStore } from '../../lib/stores/authStore';
import { useOrderStore } from '../../lib/stores/orderStore';

export default function DashboardScreen() {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { orders, isLoading, fetchOrders } = useOrderStore();
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!user) {
      router.replace('/(auth)/login');
      return;
    }
    fetchOrders();
  }, [user]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchOrders();
    setRefreshing(false);
  };

  const handleLogout = () => {
    logout();
    router.replace('/(auth)/login');
  };

  const stats = {
    total: orders.length,
    pending: orders.filter((o) => o.status === 'pending').length,
    ready: orders.filter((o) => o.status === 'ready').length,
    completed: orders.filter((o) => o.status === 'completed').length,
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome back,</Text>
          <Text style={styles.userName}>{user?.name}</Text>
        </View>
        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <StatCard
            label="Total Orders"
            value={stats.total}
            color="#4CAF50"
            icon="📦"
          />
          <StatCard
            label="Pending"
            value={stats.pending}
            color="#FF9800"
            icon="⏳"
          />
          <StatCard
            label="Ready"
            value={stats.ready}
            color="#2196F3"
            icon="✓"
          />
          <StatCard
            label="Completed"
            value={stats.completed}
            color="#9C27B0"
            icon="✓✓"
          />
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <ActionCard
              title="Manage Menu"
              onPress={() => router.push('/(admin)/menu')}
              icon="🍽️"
            />
            <ActionCard
              title="Scan QR"
              onPress={() => router.push('/(admin)/scanner')}
              icon="📱"
            />
          </View>
        </View>

        {/* Recent Orders */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Orders</Text>
          {isLoading ? (
            <ActivityIndicator size="large" color="#4CAF50" />
          ) : orders.length === 0 ? (
            <Text style={styles.emptyText}>No orders yet</Text>
          ) : (
            <View style={styles.ordersList}>
              {orders.slice(0, 5).map((order) => (
                <OrderItem key={order.id} order={order} />
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const StatCard = ({ label, value, color, icon }: any) => (
  <View style={[styles.statCard, { borderLeftColor: color, borderLeftWidth: 4 }]}>
    <Text style={styles.statIcon}>{icon}</Text>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const ActionCard = ({ title, onPress, icon }: any) => (
  <TouchableOpacity style={styles.actionCard} onPress={onPress}>
    <Text style={styles.actionIcon}>{icon}</Text>
    <Text style={styles.actionTitle}>{title}</Text>
  </TouchableOpacity>
);

const OrderItem = ({ order }: any) => (
  <View style={styles.orderItem}>
    <View>
      <Text style={styles.orderId}>Order #{order.id}</Text>
      <Text style={styles.orderCustomer}>{order.studentName}</Text>
      <Text style={styles.orderPrice}>₹{order.totalPrice}</Text>
    </View>
    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(order.status) }]}>
      <Text style={styles.statusText}>{order.status}</Text>
    </View>
  </View>
);

const getStatusColor = (status: string) => {
  const colors: Record<string, string> = {
    pending: '#FF9800',
    confirmed: '#2196F3',
    ready: '#4CAF50',
    completed: '#9C27B0',
  };
  return colors[status] || '#999';
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingTop: 60,
  },
  header: {
    backgroundColor: '#4CAF50',
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  greeting: {
    color: '#fff',
    fontSize: 14,
    opacity: 0.8,
  },
  userName: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
  },
  logoutBtn: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  logoutText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  statIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
  },
  statLabel: {
    fontSize: 12,
    color: '#999',
    marginTop: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#000',
  },
  actionsGrid: {
    flexDirection: 'row',
    gap: 12,
  },
  actionCard: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 8,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  actionIcon: {
    fontSize: 32,
    marginBottom: 8,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000',
    textAlign: 'center',
  },
  ordersList: {
    gap: 8,
  },
  orderItem: {
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderId: {
    fontWeight: 'bold',
    color: '#000',
    fontSize: 14,
  },
  orderCustomer: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
  },
  orderPrice: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4CAF50',
    marginTop: 4,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    fontSize: 14,
    paddingVertical: 20,
  },
});
