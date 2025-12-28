'use client';

import { useRouter } from 'next/navigation';
import {
  FileText,
  Globe,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  TrendingUp,
  Users,
  BarChart3,
  ArrowRight,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
import { useWebsites, useWebsiteStats } from '@/hooks/useWebsites';
import { RequestStatus, WebsiteStatus } from '@/types';
import { formatDate } from '@/lib/utils';

export default function OverviewPage() {
  const router = useRouter();
  
  const { data: requestStats } = useRequestStats();
  const { data: websiteStats } = useWebsiteStats();
  
  // Get recent requests
  const { data: recentRequests } = useRequests({ page: 1, limit: 5 });
  
  // Get active websites
  const { data: activeWebsites } = useWebsites({ 
    status: WebsiteStatus.IN_PROGRESS,
    page: 1, 
    limit: 5 
  });

  // Calculate metrics
  const totalRequests = requestStats?.data?.total || 0;
  const totalWebsites = websiteStats?.data?.total || 0;
  const pendingRequests = requestStats?.data?.byStatus?.PENDING || 0;
  const inProgressWebsites = websiteStats?.data?.byStatus?.IN_PROGRESS || 0;
  const completedWebsites = websiteStats?.data?.byStatus?.COMPLETED || 0;
  const deployedWebsites = websiteStats?.data?.byStatus?.DEPLOYED || 0;

  return (
    <div className="h-full overflow-auto pl-16 lg:pl-0">
      {/* Header */}
      <div className="border-b border-white/10 bg-black px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">Dashboard Overview</h1>
          <p className="text-xs sm:text-sm text-white/60 mt-1">
            Monitor requests, websites, and performance metrics
          </p>
        </div>
      </div>

      <div className="px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          {/* Total Requests */}
          <Card className="border-white/10 bg-gradient-to-br from-white/5 to-white/0 rounded-lg">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm text-white/60 font-medium truncate">Total Requests</p>
                  <p className="text-2xl sm:text-3xl font-bold mt-1 sm:mt-2">{totalRequests}</p>
                  <div className="flex items-center gap-2 mt-1 sm:mt-2">
                    <div className="flex items-center gap-1 text-xs text-white/60">
                      <Clock className="h-3 w-3 flex-shrink-0" />
                      <span className="truncate">{pendingRequests} pending</span>
                    </div>
                  </div>
                </div>
                <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0 ml-3">
                  <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Active Websites */}
          <Card className="border-white/10 bg-gradient-to-br from-white/5 to-white/0 rounded-lg">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm text-white/60 font-medium truncate">Active Projects</p>
                  <p className="text-2xl sm:text-3xl font-bold mt-1 sm:mt-2">{inProgressWebsites}</p>
                  <div className="flex items-center gap-2 mt-1 sm:mt-2">
                    <div className="flex items-center gap-1 text-xs text-white/60">
                      <TrendingUp className="h-3 w-3 flex-shrink-0" />
                      <span className="truncate">In development</span>
                    </div>
                  </div>
                </div>
                <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-purple-500/10 flex items-center justify-center flex-shrink-0 ml-3">
                  <Globe className="h-5 w-5 sm:h-6 sm:w-6 text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Completed */}
          <Card className="border-white/10 bg-gradient-to-br from-white/5 to-white/0 rounded-lg">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm text-white/60 font-medium truncate">Completed</p>
                  <p className="text-2xl sm:text-3xl font-bold mt-1 sm:mt-2">{completedWebsites}</p>
                  <div className="flex items-center gap-2 mt-1 sm:mt-2">
                    <div className="flex items-center gap-1 text-xs text-white/60">
                      <CheckCircle className="h-3 w-3 flex-shrink-0" />
                      <span className="truncate">Ready to deploy</span>
                    </div>
                  </div>
                </div>
                <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0 ml-3">
                  <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Deployed */}
          <Card className="border-white/10 bg-gradient-to-br from-white/5 to-white/0 rounded-lg">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-xs sm:text-sm text-white/60 font-medium truncate">Live Websites</p>
                  <p className="text-2xl sm:text-3xl font-bold mt-1 sm:mt-2">{deployedWebsites}</p>
                  <div className="flex items-center gap-2 mt-1 sm:mt-2">
                    <div className="flex items-center gap-1 text-xs text-white/60">
                      <Globe className="h-3 w-3 flex-shrink-0" />
                      <span className="truncate">Production</span>
                    </div>
                  </div>
                </div>
                <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-full bg-emerald-500/10 flex items-center justify-center flex-shrink-0 ml-3">
                  <Globe className="h-5 w-5 sm:h-6 sm:w-6 text-emerald-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Status Breakdown */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Request Status Breakdown */}
          <Card className="border-white/10 bg-white/5 rounded-lg">
            <CardHeader className="p-4 sm:p-6">
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="text-base sm:text-lg truncate">Request Status</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push('/requests')}
                  className="gap-1 flex-shrink-0 h-8 text-xs sm:text-sm"
                >
                  <span className="hidden sm:inline">View All</span>
                  <span className="sm:hidden">All</span>
                  <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                    <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg bg-yellow-500/10 flex items-center justify-center flex-shrink-0">
                      <Clock className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-sm sm:text-base truncate">Pending</p>
                      <p className="text-xs text-white/60 truncate">Awaiting review</p>
                    </div>
                  </div>
                  <div className="text-xl sm:text-2xl font-bold flex-shrink-0">
                    {requestStats?.data?.byStatus?.PENDING || 0}
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                    <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                      <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-blue-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-sm sm:text-base truncate">In Review</p>
                      <p className="text-xs text-white/60 truncate">Being evaluated</p>
                    </div>
                  </div>
                  <div className="text-xl sm:text-2xl font-bold flex-shrink-0">
                    {requestStats?.data?.byStatus?.IN_REVIEW || 0}
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                    <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg bg-green-500/10 flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 text-green-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-sm sm:text-base truncate">Approved</p>
                      <p className="text-xs text-white/60 truncate">Project created</p>
                    </div>
                  </div>
                  <div className="text-xl sm:text-2xl font-bold flex-shrink-0">
                    {requestStats?.data?.byStatus?.APPROVED || 0}
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                    <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg bg-red-500/10 flex items-center justify-center flex-shrink-0">
                      <XCircle className="h-4 w-4 sm:h-5 sm:w-5 text-red-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-sm sm:text-base truncate">Rejected</p>
                      <p className="text-xs text-white/60 truncate">Not accepted</p>
                    </div>
                  </div>
                  <div className="text-xl sm:text-2xl font-bold flex-shrink-0">
                    {requestStats?.data?.byStatus?.REJECTED || 0}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Website Status Breakdown */}
          <Card className="border-white/10 bg-white/5 rounded-lg">
            <CardHeader className="p-4 sm:p-6">
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="text-base sm:text-lg truncate">Website Progress</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push('/websites')}
                  className="gap-1 flex-shrink-0 h-8 text-xs sm:text-sm"
                >
                  <span className="hidden sm:inline">View All</span>
                  <span className="sm:hidden">All</span>
                  <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              <div className="space-y-3 sm:space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                    <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg bg-gray-500/10 flex items-center justify-center flex-shrink-0">
                      <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-sm sm:text-base truncate">Created</p>
                      <p className="text-xs text-white/60 truncate">Not started</p>
                    </div>
                  </div>
                  <div className="text-xl sm:text-2xl font-bold flex-shrink-0">
                    {websiteStats?.data?.byStatus?.CREATED || 0}
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                    <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                      <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5 text-purple-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-sm sm:text-base truncate">In Progress</p>
                      <p className="text-xs text-white/60 truncate">Active development</p>
                    </div>
                  </div>
                  <div className="text-xl sm:text-2xl font-bold flex-shrink-0">
                    {websiteStats?.data?.byStatus?.IN_PROGRESS || 0}
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                    <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                      <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 text-blue-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-sm sm:text-base truncate">Review</p>
                      <p className="text-xs text-white/60 truncate">Quality check</p>
                    </div>
                  </div>
                  <div className="text-xl sm:text-2xl font-bold flex-shrink-0">
                    {websiteStats?.data?.byStatus?.REVIEW || 0}
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                    <div className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
                      <Globe className="h-4 w-4 sm:h-5 sm:w-5 text-emerald-400" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-medium text-sm sm:text-base truncate">Deployed</p>
                      <p className="text-xs text-white/60 truncate">Live production</p>
                    </div>
                  </div>
                  <div className="text-xl sm:text-2xl font-bold flex-shrink-0">
                    {websiteStats?.data?.byStatus?.DEPLOYED || 0}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {/* Recent Requests */}
          <Card className="border-white/10 bg-white/5 rounded-lg">
            <CardHeader className="p-4 sm:p-6">
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="text-base sm:text-lg truncate">Recent Requests</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push('/requests')}
                  className="gap-1 flex-shrink-0 h-8 text-xs sm:text-sm"
                >
                  <span className="hidden sm:inline">View All</span>
                  <span className="sm:hidden">All</span>
                  <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              {recentRequests?.data && recentRequests.data.length > 0 ? (
                <div className="space-y-3 sm:space-y-4">
                  {recentRequests.data.map((request) => (
                    <div
                      key={request._id}
                      className="flex items-center justify-between p-3 rounded-lg border border-white/10 hover:bg-white/5 cursor-pointer transition-colors gap-3"
                      onClick={() => router.push(`/requests/${request._id}`)}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate text-sm sm:text-base">{request.projectName}</p>
                        <p className="text-xs sm:text-sm text-white/60 truncate">
                          {request.contactName}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                        <RequestStatusBadge status={request.status} />
                        <ArrowRight className="h-4 w-4 text-white/40 hidden sm:block" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 sm:py-8 text-white/60">
                  <FileText className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-2 opacity-20" />
                  <p className="text-xs sm:text-sm">No recent requests</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Active Projects */}
          <Card className="border-white/10 bg-white/5 rounded-lg">
            <CardHeader className="p-4 sm:p-6">
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="text-base sm:text-lg truncate">Active Projects</CardTitle>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push('/websites')}
                  className="gap-1 flex-shrink-0 h-8 text-xs sm:text-sm"
                >
                  <span className="hidden sm:inline">View All</span>
                  <span className="sm:hidden">All</span>
                  <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              {activeWebsites?.data && activeWebsites.data.length > 0 ? (
                <div className="space-y-3 sm:space-y-4">
                  {activeWebsites.data.map((website) => (
                    <div
                      key={website._id}
                      className="flex items-center justify-between p-3 rounded-lg border border-white/10 hover:bg-white/5 cursor-pointer transition-colors gap-3"
                      onClick={() => router.push(`/websites/${website._id}`)}
                    >
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate text-sm sm:text-base">{website.name}</p>
                        <p className="text-xs sm:text-sm text-white/60 truncate">
                          {website.assignedAdmin || 'Unassigned'}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                        {website.completionPercentage !== undefined && (
                          <div className="text-xs sm:text-sm font-medium text-purple-400">
                            {website.completionPercentage}%
                          </div>
                        )}
                        <ArrowRight className="h-4 w-4 text-white/40 hidden sm:block" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-6 sm:py-8 text-white/60">
                  <Globe className="h-10 w-10 sm:h-12 sm:w-12 mx-auto mb-2 opacity-20" />
                  <p className="text-xs sm:text-sm">No active projects</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Admin Workload */}
        {websiteStats?.data?.byAdmin && websiteStats.data.byAdmin.length > 0 && (
          <Card className="border-white/10 bg-white/5 rounded-lg">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-base sm:text-lg">Team Workload</CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 pt-0">
              <div className="overflow-x-auto -mx-4 sm:-mx-6">
                <div className="inline-block min-w-full align-middle px-4 sm:px-6">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-white/10 hover:bg-white/5">
                        <TableHead className="text-xs sm:text-sm">Admin Name</TableHead>
                        <TableHead className="text-xs sm:text-sm">Projects</TableHead>
                        <TableHead className="text-right text-xs sm:text-sm">Workload</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {websiteStats.data.byAdmin.slice(0, 10).map((admin) => {
                        const maxCount = Math.max(...(websiteStats.data?.byAdmin?.map(a => a.count) || [1]));
                        const percentage = Math.min((admin.count / maxCount) * 100, 100);
                        
                        return (
                          <TableRow 
                            key={admin._id}
                            className="border-white/10 hover:bg-white/5"
                          >
                            <TableCell className="font-medium">
                              <div className="flex items-center gap-2">
                                <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-gradient-to-br from-purple-500/20 to-blue-500/20 flex items-center justify-center flex-shrink-0">
                                  <Users className="h-3 w-3 sm:h-4 sm:w-4 text-purple-400" />
                                </div>
                                <span className="text-xs sm:text-sm truncate">{admin._id}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-white/60 text-xs sm:text-sm">
                              {admin.count} {admin.count === 1 ? 'project' : 'projects'}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <div className="w-16 sm:w-24 h-2 bg-white/10 rounded-full overflow-hidden">
                                  <div 
                                    className="h-full bg-gradient-to-r from-purple-500 to-blue-500"
                                    style={{ width: `${percentage}%` }}
                                  />
                                </div>
                                <span className="text-xs sm:text-sm font-medium text-purple-400 min-w-[2ch]">
                                  {admin.count}
                                </span>
                              </div>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}