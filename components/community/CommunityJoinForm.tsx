/**
 * Community Join Form
 * Audience-aware Slack community invitation form
 */

'use client';

import React, { useState } from 'react';
import { useAudience } from '@/lib/audience/AudienceContext';
import { useMetricsTracker } from '@/lib/metrics/events';
import { Mail, Users, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';

export interface CommunityJoinFormProps {
  userId?: string;
  className?: string;
  variant?: 'default' | 'compact' | 'embedded';
}

export function CommunityJoinForm({ userId, className = '', variant = 'default' }: CommunityJoinFormProps) {
  const { audience, config } = useAudience();
  const { trackCommunityJoin } = useMetricsTracker();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    organization: '',
    role: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.email) {
      toast({
        title: "Email Required",
        description: "Please enter your email address to join the community.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/community/slack-invite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          audience,
          userId
        })
      });

      const result = await response.json();

      if (result.success) {
        // Track successful join
        trackCommunityJoin({
          platform: 'slack',
          success: true,
          userId,
          audience
        });

        setIsSubmitted(true);
        
        toast({
          title: "Invitation Sent!",
          description: result.message,
          duration: 6000
        });

      } else {
        throw new Error(result.error || 'Failed to send invitation');
      }

    } catch (error) {
      console.error('Community join error:', error);
      
      // Track failed attempt
      trackCommunityJoin({
        platform: 'slack',
        success: false,
        userId,
        audience
      });

      toast({
        title: "Invitation Failed",
        description: error instanceof Error ? error.message : "Please try again later.",
        variant: "destructive"
      });

    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (isSubmitted && variant !== 'embedded') {
    return (
      <Card className={`w-full max-w-md ${className}`}>
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <CheckCircle className="w-12 h-12 text-green-600 mx-auto" />
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                Welcome to the Community!
              </h3>
              <p className="text-gray-600 text-sm mt-1">
                Check your email for the Slack invitation link.
              </p>
            </div>
            <div className="text-xs text-gray-500">
              Don't see the email? Check your spam folder or contact support.
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (variant === 'compact') {
    return (
      <div className={`space-y-3 ${className}`}>
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-600" />
          <span className="font-medium text-gray-900">
            Join the {audience === 'k12' ? 'K-12' : 'Higher Ed'} AI Community
          </span>
        </div>
        
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Input
            type="email"
            placeholder="Your email address"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            disabled={isSubmitting}
            className="flex-1"
          />
          <Button type="submit" disabled={isSubmitting} size="sm">
            {isSubmitting ? 'Sending...' : 'Join'}
            {!isSubmitting && <ArrowRight className="w-4 h-4 ml-1" />}
          </Button>
        </form>
        
        <p className="text-xs text-gray-600">
          {config.copy.communityCopy}
        </p>
      </div>
    );
  }

  return (
    <Card className={`w-full max-w-md ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Users className="w-5 h-5 text-blue-600" />
          Join Our Community
        </CardTitle>
        <CardDescription>
          {config.copy.communityCopy}
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="firstName" className="text-xs font-medium text-gray-700">
                First Name
              </Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => handleInputChange('firstName', e.target.value)}
                disabled={isSubmitting}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="lastName" className="text-xs font-medium text-gray-700">
                Last Name
              </Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => handleInputChange('lastName', e.target.value)}
                disabled={isSubmitting}
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="email" className="text-xs font-medium text-gray-700">
              Email Address *
            </Label>
            <Input
              id="email"
              type="email"
              required
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              disabled={isSubmitting}
              className="mt-1"
            />
          </div>

          <div>
            <Label htmlFor="organization" className="text-xs font-medium text-gray-700">
              {config.nouns.org} Name
            </Label>
            <Input
              id="organization"
              value={formData.organization}
              onChange={(e) => handleInputChange('organization', e.target.value)}
              disabled={isSubmitting}
              className="mt-1"
              placeholder={`Your ${config.nouns.org.toLowerCase()} name`}
            />
          </div>

          <div>
            <Label htmlFor="role" className="text-xs font-medium text-gray-700">
              Role
            </Label>
            <Select 
              value={formData.role} 
              onValueChange={(value) => handleInputChange('role', value)}
              disabled={isSubmitting}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select your role" />
              </SelectTrigger>
              <SelectContent>
                {config.roles.map(role => (
                  <SelectItem key={role} value={role}>
                    {role}
                  </SelectItem>
                ))}
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                Sending Invitation...
              </>
            ) : (
              <>
                <Mail className="w-4 h-4 mr-2" />
                Send Me an Invitation
              </>
            )}
          </Button>
        </form>

        <div className="mt-4 text-xs text-gray-500 space-y-2">
          <p>
            By joining, you'll connect with {audience === 'k12' ? 'superintendents, principals, and education leaders' : 'provosts, deans, and academic leaders'} 
            who are navigating AI implementation.
          </p>
          <div className="flex items-start gap-2">
            <AlertCircle className="w-3 h-3 text-gray-400 mt-0.5 flex-shrink-0" />
            <p>
              We respect your privacy. Your information will only be used to send the Slack invitation.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Community Stats Component
 */
export function CommunityStats() {
  const { audience } = useAudience();

  const stats = audience === 'k12' ? {
    members: '1,200+',
    organizations: '300+',
    type: 'districts',
    roles: ['Superintendents', 'Principals', 'Technology Directors', 'Curriculum Leaders']
  } : {
    members: '800+',
    organizations: '150+', 
    type: 'institutions',
    roles: ['Provosts', 'Deans', 'Faculty Leaders', 'Academic Affairs']
  };

  return (
    <div className="bg-gray-50 rounded-lg p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Join {stats.members} {audience === 'k12' ? 'K-12' : 'Higher Ed'} Leaders
      </h3>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <div className="text-2xl font-bold text-blue-600">{stats.members}</div>
          <div className="text-sm text-gray-600">Active Members</div>
        </div>
        <div>
          <div className="text-2xl font-bold text-green-600">{stats.organizations}</div>
          <div className="text-sm text-gray-600">{audience === 'k12' ? 'Districts' : 'Institutions'}</div>
        </div>
      </div>

      <div>
        <h4 className="text-sm font-medium text-gray-900 mb-2">Community includes:</h4>
        <div className="flex flex-wrap gap-1">
          {stats.roles.map((role, index) => (
            <span key={index} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
              {role}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}