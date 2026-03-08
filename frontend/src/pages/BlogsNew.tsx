/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useRef, useEffect } from "react";
import { useBlogs } from "../hooks/useApi";
import { blogService } from "../services/api.service";
import { Button, Input, Loading } from "../components/UI";
import { Plus, Edit, Trash2, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const Blogs: React.FC = () => {
  const { blogs, loading, refetch } = useBlogs();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState<any>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [authorFilter, setAuthorFilter] = useState("");

  const filteredBlogs = blogs ? blogs.filter((blog: any) => {
    const matchesCategory = !categoryFilter || blog.category === categoryFilter;
    const matchesAuthor = !authorFilter || 
      (authorFilter === "my" && blog.authorId === user?.user_id) ||
      (authorFilter === "other" && blog.authorId !== user?.user_id);
    return matchesCategory && matchesAuthor;
  }) : [];
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    slug: "",
    excerpt: "",
    publishDate: "",
    readTime: "",
    category: "",
    author: "",
    tags: "",
    image: null as File | null,
  });

  const categories = [
    "ai_technology",
    "design",
    "development",
    "mobile",
    "business",
    "product",
  ];
  const insertText = (startTag: string, endTag: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = formData.content.substring(start, end);
    const newText =
      formData.content.substring(0, start) +
      startTag +
      selectedText +
      endTag +
      formData.content.substring(end);

    setFormData({ ...formData, content: newText });

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + startTag.length,
        start + startTag.length + selectedText.length,
      );
    }, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (key === "image" && value) {
        data.append(key, value as File);
      }  else if (key !== "image") {
        data.append(key, value as string);
      }
    });

    try {
      if (editingBlog) {
        await blogService.update(editingBlog.blogId, data);
      } else {
        await blogService.create(data);
      }
      setIsModalOpen(false);
      setEditingBlog(null);
      setFormData({
        title: "",
        content: "",
        slug: "",
        excerpt: "",
        publishDate: "",
        readTime: "",
        category: "",
        author: "",
        tags: "",
        image: null,
      });
      refetch();
    } catch (error) {
      console.error("Error saving blog:", error);
    }
  };

  const handleEdit = (blog: any) => {
    if (user?.role !== "superAdmin" && blog.authorId !== user?.user_id) {
      alert("You can only edit your own blogs");
      return;
    }
    setEditingBlog(blog);
    setFormData({
      title: blog.title,
      content: blog.content,
      slug: blog.slug,
      excerpt: blog.excerpt || "",
      publishDate: blog.publishDate ? blog.publishDate.split("T")[0] : "",
      readTime: blog.readTime || "",
      category: blog.category,
      author: blog.author,
      tags: blog.tags ? blog.tags.join(', ') : '',
      image: null,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string, authorId: string) => {
    if (user?.role !== "superAdmin" && authorId !== user?.user_id) {
      alert("You can only delete your own blogs");
      return;
    }
    if (window.confirm("Are you sure you want to delete this blog?")) {
      try {
        await blogService.delete(id);
        refetch();
      } catch (error) {
        console.error("Error deleting blog:", error);
      }
    }
  };

  const handleView = (blogId: string) => {
    navigate(`/dashboard/blogs/${blogId}`);
  };

  if (loading) return <Loading />;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Blogs</h1>
        <div className="flex space-x-4">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat.replace("_", " ")}
              </option>
            ))}
          </select>
          <select
            value={authorFilter}
            onChange={(e) => setAuthorFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md"
          >
            <option value="">All Authors</option>
            <option value="my">My Blogs</option>
            <option value="other">Other Blogs</option>
          </select>
          <Button onClick={() => setIsModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Blog
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tumpline
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Title
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Category
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Author
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Publish Date
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Read Time
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200 overflow-hidden" title="My Blog" >
            {!blogs || blogs.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                  <div className="text-lg font-medium">No blogs found</div>
                  <div className="text-sm">Try adjusting your filters or create a new blog</div>
                </td>
              </tr>
            ) : filteredBlogs.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                  <div className="text-lg font-medium">No blogs match your filters</div>
                  <div className="text-sm">Try adjusting your filters</div>
                </td>
              </tr>
            ) : (
              filteredBlogs.map((blog: any) => (
                <tr key={blog.blogId} className="relative  overflow-hidden">
                  <td className="px-6 py-4 overflow-hidden">
                    {blog.authorId === user?.user_id && (
                      <div className="text-white bg-red-500 h-xs absolute top-0 left-0 text-xs z-10  px-2 opacity-70">
                        My blog
                      </div>
                    )}{" "}
                    <img
                      src={blog.image}
                      alt={blog.title}
                      className="h-[5rem] w-full object-contain rounded-sm"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {blog.title}
                      </div>
                      <div className="text-sm text-gray-500 truncate max-w-xs">
                        {blog.excerpt}
                      </div>
                      {blog.tags && blog.tags.length > 0 && (
                        <div className="mt-1 flex flex-wrap gap-1">
                          {blog.tags.map((tag: string, index: number) => (
                            <span key={index} className="px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                      {blog.category}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {blog.author}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {blog.publishDate
                      ? new Date(blog.publishDate).toLocaleDateString()
                      : "Draft"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {blog.readTime || "N/A"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <Button
                        variant="secondary"
                        onClick={() => handleView(blog.blogId)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      {(user?.role === "superAdmin" ||
                        blog.authorId === user?.user_id) && (
                        <>
                          <Button
                            variant="secondary"
                            onClick={() => handleEdit(blog)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="danger"
                            onClick={() =>
                              handleDelete(blog.blogId, blog.authorId)
                            }
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">
                {editingBlog ? "Edit Blog" : "Add New Blog"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  label="Title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  required
                />
                <Input
                  label="Slug"
                  value={formData.slug}
                  onChange={(e) =>
                    setFormData({ ...formData, slug: e.target.value })
                  }
                  required
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat.replace("_", " ")}
                      </option>
                    ))}
                  </select>
                </div>
                <Input
                  label="Author"
                  value={formData.author}
                  onChange={(e) =>
                    setFormData({ ...formData, author: e.target.value })
                  }
                  placeholder={user?.name || ""}
                />
                <Input
                  label="publish Date"
                  type="Date"
                  value={formData.publishDate}
                  onChange={(e) =>
                    setFormData({ ...formData, publishDate: e.target.value })
                  }
                  required
                />
                <Input
                  label="Read time"
                  value={formData.readTime}
                  onChange={(e) =>
                    setFormData({ ...formData, readTime: e.target.value })
                  }
                  required
                />
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Tags (comma separated)
                  </label>
                  <input
                    type="text"
                    value={formData.tags}
                    onChange={(e) => {
                      setFormData({ ...formData, tags:e.target.value });
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md"
                    placeholder="react, javascript, web development"
                  />
                </div>
              </div>
              <Input
                label="Excerpt"
                value={formData.excerpt}
                onChange={(e) =>
                  setFormData({ ...formData, excerpt: e.target.value })
                }
                placeholder="Brief description..."
              />
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Content
                </label>
                <div className="border border-gray-300 rounded-md">
                  <div className="bg-gray-50 px-3 py-2 border-b border-gray-300 flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => insertText("<strong>", "</strong>")}
                      className="px-2 py-1 text-xs bg-white border rounded hover:bg-gray-100 font-bold"
                    >
                      B
                    </button>
                    <button
                      type="button"
                      onClick={() => insertText("<em>", "</em>")}
                      className="px-2 py-1 text-xs bg-white border rounded hover:bg-gray-100 italic"
                    >
                      I
                    </button>
                    <button
                      type="button"
                      onClick={() => insertText("<u>", "</u>")}
                      className="px-2 py-1 text-xs bg-white border rounded hover:bg-gray-100 underline"
                    >
                      U
                    </button>
                    <button
                      type="button"
                      onClick={() => insertText("<h1>", "</h1>")}
                      className="px-2 py-1 text-xs bg-white border rounded hover:bg-gray-100 font-bold text-lg"
                    >
                      H1
                    </button>
                    <button
                      type="button"
                      onClick={() => insertText("<h2>", "</h2>")}
                      className="px-2 py-1 text-xs bg-white border rounded hover:bg-gray-100 font-semibold"
                    >
                      H2
                    </button>
                    <button
                      type="button"
                      onClick={() => insertText("<ul><li>", "</li></ul>")}
                      className="px-2 py-1 text-xs bg-white border rounded hover:bg-gray-100"
                    >
                      • List
                    </button>
                    <button
                      type="button"
                      onClick={() => insertText('<a href="">', "</a>")}
                      className="px-2 py-1 text-xs bg-white border rounded hover:bg-gray-100 text-blue-600"
                    >
                      Link
                    </button>
                    <button
                      type="button"
                      onClick={() => insertText("<mark>", "</mark>")}
                      className="px-2 py-1 text-xs bg-white border rounded hover:bg-gray-100 bg-yellow-200"
                    >
                      Highlight
                    </button>
                  </div>
                  <textarea
                    ref={textareaRef}
                    value={formData.content}
                    onChange={(e) =>
                      setFormData({ ...formData, content: e.target.value })
                    }
                    rows={10}
                    className="w-full px-3 py-2 border-0 focus:ring-0 focus:outline-none font-mono text-sm"
                    placeholder="Write your content here..."
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Featured Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      image: e.target.files?.[0] || null,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div className="flex justify-end space-x-2 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setEditingBlog(null);
                    setFormData({
                      title: "",
                      content: "",
                      slug: "",
                      excerpt: "",
                      publishDate: "",
                      readTime: "",
                      category: "",
                      author: "",
                      tags: "",
                      image: null,
                    });
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  {editingBlog ? "Update" : "Create"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Blogs;
