/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { projectService } from '../services/api.service';
import { ArrowLeft, ExternalLink, Github, Calendar, DollarSign, Tag, ChevronLeft, ChevronRight } from 'lucide-react';

const ProjectView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<any>(null);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    const fetchProject = async () => {
      try {
        if (id) {
          const response = await projectService.getById(id);
          console.log('Fetched project:', response.data);
          setProject(response.data);
        }
      } catch (error) {
        console.error('Error fetching project:', error);
      }
    };

    fetchProject();
  }, [id]);

  const nextImage = () => {
    if (project.projectThumbnail && project.projectThumbnail.length > 0) {
      setSelectedImage((prev) => (prev + 1) % project.projectThumbnail.length);
    }
  };

  const prevImage = () => {
    if (project.projectThumbnail && project.projectThumbnail.length > 0) {
      setSelectedImage((prev) => (prev - 1 + project.projectThumbnail.length) % project.projectThumbnail.length);
    }
  };

  if (!project) return <div className="flex justify-center items-center h-64"><p className="text-gray-500">Project not found</p></div>;

  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-blue-600 hover:text-blue-800 mb-4"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Projects
        </button>
        <h1 className="text-4xl font-bold text-gray-900">{project.projectName}</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Images Section */}
        <div>
          {project.projectThumbnail && project.projectThumbnail.length > 0 ? (
            <div>
              <div className="mb-4 relative group">
                <img
                  src={project.projectThumbnail[selectedImage]}
                  alt={project.projectName}
                  className="w-full h-96 object-cover rounded-lg shadow-lg"
                />
                {project.projectThumbnail.length > 1 && (
                  <>
                    {/* Left Arrow */}
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      aria-label="Previous image"
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>
                    {/* Right Arrow */}
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      aria-label="Next image"
                    >
                      <ChevronRight className="w-6 h-6" />
                    </button>
                    {/* Image Counter */}
                    <div className="absolute bottom-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
                      {selectedImage + 1} / {project.projectThumbnail.length}
                    </div>
                  </>
                )}
              </div>
              {project.projectThumbnail.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {project.projectThumbnail.map((image: string, index: number) => (
                    <img
                      key={index}
                      src={image}
                      alt={`${project.projectName} ${index + 1}`}
                      className={`h-20 object-cover rounded cursor-pointer transition-all ${
                        selectedImage === index ? 'ring-2 ring-blue-500 scale-105' : 'hover:scale-105'
                      }`}
                      onClick={() => setSelectedImage(index)}
                    />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="w-full h-96 bg-gray-200 rounded-lg flex items-center justify-center">
              <span className="text-gray-500">No images available</span>
            </div>
          )}
        </div>

        {/* Project Details */}
        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-semibold mb-4">Project Details</h2>
            <p className="text-gray-700 leading-relaxed">{project.projectDescription}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              <Tag className="w-5 h-5 text-gray-500" />
              <div>
                <span className="text-sm text-gray-500">Category</span>
                <p className="font-medium capitalize">{project.category}</p>
              </div>
            </div>

            {project.duration && (
              <div className="flex items-center space-x-2">
                <Calendar className="w-5 h-5 text-gray-500" />
                <div>
                  <span className="text-sm text-gray-500">Duration</span>
                  <p className="font-medium">{project.duration}</p>
                </div>
              </div>
            )}

            {project.cost && (
              <div className="flex items-center space-x-2">
                <DollarSign className="w-5 h-5 text-gray-500" />
                <div>
                  <span className="text-sm text-gray-500">Cost</span>
                  <p className="font-medium">${project.cost}</p>
                </div>
              </div>
            )}
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-3">Technologies Used</h3>
            <div className="flex flex-wrap gap-2">
              {project.techStack.map((tech: string, index: number) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>

          <div className="flex space-x-4">
            {project.liveDemo && (
              <a
                href={project.liveDemo}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Live Demo
              </a>
            )}
            {project.gitRepo && (
              <a
                href={project.gitRepo}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors"
              >
                <Github className="w-4 h-4 mr-2" />
                Source Code
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectView;