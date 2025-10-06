'use client';

import { useSubscription } from '@/hooks/useSubscription';
import { createClient } from '@/lib/supabase/client';
import { motion } from 'framer-motion';
import {
    AlertTriangle,
    BookOpen,
    Briefcase,
    Building2,
    ChevronRight,
    Clock,
    Download,
    Eye,
    FileText,
    Filter,
    GraduationCap,
    Heart,
    Lock,
    Search,
    Shield,
    Sparkles,
    Users
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

// Policy categories with icons
const categories = [
    { id: 'governance', name: 'Governance & Oversight', icon: Shield, color: 'blue' },
    { id: 'ethics', name: 'Ethics & Responsible AI', icon: Heart, color: 'purple' },
    { id: 'data', name: 'Data Privacy & Security', icon: Lock, color: 'green' },
    { id: 'academic', name: 'Academic Integrity', icon: GraduationCap, color: 'indigo' },
    { id: 'hr', name: 'HR & Employment', icon: Users, color: 'yellow' },
    { id: 'it', name: 'IT & Technical', icon: Building2, color: 'red' },
    { id: 'risk', name: 'Risk Management', icon: AlertTriangle, color: 'orange' },
    { id: 'vendor', name: 'Vendor Management', icon: Briefcase, color: 'teal' }
];

// Sample policies - in production, these would come from database
const policies = [
    {
        id: '1',
        title: 'AI Governance Framework Policy',
        category: 'governance',
        description: 'Comprehensive framework for AI governance including roles, responsibilities, and decision-making processes',
        lastUpdated: '2025-01-15',
        downloads: 1247,
        rating: 4.8,
        tags: ['governance', 'framework', 'roles', 'leadership'],
        premium: false
    },
    {
        id: '2',
        title: 'Ethical AI Use Policy',
        category: 'ethics',
        description: 'Guidelines for responsible and ethical use of AI systems across the institution',
        lastUpdated: '2025-01-10',
        downloads: 892,
        rating: 4.9,
        tags: ['ethics', 'responsible AI', 'bias', 'fairness'],
        premium: false
    },
    {
        id: '3',
        title: 'Student Data Privacy in AI Systems',
        category: 'data',
        description: 'Specific protections for student data when used in AI-powered educational tools',
        lastUpdated: '2025-01-12',
        downloads: 1523,
        rating: 4.7,
        tags: ['FERPA', 'privacy', 'student data', 'compliance'],
        premium: true
    },
    {
        id: '4',
        title: 'AI Academic Integrity Policy',
        category: 'academic',
        description: 'Comprehensive policy on appropriate use of AI tools in academic work, including ChatGPT and similar tools',
        lastUpdated: '2025-01-08',
        downloads: 2341,
        rating: 4.9,
        tags: ['ChatGPT', 'plagiarism', 'academic honesty', 'student guidelines'],
        premium: false
    },
    {
        id: '5',
        title: 'AI in Hiring and Employment Decisions',
        category: 'hr',
        description: 'Guidelines for using AI in recruitment, hiring, and employee evaluation processes',
        lastUpdated: '2025-01-05',
        downloads: 567,
        rating: 4.6,
        tags: ['hiring', 'bias', 'employment', 'HR'],
        premium: true
    },
    {
        id: '6',
        title: 'AI System Procurement Policy',
        category: 'vendor',
        description: 'Requirements and evaluation criteria for purchasing AI-powered systems and services',
        lastUpdated: '2025-01-14',
        downloads: 423,
        rating: 4.7,
        tags: ['procurement', 'vendor', 'evaluation', 'RFP'],
        premium: true
    },
    {
        id: '7',
        title: 'AI Risk Assessment Framework',
        category: 'risk',
        description: 'Structured approach to identifying and mitigating risks in AI implementations',
        lastUpdated: '2025-01-11',
        downloads: 789,
        rating: 4.8,
        tags: ['risk', 'assessment', 'mitigation', 'framework'],
        premium: true
    },
    {
        id: '8',
        title: 'AI Tool Acceptable Use Policy',
        category: 'it',
        description: 'IT guidelines for approved AI tools, security requirements, and usage restrictions',
        lastUpdated: '2025-01-13',
        downloads: 1456,
        rating: 4.7,
        tags: ['IT', 'security', 'acceptable use', 'tools'],
        premium: false
    }
];

export default function PolicyLibraryPage() {
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filteredPolicies, setFilteredPolicies] = useState(policies);
    const { hasActiveSubscription, isLoading } = useSubscription();

    useEffect(() => {
        let filtered = policies;

        // Filter by category
        if (selectedCategory) {
            filtered = filtered.filter(p => p.category === selectedCategory);
        }

        // Filter by search term
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(p =>
                p.title.toLowerCase().includes(term) ||
                p.description.toLowerCase().includes(term) ||
                p.tags.some(tag => tag.toLowerCase().includes(term))
            );
        }

        setFilteredPolicies(filtered);
    }, [selectedCategory, searchTerm]);

    const handleDownload = async (policyId: string, isPremium: boolean) => {
        if (isPremium && !hasActiveSubscription) {
            // Redirect to upgrade
            window.location.href = '/dashboard#upgrade';
            return;
        }

        // Track download
        const supabase = createClient();
        await supabase.from('policy_downloads').insert({
            policy_id: policyId,
            user_id: (await supabase.auth.getUser()).data.user?.id
        });

        // In production, this would trigger actual file download
        alert('Policy template downloaded!');
    };

    const getCategoryIcon = (categoryId: string) => {
        const category = categories.find(c => c.id === categoryId);
        return category ? category.icon : FileText;
    };

    const getCategoryColor = (categoryId: string) => {
        const category = categories.find(c => c.id === categoryId);
        return category ? category.color : 'gray';
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Hero Section */}
            <section className="bg-gradient-to-b from-indigo-600 to-indigo-700 text-white py-16">
                <div className="max-w-6xl mx-auto px-4">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center"
                    >
                        <div className="flex items-center justify-center mb-6">
                            <BookOpen className="w-12 h-12 mr-3" />
                            <h1 className="text-4xl font-bold">AI Policy Template Library</h1>
                        </div>
                        <p className="text-xl text-indigo-100 max-w-3xl mx-auto mb-8">
                            50+ expertly crafted, customizable policy templates to accelerate your AI governance implementation
                        </p>

                        {!hasActiveSubscription && !isLoading && (
                            <div className="bg-indigo-500/30 backdrop-blur rounded-lg p-4 inline-flex items-center">
                                <Sparkles className="w-5 h-5 mr-2 text-yellow-300" />
                                <span>Premium members get access to all templates + monthly updates</span>
                            </div>
                        )}
                    </motion.div>
                </div>
            </section>

            <div className="max-w-6xl mx-auto px-4 py-8">
                {/* Search and Filter Bar */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
                    <div className="flex flex-col lg:flex-row gap-4">
                        {/* Search */}
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    placeholder="Search policies by title, description, or tags..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                />
                            </div>
                        </div>

                        {/* Category Filter */}
                        <div className="flex items-center gap-2">
                            <Filter className="w-5 h-5 text-gray-500" />
                            <select
                                value={selectedCategory || ''}
                                onChange={(e) => setSelectedCategory(e.target.value || null)}
                                className="px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            >
                                <option value="">All Categories</option>
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-gray-900">{policies.length}</div>
                            <div className="text-sm text-gray-600">Total Templates</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-gray-900">8</div>
                            <div className="text-sm text-gray-600">Categories</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-gray-900">15K+</div>
                            <div className="text-sm text-gray-600">Downloads</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-gray-900">4.8</div>
                            <div className="text-sm text-gray-600">Avg Rating</div>
                        </div>
                    </div>
                </div>

                {/* Category Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                    {categories.map((category) => {
                        const Icon = category.icon;
                        const isActive = selectedCategory === category.id;
                        const count = policies.filter(p => p.category === category.id).length;

                        return (
                            <motion.button
                                key={category.id}
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => setSelectedCategory(isActive ? null : category.id)}
                                className={`p-4 rounded-lg border-2 transition-all ${isActive
                                        ? `border-${category.color}-500 bg-${category.color}-50`
                                        : 'border-gray-200 bg-white hover:border-gray-300'
                                    }`}
                            >
                                <Icon className={`w-8 h-8 mb-2 mx-auto text-${category.color}-600`} />
                                <div className="text-sm font-medium text-gray-900">{category.name}</div>
                                <div className="text-xs text-gray-600 mt-1">{count} templates</div>
                            </motion.button>
                        );
                    })}
                </div>

                {/* Policy Grid */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredPolicies.map((policy) => {
                        const Icon = getCategoryIcon(policy.category);
                        const color = getCategoryColor(policy.category);

                        return (
                            <motion.div
                                key={policy.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                whileHover={{ y: -4 }}
                                className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all p-6 relative"
                            >
                                {policy.premium && !hasActiveSubscription && (
                                    <div className="absolute top-4 right-4">
                                        <Lock className="w-5 h-5 text-indigo-600" />
                                    </div>
                                )}

                                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg bg-${color}-100 mb-4`}>
                                    <Icon className={`w-6 h-6 text-${color}-600`} />
                                </div>

                                <h3 className="text-lg font-semibold text-gray-900 mb-2">{policy.title}</h3>
                                <p className="text-sm text-gray-600 mb-4">{policy.description}</p>

                                {/* Tags */}
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {policy.tags.slice(0, 3).map((tag) => (
                                        <span key={tag} className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-md">
                                            {tag}
                                        </span>
                                    ))}
                                    {policy.tags.length > 3 && (
                                        <span className="px-2 py-1 text-gray-500 text-xs">
                                            +{policy.tags.length - 3} more
                                        </span>
                                    )}
                                </div>

                                {/* Stats */}
                                <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                                    <div className="flex items-center">
                                        <Download className="w-4 h-4 mr-1" />
                                        <span>{policy.downloads}</span>
                                    </div>
                                    <div className="flex items-center">
                                        <Clock className="w-4 h-4 mr-1" />
                                        <span>Updated {new Date(policy.lastUpdated).toLocaleDateString()}</span>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex gap-2">
                                    <button className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center">
                                        <Eye className="w-4 h-4 mr-2" />
                                        Preview
                                    </button>
                                    <button
                                        onClick={() => handleDownload(policy.id, policy.premium)}
                                        className={`flex-1 px-4 py-2 rounded-lg transition-colors flex items-center justify-center ${policy.premium && !hasActiveSubscription
                                                ? 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                                                : 'bg-indigo-600 text-white hover:bg-indigo-700'
                                            }`}
                                    >
                                        <Download className="w-4 h-4 mr-2" />
                                        {policy.premium && !hasActiveSubscription ? 'Upgrade' : 'Download'}
                                    </button>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Empty State */}
                {filteredPolicies.length === 0 && (
                    <div className="text-center py-16">
                        <Shield className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No policies found</h3>
                        <p className="text-gray-600 mb-4">Try adjusting your search or filters</p>
                        <button
                            onClick={() => {
                                setSearchTerm('');
                                setSelectedCategory(null);
                            }}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                        >
                            Clear Filters
                        </button>
                    </div>
                )}

                {/* Bottom CTA */}
                {!hasActiveSubscription && !isLoading && (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mt-12 bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-lg p-8 text-center text-white"
                    >
                        <h3 className="text-2xl font-bold mb-4">Unlock All Premium Templates</h3>
                        <p className="text-lg mb-6 text-indigo-100">
                            Get instant access to all policy templates, monthly updates, and expert customization guides
                        </p>
                        <Link
                            href="/dashboard#upgrade"
                            className="inline-flex items-center px-6 py-3 bg-white text-indigo-600 rounded-lg hover:bg-gray-100 transition-colors font-semibold"
                        >
                            Upgrade to Premium
                            <ChevronRight className="ml-2 w-5 h-5" />
                        </Link>
                    </motion.div>
                )}
            </div>
        </div>
    );
}