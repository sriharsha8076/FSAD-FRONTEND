import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, FormInput, Button, Table } from '../components';
import { useAuth } from '../utils/AuthContext';
import { useToast } from '../components/Toast';
import { UserPlus, Shield, Building, Trash2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
const adminSchema = z.object({
    id: z.string().min(1, 'Admin ID/Username is required'),
    name: z.string().min(1, 'University/Admin Name is required'),
    email: z.string().email('Invalid email format'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
});
export const SuperAdminDashboard = () => {
    const { usersDB, createUniversityAdmin, deleteUniversityAdmin, fetchAdmins } = useAuth();
    const { addToast } = useToast();
    const [isCreating, setIsCreating] = useState(false);
    useEffect(() => {
        fetchAdmins();
    }, [fetchAdmins]);
    // Filter out the admins based on actual backend data
    const universityAdmins = usersDB || [];
    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm({
        resolver: zodResolver(adminSchema),
        defaultValues: {
            id: '',
            name: '',
            email: '',
            password: '',
        }
    });
    const onSubmit = async (data) => {
        setIsCreating(true);
        try {
            await createUniversityAdmin(data);
            addToast(`University Admin created successfully!`, 'success');
            reset(); // Clear the form
        } catch (error) {
            addToast(error.message, 'error');
        }
        setIsCreating(false);
    };
    const handleDelete = async (adminId, adminName) => {
        if (window.confirm(`Are you sure you want to completely delete the University Admin account for ${adminName} (${adminId})?\n\nThis action cannot be undone.`)) {
            try {
                await deleteUniversityAdmin(adminId);
                addToast(`Successfully deleted admin: ${adminName}`, 'success');
            } catch (error) {
                addToast(error.message, 'error');
            }
        }
    };
    const columns = [
        { key: 'id', label: 'Admin ID / University Code' },
        { key: 'name', label: 'University Name' },
        { key: 'email', label: 'Admin Email' },
        {
            key: 'actions',
            label: 'Actions',
            render: (item) => (
                <button
                    onClick={() => handleDelete(item.id, item.name)}
                    style={{
                        padding: 'var(--spacing-2)',
                        background: 'rgba(239, 68, 68, 0.1)',
                        color: 'var(--danger)',
                        border: 'none',
                        borderRadius: 'var(--radius-md)',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s'
                    }}
                    title="Delete University Admin"
                >
                    <Trash2 size={18} />
                </button>
            )
        },
    ];
    return (
        <div style={{ flex: 1, padding: 'var(--spacing-4)' }}>
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ marginBottom: 'var(--spacing-8)' }}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-4)' }}>
                    <div style={{ padding: 'var(--spacing-3)', background: 'rgba(59, 130, 246, 0.1)', borderRadius: 'var(--radius-lg)' }}>
                        <Shield size={32} color="var(--primary)" />
                    </div>
                    <div>
                        <h1 style={{ fontSize: '1.875rem', fontWeight: '700', color: 'var(--text-light)', margin: 0 }}>Super Admin Hub</h1>
                        <p style={{ color: 'var(--text-muted)', marginTop: 'var(--spacing-1)', margin: 0 }}>Create and manage University Administrators</p>
                    </div>
                </div>
            </motion.div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--spacing-8)' }}>
                {/* Create New Admin Form */}
                <motion.div
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 }}
                >
                    <Card style={{ padding: 'var(--spacing-6)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)', marginBottom: 'var(--spacing-6)' }}>
                            <UserPlus size={24} color="var(--text-light)" />
                            <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: 'var(--text-light)', margin: 0 }}>Create University Admin</h2>
                        </div>
                        <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-4)' }}>
                            <FormInput
                                label="Admin ID (University Code)"
                                type="text"
                                placeholder="e.g. nyu2024"
                                error={errors.id?.message}
                                {...register('id')}
                            />
                            <FormInput
                                label="University / Admin Name"
                                type="text"
                                placeholder="e.g. New York University"
                                error={errors.name?.message}
                                {...register('name')}
                            />
                            <FormInput
                                label="Admin Email"
                                type="email"
                                placeholder="admin@university.edu"
                                error={errors.email?.message}
                                {...register('email')}
                            />
                            <FormInput
                                label="Initial Password"
                                type="password"
                                placeholder="••••••••"
                                error={errors.password?.message}
                                {...register('password')}
                            />
                            <Button type="submit" variant="primary" disabled={isCreating} style={{ marginTop: 'var(--spacing-4)' }}>
                                {isCreating ? 'Creating...' : 'Create Admin Account'}
                            </Button>
                        </form>
                    </Card>
                </motion.div>
                {/* Active Admins List */}
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 }}
                >
                    <Card style={{ padding: 'var(--spacing-6)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)', marginBottom: 'var(--spacing-6)' }}>
                            <Building size={24} color="var(--text-light)" />
                            <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: 'var(--text-light)', margin: 0 }}>Active Universities</h2>
                        </div>
                        {universityAdmins.length > 0 ? (
                            <Table
                                columns={columns}
                                data={universityAdmins}
                                keyField="id"
                            />
                        ) : (
                            <div style={{ padding: 'var(--spacing-8)', textAlign: 'center', border: '1px dashed var(--card-border)', borderRadius: 'var(--radius-lg)' }}>
                                <p style={{ color: 'var(--text-muted)', margin: 0 }}>No University Admins created yet.</p>
                            </div>
                        )}
                    </Card>
                </motion.div>
            </div>
        </div>
    );
};
