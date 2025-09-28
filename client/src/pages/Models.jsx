"use client"

import { useEffect, useState } from "react"
import api from "../utils/api"

const initialForm = {
  brand: "",
  modelName: "",
  category: "",
  fuelType: "",
  price: "",
  mileage: "",
  engineCC: "",
  batteryKwh: "",
  launchDate: "",
  description: "",
}

const Models = () => {
  const [models, setModels] = useState([])
  const [filteredModels, setFilteredModels] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [form, setForm] = useState(initialForm)
  const [editingId, setEditingId] = useState(null)
  const [submitting, setSubmitting] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [filters, setFilters] = useState({
    search: "",
    category: "",
    fuelType: "",
    brand: "",
  })

  const fetchModels = async () => {
    setLoading(true)
    try {
      const res = await api.get("http://localhost:5000/api/models")
      setModels(res.data)
    } catch (err) {
      setError("Failed to fetch models")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchModels()
  }, [])

  useEffect(() => {
    let filtered = models

    if (filters.search) {
      filtered = filtered.filter(
        (model) =>
          model.brand?.toLowerCase().includes(filters.search.toLowerCase()) ||
          model.modelName?.toLowerCase().includes(filters.search.toLowerCase()),
      )
    }

    if (filters.category) {
      filtered = filtered.filter((model) => model.category === filters.category)
    }

    if (filters.fuelType) {
      filtered = filtered.filter((model) => model.fuelType === filters.fuelType)
    }

    if (filters.brand) {
      filtered = filtered.filter((model) => model.brand === filters.brand)
    }

    setFilteredModels(filtered)
  }, [models, filters])

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value })
  }

  const clearFilters = () => {
    setFilters({
      search: "",
      category: "",
      fuelType: "",
      brand: "",
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      const token = localStorage.getItem("token")
      const headers = { Authorization: `Bearer ${token}` }

      if (editingId) {
        await api.put(`http://localhost:5000/api/models/${editingId}`, form, { headers })
      } else {
        await api.post("http://localhost:5000/api/models", form, { headers })
      }
      setForm(initialForm)
      setEditingId(null)
      setShowForm(false)
      fetchModels()
    } catch (err) {
      setError("Failed to save model")
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (model) => {
    setForm({ ...model, launchDate: model.launchDate ? model.launchDate.slice(0, 10) : "" })
    setEditingId(model.id)
    setShowForm(true)
  }

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this model?")) return
    try {
      const token = localStorage.getItem("token")
      await api.delete(`http://localhost:5000/api/models/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      fetchModels()
    } catch (err) {
      setError("Failed to delete model")
    }
  }

  const cancelEdit = () => {
    setForm(initialForm)
    setEditingId(null)
    setShowForm(false)
  }

  const uniqueCategories = [...new Set(models.map((model) => model.category).filter(Boolean))]
  const uniqueFuelTypes = [...new Set(models.map((model) => model.fuelType).filter(Boolean))]
  const uniqueBrands = [...new Set(models.map((model) => model.brand).filter(Boolean))]

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-900 mx-auto mb-4"></div>
          <p className="text-xl text-gray-600">Loading vehicle models...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-700 text-white py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold mb-2 flex items-center">
                <svg className="h-10 w-10 mr-3 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
                Vehicle Models
              </h1>
              <p className="text-blue-100 text-lg">Manage and explore our comprehensive vehicle catalog</p>
            </div>
            <button
              onClick={() => setShowForm(!showForm)}
              className="bg-yellow-400 text-blue-900 font-bold px-6 py-3 rounded-lg hover:bg-yellow-300 transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              {showForm ? "Cancel" : "+ Add New Model"}
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">{error}</div>}

        {/* Add/Edit Model Form */}
        {showForm && (
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8 border-t-4 border-yellow-400">
            <h3 className="text-2xl font-bold text-blue-900 mb-6">
              {editingId ? "Edit Vehicle Model" : "Add New Vehicle Model"}
            </h3>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Brand</label>
                <input
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  name="brand"
                  placeholder="e.g., Honda, Yamaha"
                  value={form.brand}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Model Name</label>
                <input
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  name="modelName"
                  placeholder="e.g., Activa, R15"
                  value={form.modelName}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                <select
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  name="category"
                  value={form.category}
                  onChange={handleChange}
                >
                  <option value="">Select Category</option>
                  <option value="Scooter">Scooter</option>
                  <option value="Motorcycle">Motorcycle</option>
                  <option value="Electric">Electric</option>
                  <option value="Sports">Sports</option>
                  <option value="Cruiser">Cruiser</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Fuel Type</label>
                <select
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  name="fuelType"
                  value={form.fuelType}
                  onChange={handleChange}
                >
                  <option value="">Select Fuel Type</option>
                  <option value="Petrol">Petrol</option>
                  <option value="Electric">Electric</option>
                  <option value="Hybrid">Hybrid</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Price (₹)</label>
                <input
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  name="price"
                  type="number"
                  placeholder="Starting price"
                  value={form.price}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Mileage (kmpl)</label>
                <input
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  name="mileage"
                  type="number"
                  placeholder="Fuel efficiency"
                  value={form.mileage}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Engine CC</label>
                <input
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  name="engineCC"
                  type="number"
                  placeholder="Engine capacity"
                  value={form.engineCC}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Battery kWh</label>
                <input
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  name="batteryKwh"
                  type="number"
                  placeholder="Battery capacity"
                  value={form.batteryKwh}
                  onChange={handleChange}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Launch Date</label>
                <input
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  name="launchDate"
                  type="date"
                  value={form.launchDate}
                  onChange={handleChange}
                />
              </div>

              <div className="md:col-span-2 lg:col-span-3">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                <textarea
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  name="description"
                  placeholder="Detailed description of the vehicle model"
                  value={form.description}
                  onChange={handleChange}
                  rows={3}
                />
              </div>

              <div className="md:col-span-2 lg:col-span-3 flex gap-4">
                <button
                  type="submit"
                  className="bg-blue-900 text-yellow-400 font-bold px-8 py-3 rounded-lg hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  disabled={submitting}
                >
                  {submitting ? (
                    <div className="flex items-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-400 mr-2"></div>
                      {editingId ? "Updating..." : "Adding..."}
                    </div>
                  ) : (
                    `${editingId ? "Update" : "Add"} Model`
                  )}
                </button>
                {editingId && (
                  <button
                    type="button"
                    className="bg-gray-200 text-blue-900 font-semibold px-8 py-3 rounded-lg hover:bg-gray-300 transition-all duration-300"
                    onClick={cancelEdit}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>
        )}

        {/* Filters Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border-t-4 border-blue-900">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-4">
            <h3 className="text-xl font-bold text-blue-900 mb-4 lg:mb-0">Filter Models</h3>
            <button onClick={clearFilters} className="text-blue-600 hover:text-blue-800 font-semibold">
              Clear All Filters
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <input
                type="text"
                name="search"
                placeholder="Search by brand or model..."
                value={filters.search}
                onChange={handleFilterChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <select
                name="brand"
                value={filters.brand}
                onChange={handleFilterChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Brands</option>
                {uniqueBrands.map((brand) => (
                  <option key={brand} value={brand}>
                    {brand}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <select
                name="category"
                value={filters.category}
                onChange={handleFilterChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Categories</option>
                {uniqueCategories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <select
                name="fuelType"
                value={filters.fuelType}
                onChange={handleFilterChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Fuel Types</option>
                {uniqueFuelTypes.map((fuelType) => (
                  <option key={fuelType} value={fuelType}>
                    {fuelType}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Results Summary */}
        <div className="mb-6">
          <p className="text-gray-600">
            Showing <span className="font-semibold text-blue-900">{filteredModels.length}</span> of{" "}
            <span className="font-semibold text-blue-900">{models.length}</span> models
          </p>
        </div>

        {/* Models Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredModels && filteredModels.length > 0 ? (
            filteredModels.map((model) => (
              <div
                key={model.id}
                className="bg-white rounded-xl shadow-lg overflow-hidden border-l-4 border-yellow-400 hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                  <svg className="w-20 h-20 text-gray-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2L13.09 8.26L22 9L13.09 9.74L12 16L10.91 9.74L2 9L10.91 8.26L12 2Z" />
                  </svg>
                </div>

                <div className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-xl font-bold text-blue-900 text-balance">
                      {model.brand} {model.modelName}
                    </h3>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(model)}
                        className="text-blue-900 bg-yellow-200 px-2 py-1 rounded text-xs font-semibold hover:bg-yellow-300 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(model.id)}
                        className="text-white bg-red-500 px-2 py-1 rounded text-xs font-semibold hover:bg-red-600 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </div>

                  <div className="space-y-3 mb-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-semibold text-gray-600">Category:</span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          model.category === "Electric"
                            ? "bg-green-100 text-green-800"
                            : model.category === "Sports"
                              ? "bg-red-100 text-red-800"
                              : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {model.category || "N/A"}
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-sm font-semibold text-gray-600">Fuel Type:</span>
                      <span className="text-sm text-gray-800">{model.fuelType || "N/A"}</span>
                    </div>

                    {model.price && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-semibold text-gray-600">Starting Price:</span>
                        <span className="text-lg font-bold text-blue-900">₹{Number(model.price).toLocaleString()}</span>
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-semibold text-gray-600">Mileage:</span>
                        <p className="text-gray-800">{model.mileage ? `${model.mileage} kmpl` : "N/A"}</p>
                      </div>
                      <div>
                        <span className="font-semibold text-gray-600">Engine:</span>
                        <p className="text-gray-800">{model.engineCC ? `${model.engineCC} CC` : "N/A"}</p>
                      </div>
                    </div>

                    {model.batteryKwh && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-semibold text-gray-600">Battery:</span>
                        <span className="text-sm text-gray-800">{model.batteryKwh} kWh</span>
                      </div>
                    )}

                    {model.launchDate && (
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-semibold text-gray-600">Launch Date:</span>
                        <span className="text-sm text-gray-800">{model.launchDate.slice(0, 10)}</span>
                      </div>
                    )}
                  </div>

                  {model.description && (
                    <div className="border-t pt-4">
                      <p className="text-sm text-gray-600 text-pretty">{model.description}</p>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center py-16">
              <svg
                className="w-24 h-24 text-gray-300 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
              <h3 className="text-xl font-semibold text-gray-500 mb-2">No models found</h3>
              <p className="text-gray-400 mb-6">Try adjusting your filters or add a new model</p>
              <button
                onClick={() => setShowForm(true)}
                className="bg-blue-900 text-yellow-400 font-bold px-6 py-3 rounded-lg hover:bg-blue-700 transition-all duration-300 inline-flex items-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add First Model
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Models
