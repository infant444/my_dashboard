/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { blogService } from '../services/api.service';
import { ArrowLeft, Calendar, Clock, User, Tag } from 'lucide-react';

const BlogView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [blog, setBlog] = useState<any>(null);

  useEffect(() => {
    const fetchBlog = async () => {
      try {
        if (id) {
          const response = await blogService.getById(id);
          setBlog(response.data);
        }
      } catch (error) {
        console.error('Error fetching blog:', error);
      }
    };

    fetchBlog();
  }, [id]);

  if (!blog) return <div className="flex justify-center items-center h-64"><p className="text-gray-500">Blog not found</p></div>;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Blogs
        </button>
      </div>

      <article className="bg-white rounded-lg shadow-lg overflow-hidden">
        {blog.image && (
          <img
            src={blog.image}
            alt={blog.title}
            className="w-full h-64 object-cover"
          />
        )}
        
        <div className="p-8">
          <div className="flex items-center space-x-4 mb-6 text-sm text-gray-600">
            <div className="flex items-center">
              <Tag className="w-4 h-4 mr-1" />
              <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
                {blog.category}
              </span>
            </div>
            <div className="flex items-center">
              <User className="w-4 h-4 mr-1" />
              {blog.author}
            </div>
            {blog.publishDate && (
              <div className="flex items-center">
                <Calendar className="w-4 h-4 mr-1" />
                {new Date(blog.publishDate).toLocaleDateString()}
              </div>
            )}
            {blog.readTime && (
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                {blog.readTime}
              </div>
            )}
          </div>

          <h1 className="text-4xl font-bold text-gray-900 mb-4">{blog.title}</h1>
          
          {blog.excerpt && (
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              {blog.excerpt}
            </p>
          )}

          <div 
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: blog.content }}
          />
        </div>
      </article>
    </div>
  );
};

export default BlogView;