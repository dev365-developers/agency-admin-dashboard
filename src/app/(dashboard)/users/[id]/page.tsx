'use client';

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  useUserDetails,
  useUpdateUser,
  useUserRequests,
  useUserWebsites,
} from '@/hooks/useUsers';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  ArrowLeft,
  Loader2,
  Save,
  UserCircle,
  Mail,
  Calendar,
  FileText,
  Globe,
  Copy,
  ExternalLink,
  Search,
} from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { RequestStatusBadge } from '@/components/requests/RequestStatusBadge';
import { WebsiteStatusBadge } from '@/components/websites/WebsiteStatusBadge';

export default function UserDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const { data: userResponse, isLoading } = useUserDetails(id);
  const updateUser = useUpdateUser();
  
  // Tabs state
  const [activeTab, setActiveTab] = useState<'info' | 'requests' | 'websites'>('info');
  
  // Form states
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  
  // Search states for requests and websites
  const [requestSearch, setRequestSearch] = useState('');
  const [websiteSearch, setWebsiteSearch] = useState('');

  const user = userResponse?.data?.user;
  const recentRequests = userResponse?.data?.recentRequests || [];
  const recentWebsites = userResponse?.data?.recentWebsites || [];

  // Load more requests and websites with search
  const { data: allRequestsResponse } = useUserRequests(id, {
    search: requestSearch || undefined,
    page: 1,
    limit: 50,
  });
  const { data: allWebsitesResponse } = useUserWebsites(id, {
    search: websiteSearch || undefined,
    page: 1,
    limit: 50,
  });

  const allRequests = allRequestsResponse?.data || recentRequests;
  const allWebsites = allWebsitesResponse?.data || recentWebsites;

  // Update form when data loads
  useEffect(() => {
    if (user) {
      setEmail(user.email);
      setFirstName(user.firstName || '');
      setLastName(user.lastName || '');
      setImageUrl(user.imageUrl || '');
    }
  }, [user]);

  const handleSave = async () => {
    try {
      await updateUser.mutateAsync({
        id,
        data: {
          email,
          firstName: firstName || undefined,
          lastName: lastName || undefined,
          imageUrl: imageUrl || undefined,
        },
      });
      toast.success('User updated successfully!');
    } catch (error: any) {
      toast.error('Failed to update user', {
        description: error.response?.data?.error || 'An error occurred while updating.',
      });
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied!`, {
      description: text,
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen pl-16 lg:pl-0">
        <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 text-white/40 animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="p-3 sm:p-6 pl-[4.5rem] lg:pl-6">
        <div className="flex flex-col items-center justify-center py-12">
          <p className="text-white/60 text-xs sm:text-sm">User not found</p>
          <Button
            onClick={() => router.push('/users')}
            variant="outline"
            className="mt-4 border-white/10 h-8 sm:h-9 text-xs sm:text-sm"
          >
            Back to Users
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 sm:p-6 space-y-4 sm:space-y-6 pl-[4.5rem] lg:pl-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex items-start gap-2 sm:gap-4">
          <Button
            onClick={() => router.push('/users')}
            variant="ghost"
            size="icon"
            className="hover:bg-white/5 flex-shrink-0 h-8 w-8 sm:h-10 sm:w-10"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
          </Button>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-3">
              {user.imageUrl ? (
                <img
                  src={user.imageUrl}
                  alt={user.firstName || user.email}
                  className="w-12 h-12 sm:w-16 sm:h-16 rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-white/10 flex items-center justify-center">
                  <UserCircle className="w-8 h-8 sm:w-10 sm:h-10 text-white/40" />
                </div>
              )}
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white">
                  {user.firstName && user.lastName
                    ? `${user.firstName} ${user.lastName}`
                    : user.firstName || user.email.split('@')[0]}
                </h1>
                <p className="text-white/60 mt-1 text-xs sm:text-sm">{user.email}</p>
                {/* <div className="flex items-center gap-2 mt-2">
                  <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium">
                    {user.clerkId}
                  </span>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-6 w-6 hover:bg-white/10"
                    onClick={() => copyToClipboard(user._id, 'User ID')}
                  >
                    <Copy className="w-3 h-3" />
                  </Button>
                </div> */}
              </div>
            </div>
          </div>
        </div>
        {activeTab === 'info' && (
          <Button
            onClick={handleSave}
            disabled={updateUser.isPending}
            className="bg-white text-black hover:bg-white/90 h-8 sm:h-10 text-xs sm:text-sm"
          >
            {updateUser.isPending ? (
              <Loader2 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 animate-spin" />
            ) : (
              <Save className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            )}
            Save Changes
          </Button>
        )}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card className="bg-white/5 border-white/10 rounded-lg">
          <CardHeader className="pb-2 sm:pb-3">
            <CardTitle className="text-xs sm:text-sm font-medium text-white/60">Total Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-white">{user.requestCount}</div>
          </CardContent>
        </Card>
        <Card className="bg-white/5 border-white/10 rounded-lg">
          <CardHeader className="pb-2 sm:pb-3">
            <CardTitle className="text-xs sm:text-sm font-medium text-white/60">Total Websites</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl sm:text-2xl font-bold text-white">{user.websiteCount}</div>
          </CardContent>
        </Card>
        <Card className="bg-white/5 border-white/10 rounded-lg">
          <CardHeader className="pb-2 sm:pb-3">
            <CardTitle className="text-xs sm:text-sm font-medium text-white/60">Member Since</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm sm:text-base font-medium text-white">
              {format(new Date(user.createdAt), 'MMM yyyy')}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-white/5 border-white/10 rounded-lg">
          <CardHeader className="pb-2 sm:pb-3">
            <CardTitle className="text-xs sm:text-sm font-medium text-white/60">Last Updated</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm sm:text-base font-medium text-white">
              {format(new Date(user.updatedAt), 'MMM d, yyyy')}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="border-b border-white/10">
        <div className="flex gap-4 sm:gap-6">
          <button
            onClick={() => setActiveTab('info')}
            className={`pb-3 sm:pb-4 border-b-2 transition-colors text-xs sm:text-sm font-medium ${
              activeTab === 'info'
                ? 'border-white text-white'
                : 'border-transparent text-white/60 hover:text-white'
            }`}
          >
            User Info
          </button>
          <button
            onClick={() => setActiveTab('requests')}
            className={`pb-3 sm:pb-4 border-b-2 transition-colors text-xs sm:text-sm font-medium ${
              activeTab === 'requests'
                ? 'border-white text-white'
                : 'border-transparent text-white/60 hover:text-white'
            }`}
          >
            Requests ({user.requestCount})
          </button>
          <button
            onClick={() => setActiveTab('websites')}
            className={`pb-3 sm:pb-4 border-b-2 transition-colors text-xs sm:text-sm font-medium ${
              activeTab === 'websites'
                ? 'border-white text-white'
                : 'border-transparent text-white/60 hover:text-white'
            }`}
          >
            Websites ({user.websiteCount})
          </button>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'info' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <Card className="bg-white/5 border-white/10 rounded-lg">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-white text-base sm:text-lg">Personal Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6 pt-0">
              <div>
                <Label className="text-white/60 text-xs sm:text-sm">Email</Label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-black border-white/10 text-white mt-1 h-9 sm:h-10 text-sm"
                />
              </div>
              <div>
                <Label className="text-white/60 text-xs sm:text-sm">First Name</Label>
                <Input
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Enter first name"
                  className="bg-black border-white/10 text-white mt-1 h-9 sm:h-10 text-sm"
                />
              </div>
              <div>
                <Label className="text-white/60 text-xs sm:text-sm">Last Name</Label>
                <Input
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Enter last name"
                  className="bg-black border-white/10 text-white mt-1 h-9 sm:h-10 text-sm"
                />
              </div>
              <div>
                <Label className="text-white/60 text-xs sm:text-sm">Profile Image URL</Label>
                <Input
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  placeholder="https://..."
                  className="bg-black border-white/10 text-white mt-1 h-9 sm:h-10 text-sm"
                />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/5 border-white/10 rounded-lg">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-white text-base sm:text-lg">Account Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 sm:space-y-4 p-4 sm:p-6 pt-0">
              <div>
                <Label className="text-white/60 text-xs sm:text-sm">User ID</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Input
                    value={user._id}
                    readOnly
                    className="bg-black border-white/10 text-white font-mono text-xs sm:text-sm h-9 sm:h-10"
                  />
                  <Button
                    size="icon"
                    variant="outline"
                    className="border-white/10 hover:bg-white/5 h-9 w-9 sm:h-10 sm:w-10 flex-shrink-0"
                    onClick={() => copyToClipboard(user._id, 'User ID')}
                  >
                    <Copy className="w-3 h-3 sm:w-4 sm:h-4" />
                  </Button>
                </div>
              </div>
              {user.clerkId && (
                <div>
                  <Label className="text-white/60 text-xs sm:text-sm">Clerk ID</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Input
                      value={user.clerkId}
                      readOnly
                      className="bg-black border-white/10 text-white font-mono text-xs sm:text-sm h-9 sm:h-10"
                    />
                    <Button
                      size="icon"
                      variant="outline"
                      className="border-white/10 hover:bg-white/5 h-9 w-9 sm:h-10 sm:w-10 flex-shrink-0"
                      onClick={() => copyToClipboard(user.clerkId!, 'Clerk ID')}
                    >
                      <Copy className="w-3 h-3 sm:w-4 sm:h-4" />
                    </Button>
                  </div>
                </div>
              )}
              {user.googleId && (
                <div>
                  <Label className="text-white/60 text-xs sm:text-sm">Google ID</Label>
                  <div className="flex items-center gap-2 mt-1">
                    <Input
                      value={user.googleId}
                      readOnly
                      className="bg-black border-white/10 text-white font-mono text-xs sm:text-sm h-9 sm:h-10"
                    />
                    <Button
                      size="icon"
                      variant="outline"
                      className="border-white/10 hover:bg-white/5 h-9 w-9 sm:h-10 sm:w-10 flex-shrink-0"
                      onClick={() => copyToClipboard(user.googleId!, 'Google ID')}
                    >
                      <Copy className="w-3 h-3 sm:w-4 sm:h-4" />
                    </Button>
                  </div>
                </div>
              )}
              <div>
                <Label className="text-white/60 text-xs sm:text-sm">Auth Provider</Label>
                <Input
                  value={user.authProvider}
                  readOnly
                  className="bg-black border-white/10 text-white mt-1 h-9 sm:h-10 text-sm"
                />
              </div>
              <div>
                <Label className="text-white/60 text-xs sm:text-sm">Joined</Label>
                <Input
                  value={format(new Date(user.createdAt), 'MMMM d, yyyy h:mm a')}
                  readOnly
                  className="bg-black border-white/10 text-white mt-1 h-9 sm:h-10 text-sm"
                />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {activeTab === 'requests' && (
        <Card className="bg-white/5 border-white/10 rounded-lg">
          <CardHeader className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <CardTitle className="text-white text-base sm:text-lg">User Requests</CardTitle>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/40" />
                <Input
                  placeholder="Search requests..."
                  value={requestSearch}
                  onChange={(e) => setRequestSearch(e.target.value)}
                  className="pl-10 bg-black border-white/10 text-white h-9 text-sm"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {allRequests.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <FileText className="w-12 h-12 text-white/20 mb-4" />
                <h3 className="text-base sm:text-lg font-medium text-white mb-1">No requests</h3>
                <p className="text-white/60 text-xs sm:text-sm">This user hasn't submitted any requests yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-white/10 hover:bg-transparent">
                      <TableHead className="text-white/60 text-xs sm:text-sm">Project Name</TableHead>
                      <TableHead className="text-white/60 text-xs sm:text-sm">Type</TableHead>
                      <TableHead className="text-white/60 text-xs sm:text-sm">Status</TableHead>
                      <TableHead className="text-white/60 text-xs sm:text-sm">Created</TableHead>
                      <TableHead className="text-white/60 text-xs sm:text-sm">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allRequests.map((request) => (
                      <TableRow key={request._id} className="border-white/10 hover:bg-white/5">
                        <TableCell className="font-medium text-white text-xs sm:text-sm">
                          {request.projectName}
                        </TableCell>
                        <TableCell className="text-white/60 text-xs sm:text-sm">
                          {request.projectType.replace('_', ' ')}
                        </TableCell>
                        <TableCell>
                          <RequestStatusBadge status={request.status} />
                        </TableCell>
                        <TableCell className="text-white/60 text-xs sm:text-sm">
                          {format(new Date(request.createdAt), 'MMM d, yyyy')}
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-white/10 hover:bg-white/5 h-8 text-xs"
                            onClick={() => router.push(`/requests/${request._id}`)}
                          >
                            <ExternalLink className="w-3 h-3 mr-1" />
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {activeTab === 'websites' && (
        <Card className="bg-white/5 border-white/10 rounded-lg">
          <CardHeader className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <CardTitle className="text-white text-base sm:text-lg">User Websites</CardTitle>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-white/40" />
                <Input
                  placeholder="Search websites..."
                  value={websiteSearch}
                  onChange={(e) => setWebsiteSearch(e.target.value)}
                  className="pl-10 bg-black border-white/10 text-white h-9 text-sm"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {allWebsites.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <Globe className="w-12 h-12 text-white/20 mb-4" />
                <h3 className="text-base sm:text-lg font-medium text-white mb-1">No websites</h3>
                <p className="text-white/60 text-xs sm:text-sm">This user doesn't have any websites yet</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-white/10 hover:bg-transparent">
                      <TableHead className="text-white/60 text-xs sm:text-sm">Website Name</TableHead>
                      <TableHead className="text-white/60 text-xs sm:text-sm">Status</TableHead>
                      <TableHead className="text-white/60 text-xs sm:text-sm">Progress</TableHead>
                      <TableHead className="text-white/60 text-xs sm:text-sm">Created</TableHead>
                      <TableHead className="text-white/60 text-xs sm:text-sm">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {allWebsites.map((website) => (
                      <TableRow key={website._id} className="border-white/10 hover:bg-white/5">
                        <TableCell className="font-medium text-white text-xs sm:text-sm">
                          {website.name}
                        </TableCell>
                        <TableCell>
                          <WebsiteStatusBadge status={website.status} />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden max-w-[100px]">
                              <div
                                className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all"
                                style={{ width: `${website.completionPercentage || 0}%` }}
                              />
                            </div>
                            <span className="text-xs text-white/60 w-10">
                              {website.completionPercentage || 0}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-white/60 text-xs sm:text-sm">
                          {format(new Date(website.createdAt), 'MMM d, yyyy')}
                        </TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="outline"
                            className="border-white/10 hover:bg-white/5 h-8 text-xs"
                            onClick={() => router.push(`/websites/${website._id}`)}
                          >
                            <ExternalLink className="w-3 h-3 mr-1" />
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}