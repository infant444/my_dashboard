/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { useFeedbacks } from '../hooks/useApi';
import { feedbackService } from '../services/api.service';
import { Button, Input, Textarea, Loading, Modal } from '../components/UI';
import { Plus, Edit, Trash2, Star } from 'lucide-react';

const Feedback: React.FC = () => {
  const { feedbacks, loading, refetch } = useFeedbacks();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFeedback, setEditingFeedback] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    type: 'other' as 'suggestion' | 'compliment' | 'complaint' | 'positive' | 'other',
    rating: 5,
    message: '',
    adminNote: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingFeedback) {
        await feedbackService.update(editingFeedback.id, formData);
      } else {
        await feedbackService.create(formData);
      }
      setIsModalOpen(false);
      setEditingFeedback(null);
      setFormData({ name: '', email: '', type: 'other', rating: 5, message: '', adminNote: '' });
      refetch();
    } catch (error) {
      console.error('Error saving feedback:', error);
    }
  };

  const handleEdit = (feedback: any) => {
    setEditingFeedback(feedback);
    setFormData({
      name: feedback.name,
      email: feedback.email,
      type: feedback.type || 'other',
      rating: feedback.rating,
      message: feedback.message,
      adminNote: feedback.adminNote || '',
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this feedback?')) {
      try {
        await feedbackService.delete(id);
        refetch();
      } catch (error) {
        console.error('Error deleting feedback:', error);
      }
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  if (loading) return <Loading />;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Feedback</h1>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Add Feedback
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {feedbacks.map((feedback: any) => (
          <div key={feedback.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-semibold">{feedback.name}</h3>
                  <span className="px-2 py-1 text-xs font-semibold rounded-full bg-purple-100 text-purple-800">
                    {feedback.type}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">{feedback.email}</p>
                <div className="flex items-center mb-3">
                  {renderStars(feedback.rating)}
                  <span className="ml-2 text-sm text-gray-600">
                    ({feedback.rating}/5)
                  </span>
                </div>
              </div>
            </div>
            
            <p className="text-gray-700 mb-4 line-clamp-4">{feedback.message}</p>
            
            {feedback.adminNote && (
              <div className="mb-4 p-3 bg-yellow-50 border-l-4 border-yellow-400 rounded">
                <p className="text-xs font-semibold text-yellow-800 mb-1">Admin Note:</p>
                <p className="text-sm text-yellow-700">{feedback.adminNote}</p>
              </div>
            )}
            
            <div className="flex justify-between items-center">
              <span className="text-xs text-gray-500">
                {new Date(feedback.createdAt).toLocaleDateString()}
              </span>
              <div className="flex space-x-2">
                <Button variant="secondary" onClick={() => handleEdit(feedback)}>
                  <Edit className="w-4 h-4" />
                </Button>
                <Button variant="danger" onClick={() => handleDelete(feedback.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}

        {feedbacks.length === 0 && (
          <div className="col-span-full text-center py-12">
            <Star className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No feedback found</p>
          </div>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingFeedback(null);
          setFormData({ name: '', email: '', type: 'other', rating: 5, message: '', adminNote: '' });
        }}
        title={editingFeedback ? 'Edit Feedback' : 'Add New Feedback'}
      >
        <form onSubmit={handleSubmit}>
          <Input
            label="Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              <option value="suggestion">Suggestion</option>
              <option value="compliment">Compliment</option>
              <option value="complaint">Complaint</option>
              <option value="positive">Positive</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Rating <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.rating}
              onChange={(e) => setFormData({ ...formData, rating: parseInt(e.target.value) })}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            >
              {[1, 2, 3, 4, 5].map((rating) => (
                <option key={rating} value={rating}>
                  {rating} Star{rating > 1 ? 's' : ''}
                </option>
              ))}
            </select>
          </div>
          <Textarea
            label="Message"
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            rows={4}
            required
          />
          <Textarea
            label="Admin Note (Optional)"
            value={formData.adminNote}
            onChange={(e) => setFormData({ ...formData, adminNote: e.target.value })}
            rows={3}
            placeholder="Internal notes for admin use only..."
          />
          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit">
              {editingFeedback ? 'Update' : 'Create'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Feedback;