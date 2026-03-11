/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { dashboardService } from '../services/api.service';
import { useAuth } from '../contexts/AuthContext';
import { 
  BarChart3, 
  FileText, 
  FolderKanban, 
  MessageSquare, 
  Star, 
  Users, 
  TrendingUp,
  Clock,
  AlertCircle
} from 'lucide-react';
import { toast } from 'react-toastify';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      const response = await dashboardService.getStats();
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
      toast.error('Failed to load dashboard data');
    }
  };

  if (!stats) {
    return <div className="flex justify-center items-center h-64"><p className="text-gray-500">Loading dashboard...</p></div>;
  }

  const statCards = [
    {
      title: 'Total Blogs',
      value: stats.stats.totalBlogs,
      icon: FileText,
      color: 'bg-blue-500',
      bgColor: 'bg-blue-50',
      textColor: 'text-blue-600'
    },
    {
      title: 'Total Projects',
      value: stats.stats.totalProjects,
      icon: FolderKanban,
      color: 'bg-purple-500',
      bgColor: 'bg-purple-50',
      textColor: 'text-purple-600'
    },
    {
      title: 'Total Enquiries',
      value: stats.stats.totalEnquiries,
      icon: MessageSquare,
      color: 'bg-green-500',
      bgColor: 'bg-green-50',
      textColor: 'text-green-600'
    },
    {
      title: 'Total Feedback',
      value: stats.stats.totalFeedback,
      icon: Star,
      color: 'bg-yellow-500',
      bgColor: 'bg-yellow-50',
      textColor: 'text-yellow-600'
    }
  ];

  if (user?.role === 'superAdmin') {
    statCards.push({
      title: 'Total Users',
      value: stats.stats.totalUsers,
      icon: Users,
      color: 'bg-pink-500',
      bgColor: 'bg-pink-50',
      textColor: 'text-pink-600'
    });
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome back, {user?.name}!</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">{stat.value}</p>
                </div>
                <div className={`${stat.bgColor} p-3 rounded-lg`}>
                  <Icon className={`w-6 h-6 ${stat.textColor}`} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Alert Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-6">
          <div className="flex items-center space-x-3">
            <AlertCircle className="w-6 h-6 text-orange-600" />
            <div>
              <h3 className="font-semibold text-orange-900">Pending Enquiries</h3>
              <p className="text-2xl font-bold text-orange-600 mt-1">{stats.stats.pendingEnquiries}</p>
            </div>
          </div>
        </div>
        <div className="bg-green-50 border border-green-200 rounded-xl p-6">
          <div className="flex items-center space-x-3">
            <TrendingUp className="w-6 h-6 text-green-600" />
            <div>
              <h3 className="font-semibold text-green-900">Active Feedback</h3>
              <p className="text-2xl font-bold text-green-600 mt-1">{stats.stats.activeFeedback}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Blogs by Category */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center space-x-2 mb-4">
            <BarChart3 className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900">Blogs by Category</h2>
          </div>
          <div className="space-y-3">
            {stats.charts.blogsByCategory.map((item: any, index: number) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-gray-600 capitalize">{item.category}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${(item.count / stats.stats.totalBlogs) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-semibold text-gray-900 w-8 text-right">{item.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Projects by Category */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center space-x-2 mb-4">
            <BarChart3 className="w-5 h-5 text-purple-600" />
            <h2 className="text-lg font-semibold text-gray-900">Projects by Category</h2>
          </div>
          <div className="space-y-3">
            {stats.charts.projectsByCategory.map((item: any, index: number) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm text-gray-600 capitalize">{item.category}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-32 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-purple-600 h-2 rounded-full" 
                      style={{ width: `${(item.count / stats.stats.totalProjects) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-semibold text-gray-900 w-8 text-right">{item.count}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Blogs */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Blogs</h2>
            <FileText className="w-5 h-5 text-blue-600" />
          </div>
          <div className="space-y-3">
            {stats.recent.blogs.map((blog: any) => (
              <div key={blog.blogId} className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                {blog.image && (
                  <img src={blog.image} alt={blog.title} className="w-12 h-12 rounded object-cover" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{blog.title}</p>
                  <p className="text-xs text-gray-500 mt-1">{blog.category}</p>
                  <div className="flex items-center text-xs text-gray-400 mt-1">
                    <Clock className="w-3 h-3 mr-1" />
                    {new Date(blog.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Projects */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Projects</h2>
            <FolderKanban className="w-5 h-5 text-purple-600" />
          </div>
          <div className="space-y-3">
            {stats.recent.projects.map((project: any) => (
              <div key={project.projectId} className="flex items-start space-x-3 p-3 hover:bg-gray-50 rounded-lg transition-colors">
                {project.projectThumbnail?.[0] && (
                  <img src={project.projectThumbnail[0]} alt={project.projectName} className="w-12 h-12 rounded object-cover" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{project.projectName}</p>
                  <p className="text-xs text-gray-500 mt-1">{project.category}</p>
                  <div className="flex items-center text-xs text-gray-400 mt-1">
                    <Clock className="w-3 h-3 mr-1" />
                    {new Date(project.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Enquiries */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Recent Enquiries</h2>
            <MessageSquare className="w-5 h-5 text-green-600" />
          </div>
          <div className="space-y-3">
            {stats.recent.enquiries.map((enquiry: any) => (
              <div key={enquiry.enquiryId} className="p-3 hover:bg-gray-50 rounded-lg transition-colors">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-sm font-medium text-gray-900 truncate">{enquiry.name}</p>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    enquiry.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    enquiry.status === 'resolved' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {enquiry.status}
                  </span>
                </div>
                <p className="text-xs text-gray-500 truncate">{enquiry.subject}</p>
                <div className="flex items-center text-xs text-gray-400 mt-1">
                  <Clock className="w-3 h-3 mr-1" />
                  {new Date(enquiry.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
