import React, { useEffect, useState } from 'react';
import api from '../utils/api';

const initialForm = { brand: '', modelName: '', category: '', fuelType: '', price: '', mileage: '', engineCC: '', batteryKwh: '', launchDate: '', description: '' };

const Models = () => {
  const [models, setModels] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const fetchModels = async () => {
    setLoading(true);
    try {
      const res = await api.get('/api/models');
      setModels(res.data);
    } catch (err) {
      setError('Failed to fetch models');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchModels(); }, []);

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async e => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };
      
      if (editingId) {
        await api.put(`/api/models/${editingId}`, form, { headers });
      } else {
        await api.post('/api/models', form, { headers });
      }
      setForm(initialForm);
      setEditingId(null);
      fetchModels();
    } catch (err) {
      setError('Failed to save model');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = model => {
    setForm({ ...model, launchDate: model.launchDate ? model.launchDate.slice(0,10) : '' });
    setEditingId(model.id);
  };

  const handleDelete = async id => {
    if (!window.confirm('Delete this model?')) return;
    try {
      const token = localStorage.getItem('token');
      await api.delete(`/api/models/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchModels();
    } catch (err) {
      setError('Failed to delete model');
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-8">
      <h2 className="text-3xl font-bold text-blue-900 mb-6 flex items-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-7 w-7 mr-2 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 13l2-2m0 0l7-7 7 7M13 5v6h6" /></svg>
        Vehicle Models
      </h2>
      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow p-6 mb-8 grid grid-cols-1 md:grid-cols-2 gap-4">
        <input className="border p-2 rounded" name="brand" placeholder="Brand" value={form.brand} onChange={handleChange} required />
        <input className="border p-2 rounded" name="modelName" placeholder="Model Name" value={form.modelName} onChange={handleChange} required />
        <input className="border p-2 rounded" name="category" placeholder="Category" value={form.category} onChange={handleChange} />
        <input className="border p-2 rounded" name="fuelType" placeholder="Fuel Type" value={form.fuelType} onChange={handleChange} />
        <input className="border p-2 rounded" name="price" type="number" placeholder="Price" value={form.price} onChange={handleChange} />
        <input className="border p-2 rounded" name="mileage" type="number" placeholder="Mileage" value={form.mileage} onChange={handleChange} />
        <input className="border p-2 rounded" name="engineCC" type="number" placeholder="Engine CC" value={form.engineCC} onChange={handleChange} />
        <input className="border p-2 rounded" name="batteryKwh" type="number" placeholder="Battery kWh" value={form.batteryKwh} onChange={handleChange} />
        <input className="border p-2 rounded" name="launchDate" type="date" placeholder="Launch Date" value={form.launchDate} onChange={handleChange} />
        <input className="border p-2 rounded col-span-1 md:col-span-2" name="description" placeholder="Description" value={form.description} onChange={handleChange} />
        <button type="submit" className="bg-blue-900 text-yellow-400 font-semibold px-4 py-2 rounded hover:bg-blue-700 transition col-span-1 md:col-span-2" disabled={submitting}>{editingId ? 'Update' : 'Add'} Model</button>
        {editingId && <button type="button" className="bg-gray-200 text-blue-900 font-semibold px-4 py-2 rounded hover:bg-gray-300 transition col-span-1 md:col-span-2" onClick={()=>{setForm(initialForm);setEditingId(null);}}>Cancel</button>}
      </form>
      {loading && <p>Loading...</p>}
      {error && <p className="text-red-500">{error}</p>}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {models && models.length > 0 ? (
          models.map(model => (
            <div key={model.id} className="bg-white rounded-lg shadow p-5 flex flex-col gap-2 border-l-4 border-yellow-400">
              <div className="flex items-center justify-between">
                <span className="text-xl font-bold text-blue-900">{model.brand} {model.modelName}</span>
                <div className="flex gap-2">
                  <button onClick={()=>handleEdit(model)} className="text-blue-900 bg-yellow-200 px-2 py-1 rounded hover:bg-yellow-300">Edit</button>
                  <button onClick={()=>handleDelete(model.id)} className="text-white bg-red-500 px-2 py-1 rounded hover:bg-red-600">Delete</button>
                </div>
              </div>
              <div className="text-blue-700">{model.category || 'N/A'} | {model.fuelType || 'N/A'}</div>
              <div className="text-sm text-gray-500">Price: ₹{model.price || 'N/A'} | Mileage: {model.mileage || 'N/A'} kmpl</div>
              <div className="text-sm text-gray-500">Engine: {model.engineCC || 'N/A'} CC | Battery: {model.batteryKwh || 'N/A'} kWh</div>
              <div className="text-sm text-gray-500">Launch: {model.launchDate ? model.launchDate.slice(0,10) : 'N/A'}</div>
              <div className="text-gray-700 mt-1">{model.description}</div>
            </div>
          ))
        ) : !loading && <div className="text-gray-500">No models found.</div>}
      </div>
    </div>
  );
};

export default Models;