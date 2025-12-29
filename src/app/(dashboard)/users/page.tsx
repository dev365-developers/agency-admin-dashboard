'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUsers, useUserStats } from '@/hooks/useUsers';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  RefreshCw, 
  Search, 
  Users as UsersIcon, 
  Loader2,
  ChevronLeft,
  ChevronRight,
  UserCircle
} from 'lucide-react';
import { format } from 'date-fns';

export default function UsersPage() {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [authProviderFilter, setAuthProviderFilter] = useState<'clerk' | 'google' | 'email' | ''>('');
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<'createdAt' | 'email' | 'firstName'>('createdAt');
  const [order, setOrder] = useState<'asc' | 'desc'>('desc');

  const { data: usersResponse, isLoading, refetch } = useUsers({
    search: search || undefined,
    authProvider: authProviderFilter || undefined,
    page,
    limit: 20,
    sortBy,
    order,
  });

  const { data: statsResponse } = useUserStats();

  const handleRowClick = (id: string) => {
    router.push(`/users/${id}`);
  };

  const users = usersResponse?.data || [];
  const total = usersResponse?.total || 0;
  const totalPages = usersResponse?.pages || 1;

  const stats = statsResponse?.data;
  const totalUsers = stats?.total || 0;
  const clerkUsers = stats?.byAuthProvider?.clerk || 0;
  const googleUsers = stats?.byAuthProvider?.google || 0;
  const emailUsers = stats?.byAuthProvider?.email || 0;

  return (
    <div className="flex flex-col h-full pl-16 lg:pl-0">
      {/* Header */}
      <div className="border-b border-white/10 bg-black px-4 sm:px-6 lg:px-8 py-3 sm:py-6">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-lg sm:text-2xl font-bold text-white">Users</h1>
            <p className="text-xs sm:text-sm text-white/60 mt-0.5 sm:mt-1 hidden sm:block">
              Manage user accounts and view their activity
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
              <CardTitle className="text-xs sm:text-sm font-medium text-white/60">Total Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-white">
                {totalUsers}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors rounded-lg">
            <CardHeader className="pb-2 sm:pb-3">
              <CardTitle className="text-xs sm:text-sm font-medium text-white/60">Clerk Auth</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-purple-400">
                {clerkUsers}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors rounded-lg">
            <CardHeader className="pb-2 sm:pb-3">
              <CardTitle className="text-xs sm:text-sm font-medium text-white/60">Google Auth</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-blue-400">
                {googleUsers}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10 hover:bg-white/10 transition-colors rounded-lg">
            <CardHeader className="pb-2 sm:pb-3">
              <CardTitle className="text-xs sm:text-sm font-medium text-white/60">Email Auth</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xl sm:text-2xl font-bold text-green-400">
                {emailUsers}
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
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="pl-9 sm:pl-10 bg-white/5 border-white/10 text-white placeholder:text-white/40 rounded-lg h-9 sm:h-10 text-sm"
            />
          </div>

          {/* Auth Provider Filter */}
          <select
            value={authProviderFilter}
            onChange={(e) => {
              setAuthProviderFilter(e.target.value as typeof authProviderFilter);
              setPage(1);
            }}
            className="px-2 sm:px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-white/20 h-9 sm:h-10"
          >
            <option value="" className="bg-black">All Providers</option>
            <option value="clerk" className="bg-black">Clerk</option>
            <option value="google" className="bg-black">Google</option>
            <option value="email" className="bg-black">Email</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="px-2 sm:px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-white/20 h-9 sm:h-10"
          >
            <option value="createdAt" className="bg-black">Created Date</option>
            <option value="email" className="bg-black">Email</option>
            <option value="firstName" className="bg-black">Name</option>
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
            ) : !users || users.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <UsersIcon className="w-10 h-10 sm:w-12 sm:h-12 text-white/20 mb-4" />
                <h3 className="text-base sm:text-lg font-medium text-white mb-1">No users found</h3>
                <p className="text-white/60 text-xs sm:text-sm">
                  {search || authProviderFilter ? 'Try adjusting your filters' : 'No users have been registered yet'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-white/10 hover:bg-transparent">
                      <TableHead className="text-white/60 text-xs sm:text-sm">User</TableHead>
                      <TableHead className="text-white/60 text-xs sm:text-sm">Email</TableHead>
                      <TableHead className="text-white/60 text-xs sm:text-sm">Auth Provider</TableHead>
                      <TableHead className="text-white/60 text-xs sm:text-sm">Requests</TableHead>
                      <TableHead className="text-white/60 text-xs sm:text-sm">Websites</TableHead>
                      <TableHead className="text-white/60 text-xs sm:text-sm">Joined</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow
                        key={user._id}
                        onClick={() => handleRowClick(user._id)}
                        className="border-white/10 hover:bg-white/5 cursor-pointer transition-colors"
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            {user.imageUrl ? (
                              <img
                                src={user.imageUrl}
                                alt={user.firstName || user.email}
                                className="w-8 h-8 rounded-full object-cover"
                              />
                            ) : (
                              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                                <UserCircle className="w-5 h-5 text-white/40" />
                              </div>
                            )}
                            <div>
                              <div className="font-medium text-white text-xs sm:text-sm">
                                {user.firstName && user.lastName
                                  ? `${user.firstName} ${user.lastName}`
                                  : user.firstName || user.email.split('@')[0]}
                              </div>
                              <div className="text-xs text-white/40 truncate max-w-[150px]">
                                ID: {user._id.slice(-8)}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-white/80 text-xs sm:text-sm">
                          {user.email}
                        </TableCell>
                        <TableCell>
                          <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${
                            user.authProvider === 'clerk'
                              ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                              : user.authProvider === 'google'
                              ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                              : 'bg-green-500/20 text-green-300 border border-green-500/40'
                          }`}>
                            {user.authProvider}
                          </span>
                        </TableCell>
                        <TableCell className="text-white/80 text-xs sm:text-sm">
                          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-white/10">
                            {user.requestCount}
                          </span>
                        </TableCell>
                        <TableCell className="text-white/80 text-xs sm:text-sm">
                          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-white/10">
                            {user.websiteCount}
                          </span>
                        </TableCell>
                        <TableCell className="text-white/60 text-xs sm:text-sm">
                          {format(new Date(user.createdAt), 'MMM d, yyyy')}
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
          ) : !users || users.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <UsersIcon className="w-10 h-10 text-white/20 mb-4" />
              <h3 className="text-base font-medium text-white mb-1">No users found</h3>
              <p className="text-white/60 text-xs">
                {search || authProviderFilter ? 'Try adjusting your filters' : 'No users yet'}
              </p>
            </div>
          ) : (
            users.map((user) => (
              <Card
                key={user._id}
                onClick={() => handleRowClick(user._id)}
                className="border-white/10 bg-white/5 rounded-lg p-3 cursor-pointer hover:bg-white/10 transition-colors"
              >
                <div className="space-y-2.5">
                  <div className="flex items-start gap-3">
                    {user.imageUrl ? (
                      <img
                        src={user.imageUrl}
                        alt={user.firstName || user.email}
                        className="w-10 h-10 rounded-full object-cover flex-shrink-0"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                        <UserCircle className="w-6 h-6 text-white/40" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-medium text-sm truncate text-white">
                        {user.firstName && user.lastName
                          ? `${user.firstName} ${user.lastName}`
                          : user.firstName || user.email.split('@')[0]}
                      </h3>
                      <p className="text-xs text-white/60 mt-0.5 truncate">
                        {user.email}
                      </p>
                    </div>
                    <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium flex-shrink-0 ${
                      user.authProvider === 'clerk'
                        ? 'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                        : user.authProvider === 'google'
                        ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                        : 'bg-green-500/20 text-green-300 border border-green-500/40'
                    }`}>
                      {user.authProvider}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-white/10 text-xs text-white/60">
                    <span>Joined {format(new Date(user.createdAt), 'MMM d, yyyy')}</span>
                    <div className="flex items-center gap-3">
                      <span>{user.requestCount} requests</span>
                      <span>{user.websiteCount} websites</span>
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Pagination */}
        {users && users.length > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-0 mt-4 sm:mt-6">
            <p className="text-xs sm:text-sm text-white/60">
              Showing {((page - 1) * 20) + 1} to {Math.min(page * 20, total)} of {total} users
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