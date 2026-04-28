import React, { useState, useEffect } from 'react';
import { API_BASE } from '../utils/api';
import { AnimatePresence, motion } from 'framer-motion';
import { Card, Button, useToast } from '../components';
import { ChartContainer, CustomTooltip } from '../components/ChartContainer';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Users, Award, TrendingUp, Clock, CheckCircle, XCircle, MessageSquare, FileText, Check } from 'lucide-react';
import { useAuth } from '../utils/AuthContext';
import { Navigate } from 'react-router-dom';
export const MentorDashboard = () => {
    const { user } = useAuth();
    const { addToast } = useToast();
    const [pendingVerifications, setPendingVerifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dashboardData, setDashboardData] = useState(null);
    const fetchPendingVerifications = React.useCallback(async () => {
        try {
            const [pendingRes, dashboardRes] = await Promise.all([
                fetch(`${API_BASE}/api/achievements/pending`, {
                    headers: { 'Authorization': `Bearer ${user?.token}` }
                }),
                fetch(`${API_BASE}/api/dashboard/mentor`, {
                    headers: { 'Authorization': `Bearer ${user?.token}` }
                })
            ]);
            if (!pendingRes.ok || !dashboardRes.ok) throw new Error('Failed to fetch data');

            const pendingData = await pendingRes.json();
            const dashboardJson = await dashboardRes.json();

            setPendingVerifications(pendingData);
            setDashboardData(dashboardJson);
        } catch (error) {
            console.error('Error loading dashboard data:', error);
            if (!loading) return;
            addToast('Error loading dashboard data', 'error');
        } finally {
            setLoading(false);
        }
    }, [user?.token, loading]); // Removed addToast as it might mutate

    useEffect(() => {
        if (user?.token) {
            fetchPendingVerifications();
        }
    }, [user?.token]); // Simplified to just user.token
    if (!user || user.role !== 'mentor') {
        return <Navigate to="/" replace />;
    }
    // Handle Verification Actions
    const handleVerify = async (id, status) => {
        try {
            const endpoint = status === 'VERIFIED' ? `verify/${id}` : `deny/${id}`;
            const response = await fetch(`${API_BASE}/api/achievements/${endpoint}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${user?.token}`
                }
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to update status');
            }
            setPendingVerifications(prev => prev.filter(v => v.id !== id));
            if (status === 'VERIFIED') {
                addToast(`Achievement verified successfully.`, 'success');
            } else {
                addToast(`Achievement rejected.`, 'warning');
            }
        } catch (error) {
            console.error('Error updating status:', error);
            addToast(error.message, 'error');
        }
    };

    const handleVerifyAll = async () => {
        try {
            const response = await fetch(`${API_BASE}/api/achievements/verify-all`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${user?.token}`
                }
            });
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || 'Failed to verify all achievements');
            }
            setPendingVerifications([]);
            addToast('All pending achievements verified successfully.', 'success');
        } catch (error) {
            console.error('Error verifying all:', error);
            addToast(error.message || 'Error verifying achievements', 'error');
        }
    };

    const statCards = [
        { label: 'Assigned Students', value: dashboardData?.totalAssignedStudents || 0, icon: Users, color: 'var(--primary)', trend: 'Total students' },
        { label: 'Pending Verifications', value: dashboardData?.pendingVerifications || 0, icon: Clock, color: 'var(--warning)', trend: 'Action needed' },
        { label: 'Verified Achievements', value: dashboardData?.approvedCount || 0, icon: Award, color: 'var(--success)', trend: 'Total approved' },
        { label: 'Total Submissions', value: dashboardData?.totalSubmissions || 0, icon: TrendingUp, color: 'var(--info)', trend: 'All assignments' },
    ];
    const categoryData = dashboardData?.categoryData || [];
    const monthlyTrends = dashboardData?.monthlyTrends || [];
    return (
        <div style={{ flex: 1, padding: 'var(--spacing-4)' }}>
            {/* Header & Quick Actions */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ marginBottom: 'var(--spacing-8)', display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-4)', justifyContent: 'space-between', alignItems: 'flex-start' }}
            >
                <div>
                    <h1 style={{ fontSize: '1.875rem', fontWeight: '700', color: 'var(--text-light)', margin: '0 0 var(--spacing-2) 0' }}>
                        Welcome back, {user.name.split(' ')[0]} 👋
                    </h1>
                    <p style={{ color: 'var(--text-muted)', margin: 0 }}>
                        Here's an overview of your students' achievements and pending tasks.
                    </p>
                </div>
                {/* Quick Actions Array */}
                <div style={{ display: 'flex', gap: 'var(--spacing-3)' }}>
                    <Button variant="secondary" onClick={() => addToast('Messaging feature coming soon!', 'info')} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <MessageSquare size={18} /> Message Students
                    </Button>
                    <Button variant="primary" onClick={() => addToast('Report generation started.', 'success')} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <FileText size={18} /> Generate Report
                    </Button>
                </div>
            </motion.div>
            {/* Stats Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: 'var(--spacing-6)',
                marginBottom: 'var(--spacing-8)'
            }}>
                {statCards.map((stat, index) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        whileHover={{ y: -5, transition: { duration: 0.2 } }}
                    >
                        <Card style={{ padding: 'var(--spacing-6)', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', cursor: 'default' }}>
                            <div>
                                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontWeight: '500', margin: '0 0 var(--spacing-2) 0' }}>
                                    {stat.label}
                                </p>
                                <h3 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-light)', margin: '0 0 var(--spacing-2) 0' }}>
                                    {stat.value}
                                </h3>
                                <span style={{ fontSize: '0.75rem', color: stat.label === 'Pending Verifications' && pendingVerifications.length > 0 ? 'var(--warning)' : 'var(--success)' }}>
                                    {stat.trend}
                                </span>
                            </div>
                            <div style={{
                                padding: '12px',
                                borderRadius: '12px',
                                background: `linear-gradient(135deg, ${String(stat.color)}22, ${String(stat.color)}11)`,
                                color: stat.color
                            }}>
                                <stat.icon size={24} />
                            </div>
                        </Card>
                    </motion.div>
                ))}
            </div>
            {/* Charts Section */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: 'var(--spacing-6)', marginBottom: 'var(--spacing-8)' }}>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                    <Card style={{ padding: 'var(--spacing-6)', height: '100%' }}>
                        <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: 'var(--text-light)', marginBottom: 'var(--spacing-6)' }}>
                            Student Achievement Categories
                        </h3>
                        <ChartContainer height={300}>
                            <PieChart>
                                <Pie
                                    data={categoryData}
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {categoryData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip content={<CustomTooltip />} />
                            </PieChart>
                        </ChartContainer>
                        {/* Legend */}
                        <div style={{ display: 'flex', justifyContent: 'center', gap: 'var(--spacing-4)', marginTop: 'var(--spacing-4)', flexWrap: 'wrap' }}>
                            {categoryData.map(item => (
                                <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: item.color }} />
                                    <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{item.name}</span>
                                </div>
                            ))}
                        </div>
                    </Card>
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                    <Card style={{ padding: 'var(--spacing-6)', height: '100%' }}>
                        <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: 'var(--text-light)', marginBottom: 'var(--spacing-6)' }}>
                            Verification Trends
                        </h3>
                        <ChartContainer height={300}>
                            <BarChart data={monthlyTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--card-border)" vertical={false} />
                                <XAxis dataKey="month" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                                <Bar dataKey="verifications" fill="var(--primary)" radius={[4, 4, 0, 0]} name="Verifications" />
                            </BarChart>
                        </ChartContainer>
                    </Card>
                </motion.div>
            </div>
            {/* Pending Verifications Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
            >
                <Card style={{ padding: 'var(--spacing-6)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--spacing-6)' }}>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: 'var(--text-light)', margin: 0 }}>
                            Pending Verifications <span style={{ background: 'var(--warning)', color: '#000', padding: '2px 8px', borderRadius: '12px', fontSize: '0.875rem', marginLeft: '8px' }}>{pendingVerifications.length}</span>
                        </h2>
                        {pendingVerifications.length > 0 && (
                            <Button variant="secondary" onClick={handleVerifyAll} style={{ fontSize: '0.875rem', padding: '8px 16px' }}>
                                Verify All
                            </Button>
                        )}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
                        <AnimatePresence>
                            {pendingVerifications.map((item) => (
                                <motion.div
                                    key={`verification-${item.id}`} // Enforce a strict key structure
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: 'auto' }}
                                    exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
                                    transition={{ duration: 0.3 }}
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'space-between',
                                        alignItems: 'center',
                                        padding: 'var(--spacing-4)',
                                        background: 'rgba(30, 41, 59, 0.4)',
                                        borderRadius: 'var(--radius-lg)',
                                        border: '1px solid var(--card-border)'
                                    }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-4)' }}>
                                        <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 'bold' }}>
                                            {(item.user?.name || 'S').charAt(0)}
                                        </div>
                                        <div>
                                            <h4 style={{ color: 'var(--text-light)', margin: '0 0 4px 0', fontSize: '1rem', fontWeight: '600' }}>{item.title}</h4>
                                            <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.875rem' }}>
                                                {item.user?.name || 'Student'} • {item.category} • {item.dateAchieved ? new Date(item.dateAchieved).toLocaleDateString() : 'N/A'}
                                            </p>
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: 'var(--spacing-2)' }}>
                                        <button
                                            onClick={() => handleVerify(item.id, 'REJECTED')}
                                            style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: 'var(--danger)', padding: '8px', borderRadius: 'var(--radius-md)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
                                            title="Reject"
                                        >
                                            <XCircle size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleVerify(item.id, 'VERIFIED')}
                                            style={{ background: 'rgba(16, 185, 129, 0.1)', border: '1px solid rgba(16, 185, 129, 0.2)', color: 'var(--success)', padding: '8px', borderRadius: 'var(--radius-md)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all 0.2s' }}
                                            title="Verify"
                                        >
                                            <Check size={18} />
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </Card>
            </motion.div>
        </div>
    );
};
