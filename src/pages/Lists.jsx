import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { Upload, FileSpreadsheet, Loader } from 'lucide-react';

function Lists() {
  const [lists, setLists] = useState([]);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchLists = async () => {
    try {
      const { data } = await axios.get('http://localhost:5000/api/lists', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setLists(data);
    } catch (error) {
      toast.error('Failed to fetch lists');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLists();
  }, []);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    const validTypes = ['text/csv', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'];
    const fileType = selectedFile?.type;
    const fileExtension = selectedFile?.name.split('.').pop().toLowerCase();
    
    if (selectedFile && (validTypes.includes(fileType) || ['csv', 'xlsx', 'xls'].includes(fileExtension))) {
      setFile(selectedFile);
    } else {
      toast.error('Please select a valid CSV, XLSX, or XLS file');
      e.target.value = null;
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a file first');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);
    try {
      await axios.post('http://localhost:5000/api/lists/upload', formData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'multipart/form-data'
        }
      });
      toast.success('List uploaded and distributed successfully');
      setFile(null);
      // Reset file input
      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput) fileInput.value = '';
      fetchLists();
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to upload and distribute list';
      toast.error(message);
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Manage Lists</h2>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md mb-6">
        <h3 className="text-xl font-semibold mb-4">Upload New List</h3>
        <div className="flex items-center space-x-4">
          <input
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={handleFileChange}
            className="flex-1 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={handleUpload}
            disabled={!file || uploading}
            className={`flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 ${
              (!file || uploading) && 'opacity-50 cursor-not-allowed'
            }`}
          >
            {uploading ? (
              <Loader className="w-5 h-5 mr-2 animate-spin" />
            ) : (
              <Upload className="w-5 h-5 mr-2" />
            )}
            {uploading ? 'Uploading...' : 'Upload & Distribute'}
          </button>
        </div>
        <p className="text-sm text-gray-500 mt-2">
          Upload a CSV, XLSX, or XLS file with columns: FirstName, Phone, Notes
        </p>
      </div>

      {lists.length === 0 ? (
        <div className="bg-white p-6 rounded-lg shadow-md text-center text-gray-500">
          No lists have been uploaded yet. Upload a file to distribute tasks among agents.
        </div>
      ) : (
        <div className="space-y-6">
          {lists.map((list) => (
            <div key={list._id} className="bg-white p-6 rounded-lg shadow-md">
              <div className="flex items-center mb-4">
                <FileSpreadsheet className="w-6 h-6 text-blue-600 mr-3" />
                <div>
                  <h3 className="font-semibold text-lg">
                    List for {list.agentId.name}
                  </h3>
                  <p className="text-gray-600 text-sm">{list.agentId.email}</p>
                </div>
              </div>
              <div className="mt-4">
                <h4 className="font-medium mb-2">Assigned Items ({list.items.length})</h4>
                <div className="bg-gray-50 p-4 rounded-lg max-h-60 overflow-y-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="text-left text-gray-600">
                        <th className="pb-2">Name</th>
                        <th className="pb-2">Phone</th>
                        <th className="pb-2">Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {list.items.map((item, index) => (
                        <tr key={index} className="border-t border-gray-200">
                          <td className="py-2">{item.firstName}</td>
                          <td className="py-2">{item.phone}</td>
                          <td className="py-2">{item.notes}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Lists;