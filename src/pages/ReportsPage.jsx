import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, ChartCard, StatCard, Button, Table } from '../components';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Download, Calendar, TrendingUp } from 'lucide-react';
import { useToast } from '../components/Toast';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
export const ReportsPage = () => {
  const { addToast } = useToast();
  const [dateRange, setDateRange] = useState('month');
  const growthData = [
    { date: 'Jan 1', value: 10 },
    { date: 'Jan 8', value: 15 },
    { date: 'Jan 15', value: 25 },
    { date: 'Jan 22', value: 30 },
    { date: 'Jan 29', value: 45 },
    { date: 'Feb 5', value: 60 },
    { date: 'Feb 12', value: 75 },
  ];
  const categoryStats = [
    { id: 1, category: 'Sports', achievements: 35 },
    { id: 2, category: 'Technical', achievements: 28 },
    { id: 3, category: 'Cultural', achievements: 25 },
    { id: 4, category: 'Other', achievements: 12 },
  ];
  const statisticsData = [
    { label: 'Total Achievements', value: 100, trend: 12 },
    { label: 'New This Month', value: 18, trend: 8 },
    { label: 'Verified', value: 95, trend: 5 },
    { label: 'Pending', value: 5, trend: -2 },
  ];
  const columns = [
    { key: 'category', label: 'Category' },
    { key: 'achievements', label: 'Count' },
    {
      key: 'percentage',
      label: 'Percentage',
      render: (item) => <span style={{ color: 'var(--primary)' }}>{Math.round((item.achievements / 100) * 100)}%</span>
    },
    {
      key: 'trend',
      label: 'Trend',
      render: () => (
        <span style={{
          padding: '4px 12px',
          borderRadius: '9999px',
          fontSize: '0.75rem',
          fontWeight: '600',
          background: 'var(--success-bg)',
          color: 'var(--success)',
          border: '1px solid rgba(16, 185, 129, 0.3)'
        }}>
          ↑ +5%
        </span>
      )
    },
  ];
  const handleDownloadReport = async () => {
    const reportElement = document.getElementById('report-content');
    if (!reportElement) return;
    addToast('Generating full PDF report...', 'info');
    try {
      // Temporarily hide the download button to prevent it from appearing in the PDF
      const downloadBtn = document.getElementById('download-report-btn');
      if (downloadBtn) downloadBtn.style.display = 'none';
      const canvas = await html2canvas(reportElement, {
        scale: 2,
        backgroundColor: '#151521' // Match the dark background
      });
      if (downloadBtn) downloadBtn.style.display = 'flex';
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4'); // Portrait A4
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      let position = 0;
      let heightLeft = pdfHeight;
      const pageHeight = pdf.internal.pageSize.getHeight();
      // Handle multi-page PDF
      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
      heightLeft -= pageHeight;
      while (heightLeft >= 0) {
        position = heightLeft - pdfHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
        heightLeft -= pageHeight;
      }
      pdf.save(`SAAMS_Analytics_Report_${dateRange}.pdf`);
      addToast('Report downloaded successfully!', 'success');
    } catch (error) {
      console.error('Error generating PDF report:', error);
      addToast('Failed to generate PDF report.', 'error');
    }
  };
  return (
    <div id="report-content" style={{ flex: 1, padding: 'var(--spacing-4)', background: 'var(--bg-dark)' }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: 'var(--spacing-8)' }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 'var(--spacing-4)' }}>
          <div>
            <h1 style={{ fontSize: '1.875rem', fontWeight: '700', color: 'var(--text-light)', margin: 0 }}>Reports</h1>
            <p style={{ color: 'var(--text-muted)', marginTop: 'var(--spacing-1)', margin: 0 }}>Comprehensive achievement analytics and statistics</p>
          </div>
          <Button
            id="download-report-btn"
            variant="primary"
            onClick={handleDownloadReport}
            style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)' }}
          >
            <Download size={16} />
            Download Report
          </Button>
        </div>
      </motion.div>
      {/* Date Range Selector */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{ marginBottom: 'var(--spacing-8)' }}
      >
        <Card style={{ padding: 'var(--spacing-4)', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
          <div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: '600', color: 'var(--text-light)', display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)', margin: '0 0 var(--spacing-4) 0' }}>
              <Calendar size={20} />
              Report Period
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: 'var(--spacing-3)', marginBottom: 'var(--spacing-4)' }}>
              {['week', 'month', 'quarter', 'year'].map((period) => (
                <button
                  key={period}
                  onClick={() => setDateRange(period)}
                  style={{
                    padding: 'var(--spacing-2) var(--spacing-4)',
                    borderRadius: 'var(--radius-md)',
                    fontWeight: '600',
                    textTransform: 'capitalize',
                    transition: 'all var(--transition-normal)',
                    background: dateRange === period ? 'linear-gradient(135deg, var(--primary), var(--secondary))' : 'var(--bg-main)',
                    border: dateRange === period ? 'none' : '1px solid var(--card-border)',
                    color: dateRange === period ? 'white' : 'var(--text-muted)',
                    cursor: 'pointer',
                    boxShadow: dateRange === period ? 'var(--shadow-glow)' : 'none',
                  }}
                >
                  {period}
                </button>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--spacing-3)' }}>
              <input type="date" style={{
                padding: 'var(--spacing-3)',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-main)',
                border: '1px solid var(--card-border)',
                color: 'var(--text-light)',
                colorScheme: 'dark'
              }} />
              <input type="date" style={{
                padding: 'var(--spacing-3)',
                borderRadius: 'var(--radius-md)',
                background: 'var(--bg-main)',
                border: '1px solid var(--card-border)',
                color: 'var(--text-light)',
                colorScheme: 'dark'
              }} />
            </div>
          </div>
        </Card>
      </motion.div>
      {/* Statistics Cards */}
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
        {statisticsData.map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
          >
            <StatCard
              label={stat.label}
              value={stat.value}
              trend={stat.trend}
              icon={TrendingUp}
              color="from-purple-500 to-indigo-600"
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
          gap: 'var(--spacing-6)',
          marginBottom: 'var(--spacing-8)'
        }}
      >
        {/* Growth Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <ChartCard title="Achievement Growth" subtitle="Trend over time">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={growthData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--card-border)" />
                <XAxis dataKey="date" stroke="var(--text-muted)" />
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
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="var(--primary)"
                  strokeWidth={3}
                  dot={{ fill: 'var(--primary)' }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>
        </motion.div>
        {/* Category Distribution Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <ChartCard title="Category Distribution" subtitle="By achievement type">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={categoryStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--card-border)" />
                <XAxis dataKey="category" stroke="var(--text-muted)" />
                <YAxis stroke="var(--text-muted)" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'var(--bg-dark)',
                    border: '1px solid var(--card-border)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--text-light)'
                  }}
                  itemStyle={{ color: 'var(--text-light)' }}
                  cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }}
                />
                <Bar dataKey="achievements" fill="var(--primary)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
        </motion.div>
      </motion.div>
      {/* Summary Table */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <ChartCard title="Detailed Summary" subtitle="Complete achievement breakdown">
          <Table
            columns={columns}
            data={categoryStats}
            keyField="id"
          />
        </ChartCard>
      </motion.div>
    </div>
  );
};
