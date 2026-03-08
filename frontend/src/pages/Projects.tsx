/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { useProjects } from '../hooks/useApi';
import { projectService } from '../services/api.service';
import { Button, Input, Textarea, Loading, Modal } from '../components/UI';
import { Plus, Edit, Trash2, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Projects: React.FC = () => {
  const { projects, loading, refetch } = useProjects();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<any>(null);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    projectName: '',
    projectDescription: '',
    techStack: '',
    liveDemo: '',
    gitRepo: '',
    duration: '',
    cost: '',
    category: '',
    images: [] as File[],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = new FormData();
    data.append('projectName', formData.projectName);
    data.append('projectDescription', formData.projectDescription);
    data.append('techStack', formData.techStack);
    data.append('liveDemo', formData.liveDemo);
    data.append('gitRepo', formData.gitRepo);
    data.append('duration', formData.duration);
    data.append('cost', formData.cost);
    data.append('category', formData.category);
    
    formData.images.forEach((image) => {
      data.append('images', image);
    });

    try {
      if (editingProject) {
        await projectService.update(editingProject.projectId, data);
      } else {
        await projectService.create(data);
      }
      setIsModalOpen(false);
      setEditingProject(null);
      setFormData({
        projectName: '',
        projectDescription: '',
        techStack: '',
        liveDemo: '',
        gitRepo: '',
        duration: '',
        cost: '',
        category: '',
        images: [],
      });
      refetch();
    } catch (error) {
      console.error('Error saving project:', error);
    }
  };

  const handleEdit = (project: any) => {
    setEditingProject(project);
    setFormData({
      projectName: project.projectName,
      projectDescription: project.projectDescription,
      techStack: project.techStack.join(', '),
      liveDemo: project.liveDemo || '',
      gitRepo: project.gitRepo || '',
      duration: project.duration || '',
      cost: project.cost || '',
      category: project.category || '',
      images: [],
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      try {
        await projectService.delete(id);
        refetch();
      } catch (error) {
        console.error('Error deleting project:', error);
      }
    }
  };

  const handleView = (projectId: string) => {
    navigate(`/dashboard/projects/${projectId}`);
  };

  if (loading) return <Loading />;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Projects</h1>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Project
        </Button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tech Stack</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Images</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cost</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {projects.map((project: any) => (
              <tr key={project.projectId}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div>
                    <div className="text-sm font-medium text-gray-900">{project.projectName}</div>
                    <div className="text-sm text-gray-500 truncate max-w-xs">{project.projectDescription}</div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                    {project.category}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-wrap gap-1">
                    {project.techStack.slice(0, 3).map((tech: string, index: number) => (
                      <span key={index} className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded">
                        {tech}
                      </span>
                    ))}
                    {project.techStack.length > 3 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded">
                        +{project.techStack.length - 3}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {project.projectThumbnail?.length || 0} images
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {project.duration || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {project.cost ? `$${project.cost}` : 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    <button  className="bg-green-50 text-green-700 px-3 py-1 rounded hover:bg-green-200" onClick={() => handleView(project.projectId)}>
                      <Eye className="w-4 h-4" />
                    </button>
                    <button className='"bg-gray-200 text-gray-700 px-3 py-1 rounded hover:bg-gray-300' onClick={() => handleEdit(project)}>
                      <Edit className="w-4 h-4" />
                    </button>
                    <button className='bg-red-100 text-red-700 px-3 py-1 rounded hover:bg-red-200' onClick={() => handleDelete(project.projectId)}>
                      <Trash2 className="w-4 h-4 " />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingProject(null);
          setFormData({
            projectName: '',
            projectDescription: '',
            techStack: '',
            liveDemo: '',
            gitRepo: '',
            duration: '',
            cost: '',
            category: '',
            images: [],
          });
        }}
        title={editingProject ? 'Edit Project' : 'Add New Project'}
      >
        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Project Name"
            value={formData.projectName}
            onChange={(e) => setFormData({ ...formData, projectName: e.target.value })}
            required
          />
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full p-2 px-3 py-3.5 mt-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
              required
            >
              <option value="">Select Category</option>
              <option value="web">Web</option>
              <option value="mobile_app">Mobile App</option>
              <option value="ai_agent">AI Agent</option>
              <option value="ai_chatbot">AI Chatbot</option>
              <option value="saas">SaaS</option>
            </select>
          </div>
          <Input
            label="Tech Stack (comma separated)"
            value={formData.techStack}
            onChange={(e) => setFormData({ ...formData, techStack: e.target.value })}
            placeholder="React, Node.js, MongoDB"
            required
          />
          <Input
            label="Duration"
            value={formData.duration}
            onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
            placeholder="3 months"
          />
          <Input
            label="Live Demo URL"
            value={formData.liveDemo}
            onChange={(e) => setFormData({ ...formData, liveDemo: e.target.value })}
            placeholder="https://example.com"
          />
          <Input
            label="Git Repository URL"
            value={formData.gitRepo}
            onChange={(e) => setFormData({ ...formData, gitRepo: e.target.value })}
            placeholder="https://github.com/sancilo/repo"
          />
          <Input
            label="Cost"
            value={formData.cost}
            onChange={(e) => setFormData({ ...formData, cost: e.target.value })}
            placeholder="5000"
            type="number"
          />
          <div className="md:col-span-2">
            <Textarea
              label="Project Description"
              value={formData.projectDescription}
              onChange={(e) => setFormData({ ...formData, projectDescription: e.target.value })}
              rows={4}
              required
            />
          </div>
          <div className="md:col-span-2">
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Images
              </label>
              <input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => setFormData({ 
                  ...formData, 
                  images: Array.from(e.target.files || [])
                })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>
          <div className="md:col-span-2 flex justify-end space-x-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit">
              {editingProject ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Projects;