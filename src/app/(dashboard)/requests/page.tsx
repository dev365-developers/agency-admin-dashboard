'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Filter, RefreshCw } from 'lucide-react';
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
import { RequestStatusBadge } from '@/components/requests/RequestStatusBadge';
import { useRequests, useRequestStats } from '@/hooks/useRequests';
import { RequestStatus, ProjectType } from '@/types';
import { formatDate } from '@/lib/utils';

export default function RequestsPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<RequestStatus | ''>('');
  const [page, setPage] = useState(1);
  
  const { data: requestsData, isLoading, refetch } = useRequests({
    search: search || undefined,
    status: statusFilter || undefined,
    page,
    limit: 20,
  });

  const { data: statsData } = useRequestStats();

  const handleRowClick = (id: string) => {
    router.push(`/requests/${id}`);
  };

  return (
    <div className="flex flex-col h-full pl-16 lg:pl-0">
      {/* Header */}
      <div className="border-b border-white/10 bg-black px-4 sm:px-6 lg:px-8 py-3 sm:py-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-lg sm:text-2xl font-bold">Requests</h1>
            <p className="text-xs sm:text-sm text-white/60 mt-0.5 sm:mt-1 hidden sm:block">
              Manage and review website development requests
            </p>
          </div>
          <Button
            onClick={() => refetch()}
            variant="outline"
            size="sm"
            className="gap-2 h-8 sm:h-9"
          >
            <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
        </div>

        {/* Stats - Hidden on mobile */}
        {statsData?.data && (
          <div className="hidden sm:grid sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mt-4 sm:mt-6">
            <Card className="p-3 sm:p-4 border-white/10 bg-white/5 rounded-lg">
              <div className="text-xl sm:text-2xl font-bold">{statsData.data.total}</div>
              <div className="text-xs text-white/60 mt-1">Total</div>
            </Card>
            <Card className="p-3 sm:p-4 border-white/10 bg-white/5 rounded-lg">
              <div className="text-xl sm:text-2xl font-bold">{statsData.data.byStatus.PENDING}</div>
              <div className="text-xs text-white/60 mt-1">Pending</div>
            </Card>
            <Card className="p-3 sm:p-4 border-white/10 bg-white/5 rounded-lg">
              <div className="text-xl sm:text-2xl font-bold">{statsData.data.byStatus.IN_REVIEW}</div>
              <div className="text-xs text-white/60 mt-1">In Review</div>
            </Card>
            <Card className="p-3 sm:p-4 border-white/10 bg-white/5 rounded-lg">
              <div className="text-xl sm:text-2xl font-bold">{statsData.data.byStatus.APPROVED}</div>
              <div className="text-xs text-white/60 mt-1">Approved</div>
            </Card>
            <Card className="p-3 sm:p-4 border-white/10 bg-white/5 rounded-lg">
              <div className="text-xl sm:text-2xl font-bold">{statsData.data.byStatus.REJECTED}</div>
              <div className="text-xs text-white/60 mt-1">Rejected</div>
            </Card>
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="flex-shrink-0 border-b border-white/10 bg-black px-4 sm:px-6 lg:px-8 py-2.5 sm:py-4">
        <div className="flex gap-2 sm:gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 -translate-y-1/2 text-white/40" />
            <Input
              placeholder="Search..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 sm:pl-10 bg-white/5 border-white/10 h-9 sm:h-10 text-sm"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as RequestStatus | '')}
            className="rounded-lg border border-white/10 bg-white/5 px-2 sm:px-4 py-2 text-xs sm:text-sm focus:border-white/20 focus:outline-none focus:ring-2 focus:ring-white/20 text-white h-9 sm:h-10 min-w-[100px] sm:min-w-[140px]"
          >
            <option value="" className="bg-black">All</option>
            {Object.values(RequestStatus).map((status) => (
              <option key={status} value={status} className="bg-black">
                {status.replace('_', ' ')}
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
              <div className="text-white/60">Loading requests...</div>
            </div>
          ) : requestsData?.data && requestsData.data.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-white/10 hover:bg-white/5">
                    <TableHead className="text-xs sm:text-sm">Project Name</TableHead>
                    <TableHead className="text-xs sm:text-sm">Type</TableHead>
                    <TableHead className="text-xs sm:text-sm">Contact</TableHead>
                    <TableHead className="text-xs sm:text-sm">Status</TableHead>
                    <TableHead className="text-xs sm:text-sm">Pages</TableHead>
                    <TableHead className="text-xs sm:text-sm">Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requestsData.data.map((request) => (
                    <TableRow
                      key={request._id}
                      onClick={() => handleRowClick(request._id)}
                      className="cursor-pointer border-white/10 hover:bg-white/5"
                    >
                      <TableCell className="font-medium text-sm">
                        {request.projectName}
                      </TableCell>
                      <TableCell>
                        <span className="text-white/60 text-xs sm:text-sm">
                          {request.projectType.replace('_', ' ')}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium text-xs sm:text-sm">{request.contactName}</div>
                          <div className="text-xs text-white/60">{request.contactEmail}</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <RequestStatusBadge status={request.status} />
                      </TableCell>
                      <TableCell className="text-white/60 text-xs sm:text-sm">
                        {request.pagesRequired || 'N/A'}
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
              <Filter className="h-12 w-12 text-white/20 mb-4" />
              <div className="text-white/60">No requests found</div>
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
              <div className="text-white/60 text-sm">Loading requests...</div>
            </div>
          ) : requestsData?.data && requestsData.data.length > 0 ? (
            requestsData.data.map((request) => (
              <Card
                key={request._id}
                onClick={() => handleRowClick(request._id)}
                className="border-white/10 bg-white/5 rounded-lg p-3 cursor-pointer hover:bg-white/10 transition-colors"
              >
                <div className="space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm truncate">{request.projectName}</h3>
                      <p className="text-xs text-white/60 mt-0.5">{request.contactName}</p>
                    </div>
                    <RequestStatusBadge status={request.status} />
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs text-white/60">
                    <span>{formatDate(request.createdAt)}</span>
                    <span>{request.pagesRequired || 'N/A'} pages</span>
                  </div>
                </div>
              </Card>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center py-12">
              <Filter className="h-12 w-12 text-white/20 mb-4" />
              <div className="text-white/60 text-sm">No requests found</div>
              <div className="text-xs text-white/40 mt-1">
                Try adjusting your filters
              </div>
            </div>
          )}
        </div>

        {/* Pagination */}
        {requestsData && requestsData.pages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0 mt-4 sm:mt-6">
            <div className="text-xs sm:text-sm text-white/60">
              Page {requestsData.page} of {requestsData.pages}
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
                disabled={page === requestsData.pages}
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