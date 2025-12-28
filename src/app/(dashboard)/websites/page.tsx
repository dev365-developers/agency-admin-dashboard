'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useWebsites, useWebsiteStats } from '@/hooks/useWebsites';
import { WebsiteStatus } from '@/types';
import { WebsiteStatusBadge } from '@/components/websites/WebsiteStatusBadge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  RefreshCw, 
  Search, 
  Globe, 
  Loader2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { format } from 'date-fns';

export default function WebsitesPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<WebsiteStatus | ''>('');
  const [adminFilter, setAdminFilter] = useState('');
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<'createdAt' | 'name' | 'completionPercentage'>('createdAt');
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');

  const { data: websitesResponse, isLoading, refetch } = useWebsites({
    search: search || undefined,
    status: statusFilter || undefined,
    assignedAdmin: adminFilter || undefined,
    page,
    limit: 20,
    sortBy,
    order,
  });

  const { data: statsResponse } = useWebsiteStats();

  const handleRowClick = (id: string) => {
    router.push(`/websites/${id}`);
  };

  const websites = websitesResponse?.data || [];
  const total = websitesResponse?.total || 0;
  const totalPages = websitesResponse?.pages || 1;

  // Get stats with proper typing
  const stats = statsResponse?.data;
  const totalWebsites = stats?.total || 0;
  const inProgress = stats?.byStatus?.[WebsiteStatus.IN_PROGRESS] || 0;
  const completed = stats?.byStatus?.[WebsiteStatus.COMPLETED] || 0;
  const deployed = stats?.byStatus?.[WebsiteStatus.DEPLOYED] || 0;

  return (
    <div className="flex flex-col h-full pl-16 lg:pl-0">
      {/* Header */}
      <div className="border-b border-white/10 bg-black px-4 sm:px-6 lg:px-8 py-3 sm:py-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-lg sm:text-2xl font-bold text-white">Website Projects</h1>
            <p className="text-xs sm:text-sm text-white/60 mt-0.5 sm:mt-1 hidden sm:block">
              Manage and track website development progress
            </p>
          </div>
          <Button
            onClick={() => refetch()}
            variant="outline"
            size="sm"
            className="border-white/10 hover:bg-white/5 gap-2 h-8 sm:h-9"
          >
            <RefreshCw className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Refresh</span>
          </Button>
        </div>

        {/* Statistics Cards - Hidden on mobile */}
        <div className="hidden sm:grid sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mt-4 sm:mt-6">
          <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors rounded-lg">
            <CardHeader className="pb-2 sm:pb-3">
              <CardTitle className="text-xs sm:text-sm font-medium text-white/60">Total Websites</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-white">
                {totalWebsites}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors rounded-lg">
            <CardHeader className="pb-2 sm:pb-3">
              <CardTitle className="text-xs sm:text-sm font-medium text-white/60">In Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-purple-400">
                {inProgress}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors rounded-lg">
            <CardHeader className="pb-2 sm:pb-3">
              <CardTitle className="text-xs sm:text-sm font-medium text-white/60">Completed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-green-400">
                {completed}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors rounded-lg">
            <CardHeader className="pb-2 sm:pb-3">
              <CardTitle className="text-xs sm:text-sm font-medium text-white/60">Deployed</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-emerald-400">
                {deployed}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Filters */}
      <div className="flex-shrink-0 border-b border-white/10 bg-black px-4 sm:px-6 lg:px-8 py-2.5 sm:py-4">
        <div className="space-y-2 sm:space-y-0 sm:grid sm:grid-cols-2 lg:grid-cols-5 gap-2 sm:gap-3">
          {/* Search */}
          <div className="relative sm:col-span-2">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-3.5 w-3.5 sm:h-4 sm:w-4 text-white/40" />
            <Input
              placeholder="Search by name or domain..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-9 sm:pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/40 rounded-lg h-9 sm:h-10 text-sm"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value as WebsiteStatus | '');
              setPage(1);
            }}
            className="px-2 sm:px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-white/20 h-9 sm:h-10"
          >
            <option value="" className="bg-black">All Statuses</option>
            {Object.values(WebsiteStatus).map((status) => (
              <option key={status} value={status} className="bg-black">
                {status.replace('_', ' ')}
              </option>
            ))}
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="px-2 sm:px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-white/20 h-9 sm:h-10"
          >
            <option value="createdAt" className="bg-black">Created Date</option>
            <option value="name" className="bg-black">Name</option>
            <option value="completionPercentage" className="bg-black">Completion %</option>
          </select>

          {/* Sort Order */}
          <select
            value={order}
            onChange={(e) => setOrder(e.target.value as 'asc' | 'desc')}
            className="px-2 sm:px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-white/20 h-9 sm:h-10"
          >
            <option value="desc" className="bg-black">Descending</option>
            <option value="asc" className="bg-black">Ascending</option>
          </select>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        {/* Desktop Table */}
        <Card className="bg-white/5 border-white/10 rounded-lg hidden md:block">
          <CardContent className="p-0">
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-5 h-5 sm:w-6 sm:h-6 text-white/40 animate-spin" />
              </div>
            ) : !websites || websites.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Globe className="w-10 h-10 sm:w-12 sm:h-12 text-white/20 mb-4" />
                <h3 className="text-base sm:text-lg font-medium text-white mb-1">No websites found</h3>
                <p className="text-white/60 text-xs sm:text-sm">
                  {search || statusFilter ? 'Try adjusting your filters' : 'No website projects have been created yet'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-white/10 hover:bg-transparent">
                      <TableHead className="text-white/60 text-xs sm:text-sm">Website Name</TableHead>
                      <TableHead className="text-white/60 text-xs sm:text-sm">Status</TableHead>
                      <TableHead className="text-white/60 text-xs sm:text-sm">Assigned Admin</TableHead>
                      <TableHead className="text-white/60 text-xs sm:text-sm">Progress</TableHead>
                      <TableHead className="text-white/60 text-xs sm:text-sm">Domain</TableHead>
                      <TableHead className="text-white/60 text-xs sm:text-sm">Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {websites.map((website) => (
                      <TableRow
                        key={website._id}
                        onClick={() => handleRowClick(website._id)}
                        className="border-white/10 hover:bg-white/5 cursor-pointer transition-colors"
                      >
                        <TableCell className="font-medium text-white text-xs sm:text-sm">
                          {website.name}
                        </TableCell>
                        <TableCell>
                          <WebsiteStatusBadge status={website.status} />
                        </TableCell>
                        <TableCell className="text-white/80 text-xs sm:text-sm">
                          {website.assignedAdmin || (
                            <span className="text-white/40 italic">Unassigned</span>
                          )}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden max-w-[100px] lg:max-w-[120px]">
                              <div
                                className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all"
                                style={{ width: `${website.completionPercentage || 0}%` }}
                              />
                            </div>
                            <span className="text-xs text-white/60 w-8 sm:w-10">
                              {website.completionPercentage || 0}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-white/80 text-xs sm:text-sm">
                          {website.domain || (
                            <span className="text-white/40 italic">Not set</span>
                          )}
                        </TableCell>
                        <TableCell className="text-white/60 text-xs sm:text-sm">
                          {format(new Date(website.createdAt), 'MMM d, yyyy')}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Mobile Card View */}
        <div className="md:hidden space-y-3">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-5 h-5 text-white/40 animate-spin" />
            </div>
          ) : !websites || websites.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Globe className="w-10 h-10 text-white/20 mb-4" />
              <h3 className="text-base font-medium text-white mb-1">No websites found</h3>
              <p className="text-white/60 text-xs">
                {search || statusFilter ? 'Try adjusting your filters' : 'No website projects yet'}
              </p>
            </div>
          ) : (
            websites.map((website) => (
              <Card
                key={website._id}
                onClick={() => handleRowClick(website._id)}
                className="border-white/10 bg-white/5 rounded-lg p-3 cursor-pointer hover:bg-white/10 transition-colors"
              >
                <div className="space-y-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm truncate text-white">{website.name}</h3>
                      <p className="text-xs text-white/60 mt-0.5 truncate">
                        {website.domain || 'No domain set'}
                      </p>
                    </div>
                    <WebsiteStatusBadge status={website.status} />
                  </div>

                  {/* Progress Bar */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs text-white/60">
                      <span>Progress</span>
                      <span>{website.completionPercentage || 0}%</span>
                    </div>
                    <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all"
                        style={{ width: `${website.completionPercentage || 0}%` }}
                      />
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs text-white/60">
                    <span>{format(new Date(website.createdAt), 'MMM d, yyyy')}</span>
                    <span className="truncate ml-2">
                      {website.assignedAdmin || <span className="italic">Unassigned</span>}
                    </span>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Pagination */}
        {websites && websites.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0 mt-4 sm:mt-6">
            <p className="text-xs sm:text-sm text-white/60">
              Showing {((page - 1) * 20) + 1} to {Math.min(page * 20, total)} of {total} websites
            </p>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <Button
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                variant="outline"
                size="sm"
                className="border-white/10 hover:bg-white/5 disabled:opacity-50 gap-1 flex-1 sm:flex-none h-8 sm:h-9"
              >
                <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4" />
                <span className="text-xs sm:text-sm">Previous</span>
              </Button>
              <span className="text-xs sm:text-sm text-white/60 px-2 sm:px-3 whitespace-nowrap">
                Page {page} of {totalPages}
              </span>
              <Button
                onClick={() => setPage(page + 1)}
                disabled={page >= totalPages}
                variant="outline"
                size="sm"
                className="border-white/10 hover:bg-white/5 disabled:opacity-50 gap-1 flex-1 sm:flex-none h-8 sm:h-9"
              >
                <span className="text-xs sm:text-sm">Next</span>
                <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}