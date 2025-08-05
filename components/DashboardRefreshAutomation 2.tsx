/**
 * Dashboard Refresh Automation System
 * Monthly Subscription ($2,995/mo) - "CSV dashboard refreshes"
 * 
 * @version 1.0.0
 * @author NorthPath Strategies
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  RefreshCw, 
  Clock, 
  FileSpreadsheet, 
  Download, 
  Mail, 
  Calendar,
  CheckCircle2,
  AlertCircle,
  Play,
  Pause,
  Settings
} from 'lucide-react';

interface RefreshSchedule {
  id: string;
  name: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  dayOfWeek?: number; // 0-6 for weekly
  dayOfMonth?: number; // 1-31 for monthly
  time: string; // HH:MM format
  timezone: string;
  enabled: boolean;
  lastRun?: string;
  nextRun?: string;
  status: 'active' | 'paused' | 'error';
}

interface DashboardRefreshProps {
  assessmentId: string;
  userEmail: string;
  onRefreshScheduled: (schedule: RefreshSchedule) => void;
  className?: string;
}

const DEFAULT_SCHEDULES = [
  {
    id: 'weekly-monday',
    name: 'Weekly Monday Report',
    frequency: 'weekly' as const,
    dayOfWeek: 1, // Monday
    time: '09:00',
    timezone: 'America/New_York',
    enabled: true,
    lastRun: '2025-07-14T13:00:00Z',
    nextRun: '2025-07-21T13:00:00Z',
    status: 'active' as const
  },
  {
    id: 'monthly-first',
    name: 'Monthly Executive Summary',
    frequency: 'monthly' as const,
    dayOfMonth: 1,
    time: '08:00',
    timezone: 'America/New_York',
    enabled: false,
    nextRun: '2025-08-01T12:00:00Z',
    status: 'paused' as const
  }
];

export function DashboardRefreshAutomation({ 
  assessmentId, 
  userEmail, 
  onRefreshScheduled,
  className 
}: DashboardRefreshProps) {
  const [schedules, setSchedules] = useState<RefreshSchedule[]>(DEFAULT_SCHEDULES);
  const [isCreating, setIsCreating] = useState(false);
  const [newSchedule, setNewSchedule] = useState<{
    name: string;
    frequency: 'daily' | 'weekly' | 'monthly';
    dayOfWeek: number;
    dayOfMonth: number;
    time: string;
    timezone: string;
  }>({
    name: '',
    frequency: 'weekly',
    dayOfWeek: 1,
    dayOfMonth: 1,
    time: '09:00',
    timezone: 'America/New_York'
  });

  const formatNextRun = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  };

  const getFrequencyDescription = (schedule: RefreshSchedule) => {
    switch (schedule.frequency) {
      case 'daily':
        return `Daily at ${schedule.time}`;
      case 'weekly':
        const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        return `Weekly on ${days[schedule.dayOfWeek!]} at ${schedule.time}`;
      case 'monthly':
        return `Monthly on the ${schedule.dayOfMonth}${getOrdinalSuffix(schedule.dayOfMonth!)} at ${schedule.time}`;
      default:
        return 'Custom schedule';
    }
  };

  const getOrdinalSuffix = (day: number) => {
    if (day >= 11 && day <= 13) return 'th';
    switch (day % 10) {
      case 1: return 'st';
      case 2: return 'nd';
      case 3: return 'rd';
      default: return 'th';
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      'active': 'bg-green-100 text-green-800 border-green-200',
      'paused': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'error': 'bg-red-100 text-red-800 border-red-200'
    };
    
    const icons = {
      'active': CheckCircle2,
      'paused': Pause,
      'error': AlertCircle
    };

    const Icon = icons[status as keyof typeof icons];
    
    return (
      <Badge className={`${styles[status as keyof typeof styles]} border flex items-center space-x-1`}>
        <Icon className="h-3 w-3" />
        <span>{status.charAt(0).toUpperCase() + status.slice(1)}</span>
      </Badge>
    );
  };

  const handleToggleSchedule = (scheduleId: string) => {
    setSchedules(prev => prev.map(schedule => 
      schedule.id === scheduleId 
        ? { 
            ...schedule, 
            enabled: !schedule.enabled,
            status: !schedule.enabled ? 'active' : 'paused'
          }
        : schedule
    ));
  };

  const handleCreateSchedule = () => {
    const schedule: RefreshSchedule = {
      id: `schedule-${Date.now()}`,
      name: newSchedule.name || `${newSchedule.frequency} Report`,
      frequency: newSchedule.frequency,
      dayOfWeek: newSchedule.frequency === 'weekly' ? newSchedule.dayOfWeek : undefined,
      dayOfMonth: newSchedule.frequency === 'monthly' ? newSchedule.dayOfMonth : undefined,
      time: newSchedule.time,
      timezone: newSchedule.timezone,
      enabled: true,
      status: 'active',
      nextRun: calculateNextRun(newSchedule)
    };

    setSchedules(prev => [...prev, schedule]);
    onRefreshScheduled(schedule);
    setIsCreating(false);
    setNewSchedule({
      name: '',
      frequency: 'weekly',
      dayOfWeek: 1,
      dayOfMonth: 1,
      time: '09:00',
      timezone: 'America/New_York'
    });
  };

  const calculateNextRun = (schedule: any): string => {
    // Simplified calculation - in production this would be more robust
    const now = new Date();
    const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    return nextWeek.toISOString();
  };

  const handleManualRefresh = async () => {
    // Simulate manual refresh
    console.log('Triggering manual dashboard refresh...');
    // In production, this would call the actual refresh API
  };

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl flex items-center space-x-2">
                <RefreshCw className="h-6 w-6 text-blue-600" />
                <span>Dashboard Refresh Automation</span>
              </CardTitle>
              <CardDescription className="text-base mt-2">
                Automatically generate and deliver updated CSV dashboards on your schedule. 
                Perfect for ongoing monitoring and stakeholder reporting.
              </CardDescription>
            </div>
            <Button onClick={handleManualRefresh} variant="outline" className="flex items-center space-x-2">
              <RefreshCw className="h-4 w-4" />
              <span>Refresh Now</span>
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Current Schedules */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Active Schedules</h3>
              <Button 
                onClick={() => setIsCreating(true)} 
                variant="outline" 
                size="sm"
                className="flex items-center space-x-2"
              >
                <Calendar className="h-4 w-4" />
                <span>New Schedule</span>
              </Button>
            </div>

            {schedules.map((schedule) => (
              <Card key={schedule.id} className="border-l-4 border-l-blue-500">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h4 className="font-medium">{schedule.name}</h4>
                        {getStatusBadge(schedule.status)}
                      </div>
                      <div className="mt-2 space-y-1 text-sm text-gray-600">
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4" />
                          <span>{getFrequencyDescription(schedule)}</span>
                        </div>
                        {schedule.nextRun && (
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4" />
                            <span>Next run: {formatNextRun(schedule.nextRun)}</span>
                          </div>
                        )}
                        {schedule.lastRun && (
                          <div className="flex items-center space-x-2">
                            <CheckCircle2 className="h-4 w-4 text-green-500" />
                            <span>Last run: {formatNextRun(schedule.lastRun)}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm">Enabled</span>
                        <input
                          type="checkbox"
                          checked={schedule.enabled}
                          onChange={() => handleToggleSchedule(schedule.id)}
                          className="rounded"
                        />
                      </div>
                      <Button variant="ghost" size="sm">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Create New Schedule */}
          {isCreating && (
            <Card className="border-2 border-dashed border-blue-300 bg-blue-50">
              <CardHeader>
                <CardTitle className="text-lg">Create New Schedule</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Schedule Name</label>
                    <input
                      type="text"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="e.g., Weekly Executive Report"
                      value={newSchedule.name}
                      onChange={(e) => setNewSchedule(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2">Frequency</label>
                    <Select 
                      value={newSchedule.frequency} 
                      onValueChange={(value) => setNewSchedule(prev => ({ 
                        ...prev, 
                        frequency: value as 'daily' | 'weekly' | 'monthly' 
                      }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {newSchedule.frequency === 'weekly' && (
                    <div>
                      <label className="block text-sm font-medium mb-2">Day of Week</label>
                      <Select 
                        value={newSchedule.dayOfWeek.toString()} 
                        onValueChange={(value) => setNewSchedule(prev => ({ 
                          ...prev, 
                          dayOfWeek: parseInt(value) 
                        }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">Sunday</SelectItem>
                          <SelectItem value="1">Monday</SelectItem>
                          <SelectItem value="2">Tuesday</SelectItem>
                          <SelectItem value="3">Wednesday</SelectItem>
                          <SelectItem value="4">Thursday</SelectItem>
                          <SelectItem value="5">Friday</SelectItem>
                          <SelectItem value="6">Saturday</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {newSchedule.frequency === 'monthly' && (
                    <div>
                      <label className="block text-sm font-medium mb-2">Day of Month</label>
                      <Select 
                        value={newSchedule.dayOfMonth.toString()} 
                        onValueChange={(value) => setNewSchedule(prev => ({ 
                          ...prev, 
                          dayOfMonth: parseInt(value) 
                        }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                            <SelectItem key={day} value={day.toString()}>{day}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium mb-2">Time</label>
                    <input
                      type="time"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      value={newSchedule.time}
                      onChange={(e) => setNewSchedule(prev => ({ ...prev, time: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end space-x-3">
                  <Button variant="outline" onClick={() => setIsCreating(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateSchedule}>
                    Create Schedule
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Refresh Options */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Refresh Options</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-3">
                  <h4 className="font-medium flex items-center space-x-2">
                    <FileSpreadsheet className="h-4 w-4" />
                    <span>CSV Exports</span>
                  </h4>
                  <div className="space-y-2 text-sm">
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" defaultChecked className="rounded" />
                      <span>Organizational metrics</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" defaultChecked className="rounded" />
                      <span>Financial projections</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" defaultChecked className="rounded" />
                      <span>Recommendation status</span>
                    </label>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium flex items-center space-x-2">
                    <Mail className="h-4 w-4" />
                    <span>Delivery Method</span>
                  </h4>
                  <div className="space-y-2 text-sm">
                    <label className="flex items-center space-x-2">
                      <input type="radio" name="delivery" defaultChecked className="rounded" />
                      <span>Email with attachments</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="radio" name="delivery" className="rounded" />
                      <span>Dashboard notification</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="radio" name="delivery" className="rounded" />
                      <span>Secure download link</span>
                    </label>
                  </div>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium flex items-center space-x-2">
                    <Download className="h-4 w-4" />
                    <span>Format Options</span>
                  </h4>
                  <div className="space-y-2 text-sm">
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" defaultChecked className="rounded" />
                      <span>Standard CSV</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" className="rounded" />
                      <span>Excel with charts</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" className="rounded" />
                      <span>Executive summary PDF</span>
                    </label>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Usage Statistics */}
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center space-x-4">
                <div className="bg-blue-600 p-2 rounded-full">
                  <RefreshCw className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-blue-900">Automation Status</h4>
                  <p className="text-sm text-blue-700">
                    {schedules.filter(s => s.enabled).length} active schedules • 
                    Last refresh: July 14, 2025 • 
                    Next scheduled: July 21, 2025
                  </p>
                </div>
                <Badge className="bg-green-100 text-green-800">
                  All Systems Operational
                </Badge>
              </div>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}

export default DashboardRefreshAutomation;
