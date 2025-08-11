'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/card';
import { Button } from '@/components/button';
import { Badge } from '@/components/badge';
import { Users, Building, GraduationCap, School, DollarSign, TrendingUp } from 'lucide-react';

interface RealUser {
  id: string;
  email: string;
  institutionName: string;
  type: string;
  status: string;
  implementationType: string;
  createdAt: string;
  subscription: {
    status: string;
    plan: string;
  };
}

interface AdminStats {
  totalUsers: number;
  activeImplementations: number;
  higherEdInstitutions: number;
  k12Schools: number;
  totalRevenue: number;
  trialUsers: number;
}

export default function RealUserDashboard() {
  const [users, setUsers] = useState<RealUser[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  const fetchRealData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/real-users', {
        headers: {
          'Authorization': 'Bearer admin'
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
        setStats(data.stats || null);
        setLastUpdated(new Date().toLocaleString());
      } else {
        console.error('Failed to fetch real user data');
      }
    } catch (error) {
      console.error('Error fetching real user data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRealData();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'trialing':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-lg text-gray-600">Loading real user data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6 flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Real User Dashboard</h1>
              <p className="mt-1 text-sm text-gray-600">
                Live data from actual platform users • Last updated: {lastUpdated}
              </p>
            </div>
            <Button onClick={fetchRealData} variant="outline">
              Refresh Data
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalUsers}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Higher Ed</CardTitle>
                <GraduationCap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.higherEdInstitutions}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">K12 Schools</CardTitle>
                <School className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.k12Schools}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Active</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.activeImplementations}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Trial Users</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.trialUsers}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${stats.totalRevenue}</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Users List */}
        <Card>
          <CardHeader>
            <CardTitle>Real Platform Users</CardTitle>
            <CardDescription>
              {users.length === 0 
                ? "No users found. Users will appear here after successful signups through your platform."
                : `${users.length} users have signed up for AI implementation services`
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {users.length === 0 ? (
              <div className="text-center py-12">
                <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Users Yet</h3>
                <p className="text-gray-600 mb-4">
                  Users will appear here after they complete the signup flow on your platform.
                </p>
                <p className="text-sm text-gray-500">
                  Test the flow at: <br />
                  <code className="bg-gray-100 px-2 py-1 rounded">
                    https://aireadiness.northpathstrategies.org/higheredaiblueprint.html
                  </code>
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {users.map((user) => (
                  <div key={user.id} className="border rounded-lg p-4 hover:bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-medium text-gray-900">{user.institutionName}</h3>
                          <Badge className={getStatusColor(user.subscription.status)}>
                            {user.subscription.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">{user.email}</p>
                        <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                          <span>{user.type}</span>
                          <span>•</span>
                          <span>Signed up: {formatDate(user.createdAt)}</span>
                          <span>•</span>
                          <span>{user.subscription.plan} plan</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
