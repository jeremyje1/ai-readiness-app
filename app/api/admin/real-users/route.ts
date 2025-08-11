import { NextRequest, NextResponse } from 'next/server';
import { getAllHigherEdInstitutions, getAllK12Schools } from '@/lib/implementation-bootstrap';

interface AdminUser {
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

export async function GET(request: NextRequest) {
  try {
    // Simple admin authentication check
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.includes('admin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get all real user data from the in-memory stores
    const higherEdInstitutions = getAllHigherEdInstitutions();
    const k12Schools = getAllK12Schools();
    
    // Convert to admin dashboard format
    const realUsers: AdminUser[] = [];
    
    // Add Higher Ed institutions
    higherEdInstitutions.forEach(institution => {
      realUsers.push({
        id: institution.id,
        email: institution.contactEmail || 'unknown@institution.edu',
        institutionName: institution.name,
        type: 'Higher Education',
        status: 'active',
        implementationType: 'highered',
        createdAt: institution.createdAt,
        subscription: {
          status: 'trialing',
          plan: 'monthly'
        }
      });
    });

    // Add K12 schools
    k12Schools.forEach(school => {
      realUsers.push({
        id: school.id,
        email: school.contactEmail || 'unknown@school.edu',
        institutionName: school.name,
        type: 'K12 School',
        status: 'active',
        implementationType: 'k12',
        createdAt: school.createdAt,
        subscription: {
          status: 'trialing',
          plan: 'monthly'
        }
      });
    });

    // Calculate real stats
    const totalUsers = realUsers.length;
    const activeImplementations = realUsers.filter(u => u.status === 'active').length;
    
    const higherEdCount = realUsers.filter(u => u.type === 'Higher Education').length;
    const k12Count = realUsers.filter(u => u.type === 'K12 School').length;

    return NextResponse.json({
      users: realUsers,
      stats: {
        totalUsers,
        activeImplementations,
        higherEdInstitutions: higherEdCount,
        k12Schools: k12Count,
        totalRevenue: totalUsers * 99, // Assuming $99/month
        trialUsers: realUsers.filter(u => u.subscription.status === 'trialing').length
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Admin dashboard error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
