/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from 'react';
import { useEnquiries } from '../hooks/useApi';
import { enquiryService } from '../services/api.service';
import { Button, Textarea, Loading, Modal } from '../components/UI';
import { MessageSquare, Trash2, Reply } from 'lucide-react';

const Enquiries: React.FC = () => {
  const { enquiries, loading, refetch } = useEnquiries();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedEnquiry, setSelectedEnquiry] = useState<any>(null);
  const [response, setResponse] = useState('');

  const handleRespond = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEnquiry) return;

    try {
      await enquiryService.respond(selectedEnquiry.id, { response });
      setIsModalOpen(false);
      setSelectedEnquiry(null);
      setResponse('');
      refetch();
    } catch (error) {
      console.error('Error sending response:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this enquiry?')) {
      try {
        await enquiryService.delete(id);
        refetch();
      } catch (error) {
        console.error('Error deleting enquiry:', error);
      }
    }
  };

  const openResponseModal = (enquiry: any) => {
    setSelectedEnquiry(enquiry);
    setIsModalOpen(true);
  };

  if (loading) return <Loading />;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Enquiries</h1>
        <div className="text-sm text-gray-600">
          Total: {enquiries.length}
        </div>
      </div>

      <div className="space-y-4">
        {enquiries.map((enquiry: any) => (
          <div key={enquiry.id} className="bg-white rounded-lg shadow p-6">
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <div className="flex items-center mb-2">
                  <MessageSquare className="w-5 h-5 text-gray-400 mr-2" />
                  <h3 className="text-lg font-semibold">{enquiry.subject}</h3>
                  <span className={`ml-3 px-2 py-1 text-xs rounded-full ${
                    enquiry.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                    enquiry.status === 'responded' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {enquiry.status}
                  </span>
                </div>
                <div className="text-sm text-gray-600 mb-2">
                  <span className="font-medium">{enquiry.name}</span> • {enquiry.email}
                </div>
                <p className="text-gray-700 mb-4">{enquiry.message}</p>
                <div className="text-xs text-gray-500">
                  {new Date(enquiry.createdAt).toLocaleString()}
                </div>
              </div>
              <div className="flex space-x-2 ml-4">
                <Button
                  variant="secondary"
                  onClick={() => openResponseModal(enquiry)}
                  disabled={enquiry.status === 'responded'}
                >
                  <Reply className="w-4 h-4 mr-1" />
                  {enquiry.status === 'responded' ? 'Responded' : 'Respond'}
                </Button>
                <Button variant="danger" onClick={() => handleDelete(enquiry.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}

        {enquiries.length === 0 && (
          <div className="text-center py-12">
            <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No enquiries found</p>
          </div>
        )}
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedEnquiry(null);
          setResponse('');
        }}
        title="Respond to Enquiry"
      >
        {selectedEnquiry && (
          <div className="mb-4 p-4 bg-gray-50 rounded">
            <h4 className="font-medium">{selectedEnquiry.subject}</h4>
            <p className="text-sm text-gray-600 mt-1">{selectedEnquiry.message}</p>
          </div>
        )}
        <form onSubmit={handleRespond}>
          <Textarea
            label="Your Response"
            value={response}
            onChange={(e) => setResponse(e.target.value)}
            rows={6}
            placeholder="Type your response here..."
            required
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
              Send Response
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default Enquiries;