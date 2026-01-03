'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Search, 
  Filter, 
  RefreshCw,
  MessageSquare,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { SupportStatusBadge } from '@/components/support/SupportStatusBadge';
import { SupportCategoryBadge } from '@/components/support/SupportCategoryBadge';
import { SupportPriorityBadge } from '@/components/support/SupportPriorityBadge';
import { useSupportRequests, useSupportStats } from '@/hooks/useSupport';
import { SupportStatus, SupportCategory } from '@/types';
import { formatDate } from '@/lib/utils';

export default function SupportPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<SupportStatus | ''>('');
  const [categoryFilter, setCategoryFilter] = useState<SupportCategory | ''>('');
  const [page, setPage] = useState(1);
  
  const { data: supportData, isLoading, refetch } = useSupportRequests({
    search: search || undefined,
    status: statusFilter || undefined,
    category: categoryFilter || undefined,
    page,
    limit: 20,
  });

  const { data: statsData } = useSupportStats();

  const handleRowClick = (id: string) => {
    router.push(`/issues/${id}`);
  };

  return (
    <div className="flex flex-col h-full pl-16 lg:pl-0">
      {/* Header */}
      <div className="border-b border-white/10 bg-black px-4 sm:px-6 lg:px-8 py-3 sm:py-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-lg sm:text-2xl font-bold">Support Requests</h1>
            <p className="text-xs sm:text-sm text-white/60 mt-0.5 sm:mt-1 hidden sm:block">
              Manage and resolve user support tickets
            </p>
          </div>
          <Button
            onClick={() => refetch()}
            variant="outline"
            size="sm"
            className="gap-2 h-8 sm:h-9"
            disabled={isLoading}
          >
            <RefreshCw className={`h-3 w-3 sm:h-4 sm:w-4 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
        </div>

        {/* Stats */}
        {statsData?.data && (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-4 sm:mt-6">
            <Card className="p-3 sm:p-4 border-white/10 bg-white/5 rounded-lg">
              <div className="text-xl sm:text-2xl font-bold">{statsData.data.total}</div>
              <div className="text-xs text-white/60 mt-1">Total</div>
            </Card>
            <Card className="p-3 sm:p-4 border-white/10 bg-white/5 rounded-lg">
              <div className="text-xl sm:text-2xl font-bold text-yellow-400">
                {statsData.data.byStatus.OPEN}
              </div>
              <div className="text-xs text-white/60 mt-1">Open</div>
            </Card>
            <Card className="p-3 sm:p-4 border-white/10 bg-white/5 rounded-lg">
              <div className="text-xl sm:text-2xl font-bold text-blue-400">
                {statsData.data.byStatus.IN_PROGRESS}
              </div>
              <div className="text-xs text-white/60 mt-1">In Progress</div>
            </Card>
            <Card className="p-3 sm:p-4 border-white/10 bg-white/5 rounded-lg">
              <div className="text-xl sm:text-2xl font-bold text-green-400">
                {statsData.data.byStatus.RESOLVED}
              </div>
              <div className="text-xs text-white/60 mt-1">Resolved</div>
            </Card>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="flex-shrink-0 border-b border-white/10 bg-black px-4 sm:px-6 lg:px-8 py-2.5 sm:py-4">
        <div className="flex gap-2 sm:gap-4 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 -translate-y-1/2 text-white/40" />
            <Input
              placeholder="Search support requests..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 sm:pl-10 bg-white/5 border-white/10 h-9 sm:h-10 text-sm"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as SupportStatus | '')}
            className="rounded-lg border border-white/10 bg-white/5 px-2 sm:px-4 py-2 text-xs sm:text-sm focus:border-white/20 focus:outline-none focus:ring-2 focus:ring-white/20 text-white h-9 sm:h-10 min-w-[100px]"
          >
            <option value="" className="bg-black">All Status</option>
            {Object.values(SupportStatus).map((status) => (
              <option key={status} value={status} className="bg-black">
                {status.replace('_', ' ')}
              </option>
            ))}
          </select>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value as SupportCategory | '')}
            className="rounded-lg border border-white/10 bg-white/5 px-2 sm:px-4 py-2 text-xs sm:text-sm focus:border-white/20 focus:outline-none focus:ring-2 focus:ring-white/20 text-white h-9 sm:h-10 min-w-[100px]"
          >
            <option value="" className="bg-black">All Categories</option>
            {Object.values(SupportCategory).map((category) => (
              <option key={category} value={category} className="bg-black">
                {category.replace('_', ' ')}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Table - Desktop */}
      <div className="flex-1 overflow-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <Card className="border-white/10 bg-white/5 rounded-lg hidden md:block">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-white/60 animate-spin" />
            </div>
          ) : supportData?.data && supportData.data.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/10 hover:bg-white/5">
                    <TableHead className="text-xs sm:text-sm">Subject</TableHead>
                    <TableHead className="text-xs sm:text-sm">Category</TableHead>
                    <TableHead className="text-xs sm:text-sm">Website</TableHead>
                    <TableHead className="text-xs sm:text-sm">Status</TableHead>
                    <TableHead className="text-xs sm:text-sm">Assigned</TableHead>
                    <TableHead className="text-xs sm:text-sm">Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {supportData.data.map((request) => (
                    <TableRow
                      key={request._id}
                      onClick={() => handleRowClick(request._id)}
                      className="cursor-pointer border-white/10 hover:bg-white/5"
                    >
                      <TableCell className="font-medium text-sm">
                        <div className="flex items-center gap-2">
                          <MessageSquare className="w-4 h-4 text-white/40 flex-shrink-0" />
                          <div className="min-w-0">
                            <div className="truncate">{request.subject}</div>
                            {request.priority && (
                              <div className={`text-xs mt-0.5 ${
                                request.priority === 'HIGH' ? 'text-red-400' :
                                request.priority === 'MEDIUM' ? 'text-yellow-400' :
                                'text-white/40'
                              }`}>
                                {request.priority}
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <SupportCategoryBadge category={request.category} />
                      </TableCell>
                      <TableCell>
                        <div className="text-xs sm:text-sm text-white/60 truncate">
                          {request.website?.name || 'N/A'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <SupportStatusBadge status={request.status} />
                      </TableCell>
                      <TableCell className="text-white/60 text-xs sm:text-sm">
                        {request.assignedAdmin || (
                          <span className="text-white/40">Unassigned</span>
                        )}
                      </TableCell>
                      <TableCell className="text-white/60 text-xs sm:text-sm">
                        {formatDate(request.createdAt)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <MessageSquare className="h-12 w-12 text-white/20 mb-4" />
              <div className="text-white/60">No support requests found</div>
              <div className="text-sm text-white/40 mt-1">
                Try adjusting your filters
              </div>
            </div>
          )}
        </Card>

        {/* Mobile Card View */}
        <div className="md:hidden space-y-3">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-white/60 animate-spin" />
            </div>
          ) : supportData?.data && supportData.data.length > 0 ? (
            supportData.data.map((request) => (
              <Card
                key={request._id}
                onClick={() => handleRowClick(request._id)}
                className="border-white/10 bg-white/5 rounded-lg p-3 cursor-pointer hover:bg-white/10 transition-colors"
              >
                <div className="space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm truncate">{request.subject}</h3>
                      <p className="text-xs text-white/60 mt-0.5">
                        {request.website?.name || 'N/A'}
                      </p>
                    </div>
                    <SupportStatusBadge status={request.status} />
                  </div>

                  <div className="flex items-center gap-2">
                    <SupportCategoryBadge category={request.category} />
                    {request.priority && (
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        request.priority === 'HIGH' ? 'bg-red-500/20 text-red-400' :
                        request.priority === 'MEDIUM' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-white/10 text-white/60'
                      }`}>
                        {request.priority}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs text-white/60">
                    <span>{formatDate(request.createdAt)}</span>
                    <span>{request.assignedAdmin || 'Unassigned'}</span>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <MessageSquare className="h-12 w-12 text-white/20 mb-4" />
              <div className="text-white/60 text-sm">No support requests found</div>
              <div className="text-xs text-white/40 mt-1">
                Try adjusting your filters
              </div>
            </div>
          )}
        </div>

        {/* Pagination */}
        {supportData && supportData.pages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0 mt-4 sm:mt-6">
            <div className="text-xs sm:text-sm text-white/60">
              Page {supportData.page} of {supportData.pages}
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className="flex-1 sm:flex-none"
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(page + 1)}
                disabled={page === supportData.pages}
                className="flex-1 sm:flex-none"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}