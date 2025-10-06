'use client';

import { useSubscription } from '@/hooks/useSubscription';
import { AnimatePresence, motion } from 'framer-motion';
import {
    Activity,
    AlertCircle,
    Briefcase,
    Building2,
    Calendar,
    CheckCircle,
    ChevronRight,
    Clock,
    GraduationCap,
    Heart,
    MessageSquare,
    Send,
    Settings,
    Shield,
    Target,
    Trash2,
    UserPlus,
    Users
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

// Mock data - in production, this would come from Supabase
const mockTeamMembers = [
    {
        id: '1',
        name: 'Sarah Johnson',
        email: 'sarah.johnson@university.edu',
        role: 'AI Governance Lead',
        department: 'IT',
        status: 'active',
        tasksCompleted: 24,
        lastActive: '2025-01-20T10:30:00Z',
        avatar: 'SJ'
    },
    {
        id: '2',
        name: 'Michael Chen',
        email: 'michael.chen@university.edu',
        role: 'Academic Affairs',
        department: 'Academic',
        status: 'active',
        tasksCompleted: 18,
        lastActive: '2025-01-20T09:15:00Z',
        avatar: 'MC'
    },
    {
        id: '3',
        name: 'Emily Rodriguez',
        email: 'emily.rodriguez@university.edu',
        role: 'Compliance Officer',
        department: 'Legal',
        status: 'pending',
        tasksCompleted: 0,
        lastActive: null,
        avatar: 'ER'
    }
];

const mockTasks = [
    {
        id: '1',
        title: 'Review AI Ethics Policy Draft',
        description: 'Review and provide feedback on the updated AI ethics policy',
        assignedTo: ['1', '2'],
        dueDate: '2025-01-25',
        status: 'in-progress',
        priority: 'high',
        comments: 3
    },
    {
        id: '2',
        title: 'Complete Vendor Risk Assessment',
        description: 'Assess AI vendor compliance with institutional requirements',
        assignedTo: ['1'],
        dueDate: '2025-01-30',
        status: 'todo',
        priority: 'medium',
        comments: 1
    },
    {
        id: '3',
        title: 'Update Student Guidelines',
        description: 'Revise student AI usage guidelines based on faculty feedback',
        assignedTo: ['2'],
        dueDate: '2025-01-22',
        status: 'completed',
        priority: 'high',
        comments: 5
    }
];

const departments = [
    { id: 'it', name: 'Information Technology', icon: Building2 },
    { id: 'academic', name: 'Academic Affairs', icon: GraduationCap },
    { id: 'legal', name: 'Legal & Compliance', icon: Shield },
    { id: 'hr', name: 'Human Resources', icon: Users },
    { id: 'finance', name: 'Finance', icon: Briefcase },
    { id: 'student', name: 'Student Services', icon: Heart }
];

export default function TeamWorkspacePage() {
    const [teamMembers, setTeamMembers] = useState(mockTeamMembers);
    const [tasks, setTasks] = useState(mockTasks);
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [selectedView, setSelectedView] = useState<'overview' | 'tasks' | 'activity'>('overview');
    const { hasActiveSubscription, isLoading } = useSubscription();
    const [inviteForm, setInviteForm] = useState({
        email: '',
        role: '',
        department: 'it'
    });

    // Calculate team statistics
    const activeMembers = teamMembers.filter(m => m.status === 'active').length;
    const pendingInvites = teamMembers.filter(m => m.status === 'pending').length;
    const completedTasks = tasks.filter(t => t.status === 'completed').length;
    const overdueTasks = tasks.filter(t =>
        t.status !== 'completed' && new Date(t.dueDate) < new Date()
    ).length;

    const handleInvite = async () => {
        if (!inviteForm.email || !inviteForm.role) return;

        // In production, this would send an actual invite
        const newMember = {
            id: Date.now().toString(),
            name: inviteForm.email.split('@')[0],
            email: inviteForm.email,
            role: inviteForm.role,
            department: inviteForm.department,
            status: 'pending' as const,
            tasksCompleted: 0,
            lastActive: null,
            avatar: inviteForm.email.substring(0, 2).toUpperCase()
        };

        setTeamMembers([...teamMembers, newMember]);
        setShowInviteModal(false);
        setInviteForm({ email: '', role: '', department: 'it' });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed':
                return 'text-green-600 bg-green-100';
            case 'in-progress':
                return 'text-blue-600 bg-blue-100';
            case 'todo':
                return 'text-gray-600 bg-gray-100';
            default:
                return 'text-gray-600 bg-gray-100';
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case 'high':
                return 'text-red-600';
            case 'medium':
                return 'text-yellow-600';
            case 'low':
                return 'text-green-600';
            default:
                return 'text-gray-600';
        }
    };

    if (!hasActiveSubscription && !isLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="bg-white rounded-lg shadow-sm p-8 max-w-md text-center">
                    <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Premium Feature</h2>
                    <p className="text-gray-600 mb-6">
                        Team collaboration features are available for premium subscribers. Upgrade to invite team members and collaborate on AI implementation.
                    </p>
                    <Link
                        href="/dashboard#upgrade"
                        className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                        Upgrade to Premium
                        <ChevronRight className="ml-2 w-5 h-5" />
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b">
                <div className="max-w-7xl mx-auto px-4 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                                <Users className="w-8 h-8 mr-3 text-indigo-600" />
                                Team Workspace
                            </h1>
                            <p className="text-gray-600 mt-1">Collaborate on AI implementation across departments</p>
                        </div>
                        <button
                            onClick={() => setShowInviteModal(true)}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center"
                        >
                            <UserPlus className="w-5 h-5 mr-2" />
                            Invite Team Member
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white rounded-lg p-6 shadow-sm"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <Users className="w-8 h-8 text-indigo-600" />
                            <span className="text-2xl font-bold text-gray-900">{activeMembers}</span>
                        </div>
                        <div className="text-sm text-gray-600">Active Members</div>
                        {pendingInvites > 0 && (
                            <div className="text-xs text-indigo-600 mt-1">{pendingInvites} pending invites</div>
                        )}
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white rounded-lg p-6 shadow-sm"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <CheckCircle className="w-8 h-8 text-green-600" />
                            <span className="text-2xl font-bold text-gray-900">{completedTasks}</span>
                        </div>
                        <div className="text-sm text-gray-600">Tasks Completed</div>
                        <div className="text-xs text-green-600 mt-1">This month</div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white rounded-lg p-6 shadow-sm"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <Clock className="w-8 h-8 text-blue-600" />
                            <span className="text-2xl font-bold text-gray-900">{tasks.length - completedTasks}</span>
                        </div>
                        <div className="text-sm text-gray-600">Active Tasks</div>
                        {overdueTasks > 0 && (
                            <div className="text-xs text-red-600 mt-1">{overdueTasks} overdue</div>
                        )}
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-white rounded-lg p-6 shadow-sm"
                    >
                        <div className="flex items-center justify-between mb-4">
                            <Activity className="w-8 h-8 text-purple-600" />
                            <span className="text-2xl font-bold text-gray-900">89%</span>
                        </div>
                        <div className="text-sm text-gray-600">Team Engagement</div>
                        <div className="text-xs text-purple-600 mt-1">↑ 12% this week</div>
                    </motion.div>
                </div>

                {/* View Tabs */}
                <div className="bg-white rounded-lg shadow-sm mb-8">
                    <div className="border-b">
                        <nav className="flex">
                            {[
                                { id: 'overview', label: 'Team Overview', icon: Users },
                                { id: 'tasks', label: 'Tasks', icon: Target },
                                { id: 'activity', label: 'Recent Activity', icon: Activity }
                            ].map((tab) => {
                                const Icon = tab.icon;
                                return (
                                    <button
                                        key={tab.id}
                                        onClick={() => setSelectedView(tab.id as any)}
                                        className={`flex-1 px-6 py-4 flex items-center justify-center border-b-2 transition-colors ${selectedView === tab.id
                                                ? 'border-indigo-600 text-indigo-600'
                                                : 'border-transparent text-gray-500 hover:text-gray-700'
                                            }`}
                                    >
                                        <Icon className="w-5 h-5 mr-2" />
                                        {tab.label}
                                    </button>
                                );
                            })}
                        </nav>
                    </div>

                    <div className="p-6">
                        {selectedView === 'overview' && (
                            <div className="space-y-4">
                                {teamMembers.map((member) => (
                                    <motion.div
                                        key={member.id}
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        className="flex items-center justify-between p-4 bg-gray-50 rounded-lg"
                                    >
                                        <div className="flex items-center">
                                            <div className="w-12 h-12 bg-indigo-600 text-white rounded-full flex items-center justify-center font-semibold mr-4">
                                                {member.avatar}
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-gray-900">{member.name}</h3>
                                                <p className="text-sm text-gray-600">{member.role} • {member.department}</p>
                                                <p className="text-xs text-gray-500">{member.email}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center space-x-4">
                                            {member.status === 'active' ? (
                                                <>
                                                    <div className="text-right">
                                                        <div className="text-sm font-medium text-gray-900">{member.tasksCompleted} tasks</div>
                                                        <div className="text-xs text-gray-500">
                                                            Last active: {member.lastActive ? new Date(member.lastActive).toLocaleString() : 'Never'}
                                                        </div>
                                                    </div>
                                                    <button className="p-2 text-gray-400 hover:text-gray-600">
                                                        <Settings className="w-5 h-5" />
                                                    </button>
                                                </>
                                            ) : (
                                                <div className="flex items-center">
                                                    <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm">
                                                        Invite Pending
                                                    </span>
                                                    <button className="ml-2 text-red-400 hover:text-red-600">
                                                        <Trash2 className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}

                        {selectedView === 'tasks' && (
                            <div className="space-y-4">
                                {tasks.map((task) => (
                                    <motion.div
                                        key={task.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="bg-white border rounded-lg p-4 hover:shadow-md transition-shadow"
                                    >
                                        <div className="flex items-start justify-between mb-2">
                                            <h3 className="font-semibold text-gray-900">{task.title}</h3>
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                                                {task.status.replace('-', ' ')}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-600 mb-3">{task.description}</p>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center space-x-4">
                                                <div className="flex -space-x-2">
                                                    {task.assignedTo.map((userId) => {
                                                        const member = teamMembers.find(m => m.id === userId);
                                                        return member ? (
                                                            <div
                                                                key={userId}
                                                                className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center text-xs font-semibold border-2 border-white"
                                                                title={member.name}
                                                            >
                                                                {member.avatar}
                                                            </div>
                                                        ) : null;
                                                    })}
                                                </div>
                                                <div className="flex items-center text-sm text-gray-500">
                                                    <Calendar className="w-4 h-4 mr-1" />
                                                    Due: {new Date(task.dueDate).toLocaleDateString()}
                                                </div>
                                                <div className={`flex items-center text-sm ${getPriorityColor(task.priority)}`}>
                                                    <AlertCircle className="w-4 h-4 mr-1" />
                                                    {task.priority} priority
                                                </div>
                                            </div>
                                            <button className="flex items-center text-sm text-gray-500 hover:text-gray-700">
                                                <MessageSquare className="w-4 h-4 mr-1" />
                                                {task.comments} comments
                                            </button>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}

                        {selectedView === 'activity' && (
                            <div className="space-y-4">
                                <div className="flex items-start">
                                    <div className="w-8 h-8 bg-green-100 text-green-600 rounded-full flex items-center justify-center mt-0.5">
                                        <CheckCircle className="w-5 h-5" />
                                    </div>
                                    <div className="ml-4 flex-1">
                                        <p className="text-sm text-gray-900">
                                            <span className="font-semibold">Michael Chen</span> completed task{' '}
                                            <span className="font-medium">"Update Student Guidelines"</span>
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">2 hours ago</p>
                                    </div>
                                </div>

                                <div className="flex items-start">
                                    <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mt-0.5">
                                        <MessageSquare className="w-5 h-5" />
                                    </div>
                                    <div className="ml-4 flex-1">
                                        <p className="text-sm text-gray-900">
                                            <span className="font-semibold">Sarah Johnson</span> commented on{' '}
                                            <span className="font-medium">"Review AI Ethics Policy Draft"</span>
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">3 hours ago</p>
                                    </div>
                                </div>

                                <div className="flex items-start">
                                    <div className="w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center mt-0.5">
                                        <UserPlus className="w-5 h-5" />
                                    </div>
                                    <div className="ml-4 flex-1">
                                        <p className="text-sm text-gray-900">
                                            <span className="font-semibold">Emily Rodriguez</span> was invited to the team
                                        </p>
                                        <p className="text-xs text-gray-500 mt-1">1 day ago</p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Invite Modal */}
            <AnimatePresence>
                {showInviteModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-gray-900/50 flex items-center justify-center z-50 p-4"
                        onClick={() => setShowInviteModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-lg shadow-xl max-w-md w-full p-6"
                        >
                            <h2 className="text-xl font-bold text-gray-900 mb-4">Invite Team Member</h2>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Email Address
                                    </label>
                                    <input
                                        type="email"
                                        value={inviteForm.email}
                                        onChange={(e) => setInviteForm({ ...inviteForm, email: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        placeholder="colleague@university.edu"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Role
                                    </label>
                                    <input
                                        type="text"
                                        value={inviteForm.role}
                                        onChange={(e) => setInviteForm({ ...inviteForm, role: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                        placeholder="e.g., Data Protection Officer"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Department
                                    </label>
                                    <select
                                        value={inviteForm.department}
                                        onChange={(e) => setInviteForm({ ...inviteForm, department: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    >
                                        {departments.map((dept) => (
                                            <option key={dept.id} value={dept.id}>
                                                {dept.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="mt-6 flex gap-3">
                                <button
                                    onClick={() => setShowInviteModal(false)}
                                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleInvite}
                                    className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center"
                                >
                                    <Send className="w-4 h-4 mr-2" />
                                    Send Invite
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}