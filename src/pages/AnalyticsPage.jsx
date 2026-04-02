import React from 'react';
import { motion } from 'framer-motion';
import { Card, ChartCard, StatCard } from '../components';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { TrendingUp, Users, Award } from 'lucide-react';
export const AnalyticsPage = () => {
  const analyticsData = [
    { month: 'Jan', views: 4000, engagement: 2400 },
    { month: 'Feb', views: 3000, engagement: 1398 },
    { month: 'Mar', views: 2000, engagement: 9800 },
    { month: 'Apr', views: 2780, engagement: 3908 },
    { month: 'May', views: 1890, engagement: 4800 },
    { month: 'Jun', views: 2390, engagement: 3800 },
  ];
  const stats = [
    { label: 'Total Views', value: '24.5K', trend: 12, icon: Users, color: 'from-purple-500 to-indigo-600' },
    { label: 'Engagement Rate', value: '68%', trend: 8, icon: TrendingUp, color: 'from-blue-500 to-cyan-600' },
    { label: 'Active Users', value: '1.2K', trend: 15, icon: Award, color: 'from-emerald-500 to-teal-600' },
  ];
  return (
    <div style={{ flex: 1, padding: 'var(--spacing-4)' }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: 'var(--spacing-8)' }}
      >
        <h1 style={{ fontSize: '1.875rem', fontWeight: '700', color: 'var(--text-light)', margin: '0 0 var(--spacing-2) 0' }}>Analytics</h1>
        <p style={{ color: 'var(--text-muted)', margin: 0 }}>Detailed insights and performance metrics</p>
      </motion.div>
      {/* Stats Cards */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ staggerChildren: 0.1 }}
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 'var(--spacing-4)',
          margin: 'var(--spacing-8) 0'
        }}
      >
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <StatCard
              icon={stat.icon}
              label={stat.label}
              value={stat.value}
              trend={stat.trend}
              color={stat.color}
            />
          </motion.div>
        ))}
      </motion.div>
      {/* Charts */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ staggerChildren: 0.1 }}
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: 'var(--spacing-6)'
        }}
      >
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <ChartCard title="Performance Trend" subtitle="Page views over time">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={analyticsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--card-border)" />
                <XAxis dataKey="month" stroke="var(--text-muted)" />
                <YAxis stroke="var(--text-muted)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--bg-main)',
                    border: '1px solid var(--card-border)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--text-light)'
                  }}
                  itemStyle={{ color: 'var(--text-light)' }}
                />
                <Line type="monotone" dataKey="views" stroke="var(--primary)" strokeWidth={2} dot={{ fill: 'var(--primary)' }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <ChartCard title="Engagement Analysis" subtitle="User interaction metrics">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={analyticsData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--card-border)" />
                <XAxis dataKey="month" stroke="var(--text-muted)" />
                <YAxis stroke="var(--text-muted)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--bg-main)',
                    border: '1px solid var(--card-border)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--text-light)'
                  }}
                  itemStyle={{ color: 'var(--text-light)' }}
                  cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
                />
                <Bar dataKey="engagement" fill="var(--secondary)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </motion.div>
      </motion.div>
    </div>
  );
};
//123
