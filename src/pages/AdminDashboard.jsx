import React, { useState, useEffect } from 'react';
import { API_BASE } from '../utils/api';
import { motion } from 'framer-motion';
import { StatCard, ChartCard, AchievementCard, Card, FormInput } from '../components';
import { LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Award, Users, Flag, MapPin, Search, Lock, Key } from 'lucide-react';
import { useAuth } from '../utils/AuthContext';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from '../components/Toast';
import { Button } from '../components';

const passwordSchema = z.object({
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

export const AdminDashboard = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [achievements, setAchievements] = useState([]);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user, updateUser } = useAuth();
  const { addToast } = useToast();
  const [isUpdating, setIsUpdating] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(passwordSchema)
  });

  const onChangePasswordSubmit = async (data) => {
    setIsUpdating(true);
    try {
      updateUser({ password: data.password, mustChangePassword: false });
      addToast('Password updated successfully! Welcome to your dashboard.', 'success');
    } catch (error) { // eslint-disable-line
      addToast('Failed to update password.', 'error');
    }
    setIsUpdating(false);
  };

  const statIcons = {
    'award': Award,
    'users': Users,
    'flag': Flag,
    'map-pin': MapPin,
  };

  const COLORS = ['var(--primary)', 'var(--secondary)', 'var(--warning)', 'var(--success)'];

  useEffect(() => {
    const fetchAchievements = async () => {
      try {
        const [achievementsRes, dashboardRes] = await Promise.all([
          fetch(`${API_BASE}/api/achievements/pending`, {
            headers: { 'Authorization': `Bearer ${user?.token}` }
          }),
          fetch(`${API_BASE}/api/dashboard/admin`, {
            headers: { 'Authorization': `Bearer ${user?.token}` }
          })
        ]);
        if (!achievementsRes.ok || !dashboardRes.ok) throw new Error('Failed to fetch data');
        const data = await achievementsRes.json();
        const dashboardJson = await dashboardRes.json();
        setAchievements(data);
        setDashboardData(dashboardJson);
      } catch (error) {
        console.error(error);
        addToast('Error loading admin dashboard data', 'error');
      } finally {
        setLoading(false);
      }
    };

    if (user?.token && !user.mustChangePassword) {
      fetchAchievements();
    }
  }, [user?.token]); // eslint-disable-line react-hooks/exhaustive-deps

  const filteredAchievements = achievements.filter((achievement) =>
    (achievement.user?.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    achievement.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (user?.mustChangePassword) {
    return (
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 'var(--spacing-4)' }}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{ width: '100%', maxWidth: '400px' }}
        >
          <Card style={{ padding: 'var(--spacing-8)' }}>
            <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-6)' }}>
              <div style={{ display: 'inline-flex', padding: 'var(--spacing-4)', background: 'rgba(239, 68, 68, 0.1)', borderRadius: '50%', marginBottom: 'var(--spacing-4)' }}>
                <Lock size={32} color="var(--danger)" />
              </div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 'bold', color: 'var(--text-light)', margin: '0 0 var(--spacing-2) 0' }}>Security Required</h2>
              <p style={{ color: 'var(--text-muted)', margin: 0 }}>Please set a new personal password before accessing the dashboard.</p>
            </div>
            <form onSubmit={handleSubmit(onChangePasswordSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
              <FormInput
                label="New Password"
                type="password"
                placeholder="••••••••"
                error={errors.password?.message}
                icon={Key}
                {...register('password')}
              />
              <FormInput
                label="Confirm Password"
                type="password"
                placeholder="••••••••"
                error={errors.confirmPassword?.message}
                icon={Key}
                {...register('confirmPassword')}
              />
              <Button type="submit" variant="primary" disabled={isUpdating} style={{ width: '100%', marginTop: 'var(--spacing-4)' }}>
                {isUpdating ? 'Updating...' : 'Set New Password'}
              </Button>
            </form>
          </Card>
        </motion.div>
      </div>
    );
  }

  return (
    <>
      {/* Top Bar */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: 'var(--spacing-8)' }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 'var(--spacing-4)' }}>
          <div>
            <h1 style={{ fontSize: '1.875rem', fontWeight: '700', color: 'var(--text-light)', margin: 0 }}>University Dashboard</h1>
            <p style={{ color: 'var(--text-muted)', marginTop: 'var(--spacing-1)', margin: 0 }}>
              Welcome back, {user?.name || 'Administrator'}! Overview for University ID: <strong>{user?.id || 'Admin'}</strong>
            </p>
          </div>
          <div style={{ width: '100%', maxWidth: '300px' }}>
            <FormInput
              type="text"
              placeholder="Search achievements..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              icon={Search}
            />
          </div>
        </div>
      </motion.div>

      {/* Statistics Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ staggerChildren: 0.1 }}
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: 'var(--spacing-4)',
          marginBottom: 'var(--spacing-8)'
        }}
      >
        {[
          { label: 'Total Students', value: dashboardData?.totalStudents || 0, icon: 'users', color: 'var(--primary)' },
          { label: 'Total Mentors', value: dashboardData?.totalMentors || 0, icon: 'users', color: 'var(--info)' },
          { label: 'Total Achievements', value: dashboardData?.totalAchievements || 0, icon: 'award', color: 'var(--success)' },
          { label: 'Pending Approvals', value: dashboardData?.totalPending || 0, icon: 'flag', color: 'var(--warning)' },
        ].map((stat, index) => (
          <motion.div key={index} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <StatCard
              icon={statIcons[stat.icon]}
              label={stat.label}
              value={stat.value}
              trend={0}
              color={stat.color}
            />
          </motion.div>
        ))}
      </motion.div>

      {/* Charts Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ staggerChildren: 0.1 }}
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: 'var(--spacing-6)',
          marginBottom: 'var(--spacing-8)'
        }}
      >
        {/* Line Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ gridColumn: '1 / -1' }}
        >
          <ChartCard title="Monthly Achievements" subtitle="Track your achievement trends">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={dashboardData?.monthlyAchievementsData || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--card-border)" />
                <XAxis dataKey="month" stroke="var(--text-muted)" />
                <YAxis stroke="var(--text-muted)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--bg-dark)',
                    border: '1px solid var(--card-border)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--text-light)'
                  }}
                  itemStyle={{ color: 'var(--text-light)' }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="achievements"
                  stroke="var(--primary)"
                  strokeWidth={3}
                  dot={{ fill: 'var(--primary)' }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
        </motion.div>

        {/* Pie Chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <ChartCard title="Category Distribution" subtitle="Achievement breakdown">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={dashboardData?.categoryDistributionData || []}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name} ${value}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {dashboardData?.categoryDistributionData?.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--bg-dark)',
                    border: '1px solid var(--card-border)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--text-light)'
                  }}
                  itemStyle={{ color: 'var(--text-light)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>
        </motion.div>
      </motion.div>

      {/* Recent Achievements */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div style={{ marginBottom: 'var(--spacing-4)' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-light)', margin: '0 0 var(--spacing-2) 0' }}>Recent Achievements</h2>
          <p style={{ color: 'var(--text-muted)', margin: 0 }}>Latest submissions from your students</p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
          {loading ? (
            <Card style={{ textAlign: 'center', padding: 'var(--spacing-8)' }}>
              <p style={{ color: 'var(--text-muted)' }}>Loading pending achievements...</p>
            </Card>
          ) : filteredAchievements.length === 0 ? (
            <Card style={{ textAlign: 'center', padding: 'var(--spacing-8)' }}>
              <p style={{ color: 'var(--text-muted)' }}>No pending achievements match your search.</p>
            </Card>
          ) : (
            filteredAchievements.map((achievement, index) => (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <AchievementCard achievement={achievement} />
              </motion.div>
            ))
          )}
        </div>
      </motion.div>
    </>
  );
};
