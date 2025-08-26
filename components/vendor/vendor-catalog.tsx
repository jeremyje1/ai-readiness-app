/**
 * Vendor Catalog Component
 * Displays approved tools and usage guidelines
 * @version 1.0.0
 */

'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  SearchIcon,
  FilterIcon,
  ExternalLinkIcon,
  ShieldCheckIcon,
  AlertTriangleIcon,
  BookOpenIcon,
  TagIcon,
  CalendarIcon,
  UsersIcon
} from 'lucide-react'
import { Vendor } from '@/lib/types/vendor'

interface CatalogEntry {
  id: string
  vendorName: string
  description: string
  category: string
  url?: string
  tags: string[]
  usage: string
  restrictions: string[]
  riskLevel: string
  approvedAt: string
  lastReviewed: string
  usageCount: number
  popularityScore: number
}

interface VendorCatalogProps {
  currentUserId: string
  onRequestAccess?: (vendorId: string) => void
  className?: string
}

export function VendorCatalog({ 
  currentUserId, 
  onRequestAccess,
  className = '' 
}: VendorCatalogProps) {
  const [catalogEntries, setCatalogEntries] = useState<CatalogEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')
  const [riskFilter, setRiskFilter] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('popularity')

  // Available categories
  const categories = [
    'Communication & Collaboration',
    'Learning Management',
    'Content Creation',
    'Assessment & Analytics',
    'Administrative Tools',
    'AI & Machine Learning',
    'Other'
  ]

  // Fetch approved vendor catalog
  useEffect(() => {
    fetchCatalog()
  }, [categoryFilter, riskFilter, sortBy])

  const fetchCatalog = async () => {
    try {
      setLoading(true)
      
      // In a real implementation, this would fetch from an approved_tool_catalog API
      // For now, we'll fetch approved vendors and format them as catalog entries
      const params = new URLSearchParams({
        status: 'approved',
        ...(categoryFilter !== 'all' && { category: categoryFilter }),
        ...(riskFilter !== 'all' && { riskLevel: riskFilter })
      })

      const response = await fetch(`/api/vendors?${params}`, {
        headers: { 'x-user-id': currentUserId }
      })

      if (!response.ok) throw new Error('Failed to fetch catalog')

      const result = await response.json()
      if (!result.success) throw new Error(result.error)

      // Transform vendor data to catalog entries
      const vendors = result.data as Vendor[]
      const entries: CatalogEntry[] = vendors
        .filter(vendor => vendor.catalogEntry?.approved)
        .map(vendor => ({
          id: vendor.id,
          vendorName: vendor.assessment.basicInfo.name,
          description: vendor.catalogEntry?.description || vendor.assessment.basicInfo.description,
          category: vendor.catalogEntry?.category || vendor.assessment.basicInfo.category,
          url: vendor.assessment.basicInfo.url,
          tags: vendor.catalogEntry?.tags || [],
          usage: vendor.catalogEntry?.usage || 'General educational use',
          restrictions: vendor.catalogEntry?.restrictions || [],
          riskLevel: vendor.riskLevel,
          approvedAt: vendor.decision?.approvedAt || vendor.updatedAt,
          lastReviewed: vendor.reviewedAt || vendor.updatedAt,
          usageCount: Math.floor(Math.random() * 1000), // Mock data
          popularityScore: Math.floor(Math.random() * 100) // Mock data
        }))

      // Sort entries
      const sortedEntries = sortEntries(entries, sortBy)
      setCatalogEntries(sortedEntries)

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load catalog')
    } finally {
      setLoading(false)
    }
  }

  const sortEntries = (entries: CatalogEntry[], sortBy: string): CatalogEntry[] => {
    switch (sortBy) {
      case 'popularity':
        return [...entries].sort((a, b) => b.popularityScore - a.popularityScore)
      case 'name':
        return [...entries].sort((a, b) => a.vendorName.localeCompare(b.vendorName))
      case 'category':
        return [...entries].sort((a, b) => a.category.localeCompare(b.category))
      case 'recent':
        return [...entries].sort((a, b) => new Date(b.approvedAt).getTime() - new Date(a.approvedAt).getTime())
      case 'usage':
        return [...entries].sort((a, b) => b.usageCount - a.usageCount)
      default:
        return entries
    }
  }

  const filteredEntries = catalogEntries.filter(entry => {
    const matchesSearch = !searchQuery || 
      entry.vendorName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    
    return matchesSearch
  })

  const getRiskBadge = (level: string) => {
    const variants = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      critical: 'bg-red-100 text-red-800'
    }
    return <Badge className={variants[level as keyof typeof variants] || 'bg-gray-100 text-gray-800'}>{level}</Badge>
  }

  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="h-3 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`space-y-6 ${className}`}>
        <Card>
          <CardContent className="p-6 text-center">
            <AlertTriangleIcon className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-red-700 mb-2">Error Loading Catalog</h3>
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={fetchCatalog}>Try Again</Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Approved Tool Catalog</h1>
          <p className="text-gray-600 mt-1">Browse vetted educational technology tools</p>
        </div>
        <div className="text-sm text-gray-500">
          {filteredEntries.length} approved tool{filteredEntries.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search tools, descriptions, or tags..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={riskFilter} onValueChange={setRiskFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by risk" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Risk Levels</SelectItem>
                <SelectItem value="low">Low Risk</SelectItem>
                <SelectItem value="medium">Medium Risk</SelectItem>
                <SelectItem value="high">High Risk</SelectItem>
              </SelectContent>
            </Select>

            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="popularity">Most Popular</SelectItem>
                <SelectItem value="name">Name A-Z</SelectItem>
                <SelectItem value="category">Category</SelectItem>
                <SelectItem value="recent">Recently Added</SelectItem>
                <SelectItem value="usage">Most Used</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Catalog Grid */}
      {filteredEntries.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <BookOpenIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-700 mb-2">No Tools Found</h3>
            <p className="text-gray-600">
              {searchQuery ? 'No tools match your search criteria.' : 'No approved tools are available yet.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEntries.map((entry) => (
            <Card key={entry.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{entry.vendorName}</CardTitle>
                    <p className="text-sm text-gray-600 mt-1">{entry.category}</p>
                  </div>
                  <div className="flex flex-col gap-2">
                    {getRiskBadge(entry.riskLevel)}
                    <Badge variant="outline" className="bg-green-50">
                      <ShieldCheckIcon className="h-3 w-3 mr-1" />
                      Approved
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <p className="text-gray-700 mb-4 line-clamp-3">{entry.description}</p>
                
                {/* Tags */}
                {entry.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-4">
                    {entry.tags.slice(0, 3).map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        <TagIcon className="h-3 w-3 mr-1" />
                        {tag}
                      </Badge>
                    ))}
                    {entry.tags.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{entry.tags.length - 3} more
                      </Badge>
                    )}
                  </div>
                )}

                {/* Usage Guidelines */}
                <div className="mb-4 p-3 bg-blue-50 rounded-lg">
                  <h4 className="text-sm font-medium text-blue-800 mb-1">Approved Usage</h4>
                  <p className="text-sm text-blue-700">{entry.usage}</p>
                </div>

                {/* Restrictions */}
                {entry.restrictions.length > 0 && (
                  <div className="mb-4 p-3 bg-orange-50 rounded-lg">
                    <h4 className="text-sm font-medium text-orange-800 mb-1">Restrictions</h4>
                    <ul className="text-sm text-orange-700">
                      {entry.restrictions.slice(0, 2).map((restriction, index) => (
                        <li key={index} className="list-disc list-inside">{restriction}</li>
                      ))}
                      {entry.restrictions.length > 2 && (
                        <li className="text-xs">+{entry.restrictions.length - 2} more...</li>
                      )}
                    </ul>
                  </div>
                )}

                {/* Stats */}
                <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                  <div className="flex items-center gap-1">
                    <UsersIcon className="h-3 w-3" />
                    {entry.usageCount} users
                  </div>
                  <div className="flex items-center gap-1">
                    <CalendarIcon className="h-3 w-3" />
                    Added {new Date(entry.approvedAt).toLocaleDateString()}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  {entry.url && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => window.open(entry.url, '_blank')}
                    >
                      <ExternalLinkIcon className="h-4 w-4 mr-1" />
                      Visit Site
                    </Button>
                  )}
                  
                  {onRequestAccess && (
                    <Button
                      size="sm"
                      className="flex-1"
                      onClick={() => onRequestAccess(entry.id)}
                    >
                      Request Access
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
