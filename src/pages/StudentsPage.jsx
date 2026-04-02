import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, FormInput, Button } from '../components';
import { mockStudents } from '../data/mockData';
import { Search, Filter, Mail, Phone } from 'lucide-react';
import { useToast } from '../components/Toast';
export const StudentsPage = () => {
  const { addToast } = useToast();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const filteredStudents = mockStudents.filter((student) =>
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.studentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.email.toLowerCase().includes(searchQuery.toLowerCase())
  );
  const sortedStudents = [...filteredStudents].sort((a, b) => {
    switch (sortBy) {
      case 'achievements':
        return b.totalAchievements - a.totalAchievements;
      case 'id':
        return a.studentId.localeCompare(b.studentId);
      default:
        return a.name.localeCompare(b.name);
    }
  });
  return (
    <div style={{ flex: 1, padding: 'var(--spacing-4)' }}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{ marginBottom: 'var(--spacing-8)' }}
      >
        <h1 style={{ fontSize: '1.875rem', fontWeight: '700', color: 'var(--text-light)', margin: 0 }}>Students</h1>
        <p style={{ color: 'var(--text-muted)', marginTop: 'var(--spacing-1)', margin: 0 }}>Manage and view student profiles</p>
      </motion.div>
      {/* Search and Filter */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{ marginBottom: 'var(--spacing-8)' }}
      >
        <Card style={{ padding: 'var(--spacing-4)', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
          <div>
            <FormInput
              type="text"
              placeholder="Search by name, ID, or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              icon={Search}
              id="studentSearch"
            />
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-4)' }}>
            <div style={{ flex: '1 1 200px' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-light)', marginBottom: 'var(--spacing-2)' }}>Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{
                  width: '100%',
                  padding: 'var(--spacing-3)',
                  borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-main)',
                  border: '1px solid var(--border-default)',
                  color: 'var(--text-main)'
                }}
              >
                <option value="name" style={{ background: 'var(--bg-elevated)' }}>Name (A-Z)</option>
                <option value="id" style={{ background: 'var(--bg-elevated)' }}>Student ID</option>
                <option value="achievements" style={{ background: 'var(--bg-elevated)' }}>Total Achievements</option>
              </select>
            </div>
            <div style={{ flex: '1 1 200px' }}>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: '600', color: 'var(--text-light)', marginBottom: 'var(--spacing-2)' }}>Results</label>
              <div style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border-default)',
                borderRadius: 'var(--radius-md)',
                padding: 'var(--spacing-3)',
                color: 'var(--text-main)'
              }}>
                {sortedStudents.length} students found
              </div>
            </div>
          </div>
        </Card>
      </motion.div>
      {/* Students Grid */}
      {sortedStudents.length > 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ staggerChildren: 0.05 }}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: 'var(--spacing-6)'
          }}
        >
          {sortedStudents.map((student, index) => (
            <motion.div
              key={student.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card hoverable style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)', height: '100%' }}>
                {/* Student Image */}
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <img
                    src={student.image}
                    alt={student.name}
                    style={{
                      width: '96px',
                      height: '96px',
                      borderRadius: '50%',
                      objectFit: 'cover',
                      border: '4px solid var(--border-default)'
                    }}
                  />
                </div>
                {/* Student Info */}
                <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)' }}>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: '700', color: 'var(--text-light)', margin: 0 }}>{student.name}</h3>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', margin: 0 }}>ID: {student.studentId}</p>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', fontSize: '0.75rem', color: 'var(--text-main)' }}>
                    <Mail size={16} />
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{student.email}</span>
                  </div>
                </div>
                {/* Achievements */}
                <div style={{
                  background: 'var(--bg-surface)',
                  border: '1px solid var(--border-default)',
                  borderRadius: 'var(--radius-md)',
                  padding: 'var(--spacing-3)',
                  textAlign: 'center'
                }}>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: '0 0 var(--spacing-2) 0' }}>Total Achievements</p>
                  <p style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-main)', margin: 0 }}>{student.totalAchievements}</p>
                </div>
                {/* Category Breakdown */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)' }}>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: '600', margin: 0 }}>Categories</p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--spacing-2)' }}>
                    {Object.entries(student.categories).map(([category, count]) => (
                      <div key={category} style={{ background: 'var(--bg-surface)', borderRadius: 'var(--radius-md)', padding: 'var(--spacing-2)', border: '1px solid var(--border-default)', textAlign: 'center' }}>
                        <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>{category}</p>
                        <p style={{ fontSize: '1.125rem', fontWeight: '700', color: 'var(--text-main)', margin: 0 }}>{count}</p>
                      </div>
                    ))}
                  </div>
                </div>
                {/* View Button */}
                <div style={{ marginTop: 'auto', paddingTop: 'var(--spacing-4)' }}>
                  <Button
                    variant="secondary"
                    onClick={() => addToast(`Opening profile for ${student.name}...`, 'info')}
                    style={{ width: '100%' }}
                  >
                    View Profile
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <Card style={{ textAlign: 'center', padding: 'var(--spacing-12)' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.125rem', margin: 0 }}>No students found</p>
          <p style={{ color: 'var(--text-muted)', opacity: 0.7, fontSize: '0.875rem', marginTop: 'var(--spacing-2)', margin: 0 }}>Try adjusting your search query</p>
        </Card>
      )}
    </div>
  );
};
