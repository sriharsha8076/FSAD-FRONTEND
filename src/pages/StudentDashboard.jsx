import React, { useState, useEffect } from 'react';
import { API_BASE } from '../utils/api';
import { motion } from 'framer-motion';
import { StatCard, ChartCard, AchievementCard, Card, Button } from '../components';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Award, Filter, Download, Calendar, Plus, CheckCircle, Clock, XCircle } from 'lucide-react';
import { useToast } from '../components/Toast';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../utils/AuthContext';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
export const StudentDashboard = () => {
  const [studentAchievements, setStudentAchievements] = useState([]);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();
  const navigate = useNavigate();
  const { user } = useAuth();
  const COLORS = ['var(--primary)', 'var(--secondary)', 'var(--warning)', 'var(--success)'];
  const stats = [
    { label: 'Total Achievements', value: dashboardData?.totalAchievements || 0, icon: Award, color: 'from-purple-500 to-indigo-600' },
    { label: 'Verified', value: dashboardData?.verifiedCount || 0, icon: CheckCircle, color: 'from-green-500 to-green-600' },
    { label: 'Pending', value: dashboardData?.pendingCount || 0, icon: Clock, color: 'from-yellow-500 to-yellow-600' },
    { label: 'Rejected', value: dashboardData?.rejectedCount || 0, icon: XCircle, color: 'from-red-500 to-red-600' }
  ];
  useEffect(() => {
    const fetchAchievements = async () => {
      try {
        const [achievementsRes, dashboardRes] = await Promise.all([
          fetch(`${API_BASE}/api/achievements/my`, {
            headers: { 'Authorization': `Bearer ${user?.token}` }
          }),
          fetch(`${API_BASE}/api/dashboard/student`, {
            headers: { 'Authorization': `Bearer ${user?.token}` }
          })
        ]);
        if (!achievementsRes.ok || !dashboardRes.ok) throw new Error('Failed to fetch data');

        const achievementsData = await achievementsRes.json();
        const dashboardJson = await dashboardRes.json();

        setStudentAchievements(achievementsData);
        setDashboardData(dashboardJson);
      } catch (error) {
        console.error(error);
        addToast('Error loading dashboard data', 'error');
      } finally {
        setLoading(false);
      }
    };

    if (user?.token) {
      fetchAchievements();
    }
  }, [user, addToast]);
  const badges = [
    { name: 'Rising Star', description: '5+ Achievements' },
    { name: 'Team Player', description: 'Sports Category' },
    { name: 'Tech Master', description: 'Technical Excellence' },
  ];
  const handleDownloadCertificate = async (achievement) => {
    // If an uploaded certificate exists, download it
    if (achievement.certificateUrl && achievement.certificateUrl.trim() !== '') {
      addToast(`Preparing to download certificate...`, 'info');

      try {
        const response = await fetch(`${API_BASE}/api/achievements/${achievement.id}/file`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${user?.token}`
          }
        });

        if (!response.ok) {
          if (response.status === 403) throw new Error("Unauthorized to access this file.");
          if (response.status === 404) throw new Error("File not found on server.");
          throw new Error('Failed to download file');
        }

        // Extract filename from disposition if available
        const disposition = response.headers.get('Content-Disposition');
        let filename = achievement.certificateUrl;
        if (disposition && disposition.indexOf('attachment') !== -1) {
          const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
          const matches = filenameRegex.exec(disposition);
          if (matches != null && matches[1]) filename = matches[1].replace(/['"]/g, '');
        }

        const blob = await response.blob();
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        link.click();
        URL.revokeObjectURL(link.href);

        addToast('Certificate downloaded successfully!', 'success');
      } catch (err) {
        console.error("Download Error:", err);
        addToast(err.message || 'Failed to download certificate from server.', 'error');
      }
      return;
    }

    addToast(`Generating certificate for ${achievement.title || achievement.activity}...`, 'info');
    // Create a temporary hidden div to render the certificate
    const tempDiv = document.createElement('div');
    tempDiv.style.position = 'absolute';
    tempDiv.style.left = '-9999px';
    tempDiv.style.top = '-9999px';
    document.body.appendChild(tempDiv);
    // Simple HTML structure for the certificate
    tempDiv.innerHTML = `
        <div id="temp-cert" style="
        width: 800px;
        height: 565px;
        background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%);
        color: white;
        padding: 40px;
        font-family: 'Inter', sans-serif;
        text-align: center;
        border: 12px solid rgba(79, 70, 229, 0.4);
        border-radius: 16px;
        position: relative;
        box-sizing: border-box;
        box-shadow: inset 0 0 40px rgba(0,0,0,0.5);
      ">
        <div style="font-size: 64px; margin-bottom: 24px; filter: drop-shadow(0 4px 6px rgba(0,0,0,0.3));">🏆</div>
        <h2 style="font-size: 42px; margin: 0 0 16px 0; color: #fff; font-weight: 800; letter-spacing: 1px;">Certificate of Excellence</h2>
        <p style="color: #94a3b8; font-size: 20px; margin: 0 0 8px 0; font-style: italic;">Proudly presented to</p>
        <h3 style="font-size: 36px; color: #818cf8; margin: 0 0 24px 0; font-weight: 700; text-transform: uppercase;">${user?.name || "Student"}</h3>
        <p style="color: #94a3b8; font-size: 18px; margin: 0 0 16px 0;">for outstanding performance and achieving</p>
        <h4 style="font-size: 28px; color: #f8fafc; margin: 0 0 32px 0; font-weight: 600;">${achievement.description || achievement.title}</h4>
        <div style="margin-top: 24px;">
          <span style="padding: 6px 16px; background: rgba(79, 70, 229, 0.2); border: 1px solid rgba(79, 70, 229, 0.5); border-radius: 24px; font-size: 15px; margin-right: 12px; color: #c7d2fe; font-weight: 500;">${achievement.category}</span>
          <span style="padding: 6px 16px; background: rgba(236, 72, 153, 0.2); border: 1px solid rgba(236, 72, 153, 0.5); border-radius: 24px; font-size: 15px; color: #fbcfe8; font-weight: 500;">${achievement.level} Level</span>
        </div>
        <div style="position: absolute; bottom: 40px; right: 40px; text-align: right; border-top: 2px solid rgba(255,255,255,0.1); padding-top: 8px;">
          <p style="color: #94a3b8; font-size: 14px; margin: 0 0 4px 0; text-transform: uppercase; letter-spacing: 1px;">Date Awarded</p>
          <p style="color: #f1f5f9; font-size: 18px; font-weight: 700; margin: 0;">${new Date(achievement.date).toLocaleDateString()}</p>
        </div>
        <div style="position: absolute; bottom: 40px; left: 40px; text-align: left;">
            <div style="width: 80px; height: 80px; border-radius: 50%; border: 2px dashed rgba(255,255,255,0.2); display: flex; align-items: center; justify-content: center; font-size: 12px; color: rgba(255,255,255,0.4); transform: rotate(-15deg);">Verified</div>
        </div>
      </div>
    `;
    try {
      const certElement = document.getElementById('temp-cert');
      const canvas = await html2canvas(certElement, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('l', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${user?.name || 'Student'}_${achievement.title}_Certificate.pdf`);
      addToast('Certificate downloaded successfully!', 'success');
    } catch (error) {
      console.error('Error generating PDF:', error);
      addToast('Failed to generate PDF.', 'error');
    } finally {
      document.body.removeChild(tempDiv);
    }
  };
  return (
    <div style={{ flex: 1, padding: 'var(--spacing-4)' }}>
      {/* Welcome Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: 'var(--spacing-8)' }}
      >
        <div className="glass-panel" style={{
          padding: 'var(--spacing-6)'
        }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 'var(--spacing-4)' }}>
            <div>
              <h1 style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--text-light)', margin: 0, letterSpacing: '-0.02em' }}>Welcome, {user?.name || 'Student'}!</h1>
              <p style={{ color: 'var(--text-muted)', marginTop: 'var(--spacing-1)', margin: 0, fontSize: '1.125rem' }}>Track and celebrate your achievements</p>
            </div>
            <div style={{ fontSize: '2.5rem' }} className="animate-float">🎓</div>
          </div>
        </div>
      </motion.div>
      {/* Statistics */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{ marginBottom: 'var(--spacing-8)' }}
      >
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 'var(--spacing-4)' }}>
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
                color={stat.color}
              />
            </motion.div>
          ))}
        </div>
      </motion.div>
      {/* Main Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ staggerChildren: 0.1 }}
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: 'var(--spacing-8)',
          marginBottom: 'var(--spacing-8)'
        }}
      >
        {/* Category Distribution */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <ChartCard title="Category Breakdown" subtitle="Your achievements by type">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={dashboardData?.categoryDistributionData || []}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name }) => <text fill="var(--text-light)" fontSize="12" dy={-10}>{name}</text>}
                  outerRadius={70}
                  fill="#8884d8"
                  dataKey="value"
                  stroke="var(--bg-dark)"
                  strokeWidth={2}
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

        {/* Monthly Achievements Bar Chart */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ gridColumn: '1 / -1', '@media (min-width: 1024px)': { gridColumn: 'span 2' } }}>
          <ChartCard title="Monthly Trends" subtitle="Achievements earned per month">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={dashboardData?.monthlyAchievementsData || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--card-border)" vertical={false} />
                <XAxis dataKey="month" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: 'var(--bg-dark)', border: '1px solid var(--card-border)', borderRadius: 'var(--radius-md)' }}
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                />
                <Bar dataKey="achievements" fill="var(--primary)" radius={[4, 4, 0, 0]} name="Achievements" />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </motion.div>
        {/* Badges & Achievements */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ gridColumn: '1 / -1', '@media (min-width: 1024px)': { gridColumn: 'span 2' } }}>
          <ChartCard title="Achievement Badges" subtitle="Your earned recognition">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-3)' }}>
              {badges.map((badge, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: 'var(--spacing-4)',
                    background: 'var(--bg-main)',
                    border: '1px solid var(--border-default)',
                    borderRadius: 'var(--radius-xl)',
                    cursor: 'pointer',
                    transition: 'border-color var(--transition-normal)'
                  }}
                  whileHover={{ borderColor: 'var(--primary)' }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)' }}>
                    <div style={{ fontSize: '1.5rem' }}>🏆</div>
                    <div>
                      <p style={{ fontWeight: '600', color: 'var(--text-light)', margin: 0 }}>{badge.name}</p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>{badge.description}</p>
                    </div>
                  </div>
                  <span style={{
                    padding: '2px 8px',
                    borderRadius: '9999px',
                    fontSize: '0.75rem',
                    background: 'var(--success-bg)',
                    color: 'var(--success)',
                    border: '1px solid var(--success)'
                  }}>
                    Earned
                  </span>
                </motion.div>
              ))}
            </div>
          </ChartCard>
        </motion.div>
      </motion.div>
      {/* Timeline & Recent Achievements */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div style={{ marginBottom: 'var(--spacing-6)' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 'var(--spacing-4)', marginBottom: 'var(--spacing-4)' }}>
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-light)', margin: 0 }}>My Achievements</h2>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: 0 }}>Timeline of your accomplishments</p>
            </div>
            <div style={{ display: 'flex', gap: 'var(--spacing-2)' }}>
              <Button
                variant="primary"
                onClick={() => navigate('/student/add-achievement')}
                style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)', fontSize: '0.875rem' }}
              >
                <Plus size={16} />
                Add
              </Button>
              <Button
                variant="secondary"
                onClick={() => addToast('Exporting timeline...', 'info')}
                style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)', fontSize: '0.875rem' }}
              >
                <Download size={16} />
                Export
              </Button>
            </div>
          </div>
          {/* Timeline */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
            {studentAchievements.map((achievement, index) => (
              <motion.div
                key={achievement.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card style={{ padding: 'var(--spacing-4)' }} className="glass-panel">
                  <div style={{ display: 'flex', gap: 'var(--spacing-4)' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <div style={{ width: '16px', height: '16px', borderRadius: '50%', background: 'linear-gradient(to right, var(--primary), var(--secondary))', marginTop: '8px' }} />
                      {index < studentAchievements.length - 1 && (
                        <div style={{ width: '2px', height: '64px', background: 'linear-gradient(to bottom, var(--primary), transparent)', marginTop: '8px' }} />
                      )}
                    </div>
                    <div style={{ flex: 1, paddingBottom: 'var(--spacing-4)' }}>
                      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 'var(--spacing-2)', marginBottom: 'var(--spacing-2)' }}>
                        <h3 style={{ fontWeight: '600', color: 'var(--text-light)', fontSize: '1.125rem', margin: 0 }}>{achievement.title}</h3>
                        <div style={{ display: 'flex', gap: 'var(--spacing-2)' }}>
                          <span style={{ padding: '2px 8px', borderRadius: '9999px', fontSize: '0.75rem', background: 'var(--bg-surface)', color: 'var(--text-main)', border: '1px solid var(--border-default)' }}>{achievement.category}</span>
                          <span style={{ padding: '2px 8px', borderRadius: '9999px', fontSize: '0.75rem', background: achievement.status === 'VERIFIED' ? 'var(--success-bg)' : 'var(--warning-bg)', color: achievement.status === 'VERIFIED' ? 'var(--success)' : 'var(--warning)', border: `1px solid ${achievement.status === 'VERIFIED' ? 'var(--success)' : 'var(--warning)'}` }}>{achievement.status}</span>
                        </div>
                      </div>
                      <p style={{ fontSize: '0.875rem', color: 'var(--text-light)', opacity: 0.8, margin: '0 0 var(--spacing-2) 0' }}>{achievement.description}</p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>📅 {achievement.dateAchieved ? new Date(achievement.dateAchieved).toLocaleDateString() : 'N/A'}</p>
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
            {studentAchievements.length === 0 && !loading && (
              <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: 'var(--spacing-4)' }}>No achievements yet. Start adding some!</p>
            )}
            {loading && <p style={{ color: 'var(--text-muted)', textAlign: 'center' }}>Loading...</p>}
          </div>
        </div>
      </motion.div>
      {/* Certificates Section */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ marginTop: 'var(--spacing-8)' }}>
        <div style={{ marginBottom: 'var(--spacing-4)' }}>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-light)', margin: 0 }}>Certificates</h2>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: 0 }}>View and download your achievement certificates</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--spacing-4)' }}>
          {studentAchievements.map((achievement, index) => (
            <motion.div
              key={achievement.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card hoverable className="glass-panel" style={{ overflow: 'hidden', padding: 'var(--spacing-4)' }}>
                <div style={{
                  aspectRatio: '16/9',
                  background: 'linear-gradient(to bottom right, var(--primary), var(--secondary))',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: 'var(--spacing-4)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <span style={{ fontSize: '1.875rem' }}>📜</span>
                </div>
                <h3 style={{ fontWeight: '600', color: 'var(--text-light)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', margin: '0 0 var(--spacing-1) 0' }}>{achievement.title}</h3>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '0 0 var(--spacing-4) 0' }}>{achievement.dateAchieved ? new Date(achievement.dateAchieved).toLocaleDateString() : 'N/A'}</p>
                <Button
                  variant="secondary"
                  onClick={() => handleDownloadCertificate(achievement)}
                  style={{ width: '100%', fontSize: '0.875rem' }}
                >
                  Download
                </Button>
              </Card>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};
