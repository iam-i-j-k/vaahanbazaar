"use client"

import { useEffect, useState, useContext } from "react"
import { AuthContext } from "../contexts/AuthContext"
import api from "../utils/api"

const Listings = () => {
  const { user } = useContext(AuthContext)
  const [listings, setListings] = useState([])
  const [filteredListings, setFilteredListings] = useState([])
  const [models, setModels] = useState([])
  const [dealers, setDealers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [filters, setFilters] = useState({
    search: "",
    listingType: "",
    priceRange: "",
    brand: "",
    condition: "",
  })
  const [form, setForm] = useState({
    modelId: "",
    dealerId: "",
    listingType: "new",
    condition: "new",
    year: new Date().getFullYear(),
    kms: 0,
    price: "",
    stockCount: 1,
  })

  const fetchListings = async () => {
    try {
      const res = await api.get("http://localhost:5000/api/listings")
      setListings(res.data)
    } catch (err) {
      setError("Failed to fetch listings")
    }
  }

  const fetchModels = async () => {
    try {
      const res = await api.get("http://localhost:5000/api/models")
      setModels(res.data)
    } catch (err) {
      console.error("Failed to fetch models")
    }
  }

  const fetchDealers = async () => {
    try {
      // For now, we'll create a mock dealer since we don't have a dealers endpoint
      setDealers([{ id: "1", name: "Default Dealer" }])
    } catch (err) {
      console.error("Failed to fetch dealers")
    }
  }

  useEffect(() => {
    const loadData = async () => {
      setLoading(true)
      await Promise.all([fetchListings(), fetchModels(), fetchDealers()])
      setLoading(false)
    }
    loadData()
  }, [])

  useEffect(() => {
    let filtered = listings

    if (filters.search) {
      filtered = filtered.filter(
        (listing) =>
          listing.model?.brand?.toLowerCase().includes(filters.search.toLowerCase()) ||
          listing.model?.modelName?.toLowerCase().includes(filters.search.toLowerCase()),
      )
    }

    if (filters.listingType) {
      filtered = filtered.filter((listing) => listing.listingType === filters.listingType)
    }

    if (filters.condition) {
      filtered = filtered.filter((listing) => listing.condition === filters.condition)
    }

    if (filters.brand) {
      filtered = filtered.filter((listing) => listing.model?.brand === filters.brand)
    }

    if (filters.priceRange) {
      const [min, max] = filters.priceRange.split("-").map(Number)
      filtered = filtered.filter((listing) => {
        const price = listing.price
        if (max) return price >= min && price <= max
        return price >= min
      })
    }

    setFilteredListings(filtered)
  }, [listings, filters])

  const handleFilterChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value })
  }

  const clearFilters = () => {
    setFilters({
      search: "",
      listingType: "",
      priceRange: "",
      brand: "",
      condition: "",
    })
  }

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await api.post("http://localhost:5000/api/listings", form, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      })
      setForm({
        modelId: "",
        dealerId: "",
        listingType: "new",
        condition: "new",
        year: new Date().getFullYear(),
        kms: 0,
        price: "",
        stockCount: 1,
      })
      setShowForm(false)
      fetchListings()
    } catch (err) {
      setError("Failed to create listing")
    }
  }

  const uniqueBrands = [...new Set(models.map((model) => model.brand))]

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-900 mx-auto mb-4"></div>
          <p className="text-xl text-gray-600">Loading vehicles...</p>
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
                Vehicle Marketplace
              </h1>
              <p className="text-blue-100 text-lg">Discover your perfect two-wheeler from our extensive collection</p>
            </div>
            {user && (user.role === "dealer" || user.role === "admin") && (
              <button
                onClick={() => setShowForm(!showForm)}
                className="bg-yellow-400 text-blue-900 font-bold px-6 py-3 rounded-lg hover:bg-yellow-300 transition-all duration-300 transform hover:scale-105 shadow-lg"
              >
                {showForm ? "Cancel" : "+ Add New Listing"}
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">{error}</div>}

        {/* Add Listing Form */}
        {showForm && (
          <div className="bg-white rounded-xl shadow-lg p-8 mb-8 border-t-4 border-yellow-400">
            <h3 className="text-2xl font-bold text-blue-900 mb-6">Add New Vehicle Listing</h3>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Vehicle Model</label>
                <select
                  name="modelId"
                  value={form.modelId}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Model</option>
                  {models.map((model) => (
                    <option key={model.id} value={model.id}>
                      {model.brand} {model.modelName}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Dealer</label>
                <select
                  name="dealerId"
                  value={form.dealerId}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Dealer</option>
                  {dealers.map((dealer) => (
                    <option key={dealer.id} value={dealer.id}>
                      {dealer.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Listing Type</label>
                <select
                  name="listingType"
                  value={form.listingType}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="new">New</option>
                  <option value="used">Used</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Condition</label>
                <select
                  name="condition"
                  value={form.condition}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="new">New</option>
                  <option value="excellent">Excellent</option>
                  <option value="good">Good</option>
                  <option value="fair">Fair</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Year</label>
                <input
                  name="year"
                  type="number"
                  placeholder="Year"
                  value={form.year}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Kilometers</label>
                <input
                  name="kms"
                  type="number"
                  placeholder="Kilometers"
                  value={form.kms}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Price (₹)</label>
                <input
                  name="price"
                  type="number"
                  placeholder="Price"
                  value={form.price}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Stock Count</label>
                <input
                  name="stockCount"
                  type="number"
                  placeholder="Stock Count"
                  value={form.stockCount}
                  onChange={handleChange}
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="md:col-span-2 lg:col-span-3">
                <button
                  type="submit"
                  className="bg-blue-900 text-yellow-400 font-bold px-8 py-3 rounded-lg hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  Create Listing
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Filters Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border-t-4 border-blue-900">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-4">
            <h3 className="text-xl font-bold text-blue-900 mb-4 lg:mb-0">Filter Vehicles</h3>
            <button onClick={clearFilters} className="text-blue-600 hover:text-blue-800 font-semibold">
              Clear All Filters
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
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
                name="listingType"
                value={filters.listingType}
                onChange={handleFilterChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Types</option>
                <option value="new">New</option>
                <option value="used">Used</option>
              </select>
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
                name="condition"
                value={filters.condition}
                onChange={handleFilterChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Conditions</option>
                <option value="new">New</option>
                <option value="excellent">Excellent</option>
                <option value="good">Good</option>
                <option value="fair">Fair</option>
              </select>
            </div>

            <div>
              <select
                name="priceRange"
                value={filters.priceRange}
                onChange={handleFilterChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Prices</option>
                <option value="0-50000">Under ₹50,000</option>
                <option value="50000-100000">₹50,000 - ₹1,00,000</option>
                <option value="100000-200000">₹1,00,000 - ₹2,00,000</option>
                <option value="200000-500000">₹2,00,000 - ₹5,00,000</option>
                <option value="500000">Above ₹5,00,000</option>
              </select>
            </div>
          </div>
        </div>

        {/* Results Summary */}
        <div className="mb-6">
          <p className="text-gray-600">
            Showing <span className="font-semibold text-blue-900">{filteredListings.length}</span> of{" "}
            <span className="font-semibold text-blue-900">{listings.length}</span> vehicles
          </p>
        </div>

        {/* Listings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredListings.length > 0 ? (
            filteredListings.map((listing) => (
              <div
                key={listing.id}
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
                      {listing.model?.brand} {listing.model?.modelName}
                    </h3>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${
                        listing.listingType === "new" ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {listing.listingType}
                    </span>
                  </div>

                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between items-center">
                      <span className="text-2xl font-bold text-blue-900">₹{listing.price?.toLocaleString()}</span>
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                          listing.condition === "new"
                            ? "bg-green-100 text-green-800"
                            : listing.condition === "excellent"
                              ? "bg-blue-100 text-blue-800"
                              : listing.condition === "good"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-orange-100 text-orange-800"
                        }`}
                      >
                        {listing.condition}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                      <div>
                        <span className="font-semibold">Year:</span> {listing.year}
                      </div>
                      <div>
                        <span className="font-semibold">KMs:</span> {listing.kms?.toLocaleString()}
                      </div>
                      <div>
                        <span className="font-semibold">Stock:</span> {listing.stockCount}
                      </div>
                      <div>
                        <span className="font-semibold">Dealer:</span> {listing.dealer?.name}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button className="flex-1 bg-blue-900 text-yellow-400 font-bold px-4 py-3 rounded-lg hover:bg-blue-700 transition-all duration-300 text-sm">
                      Book Test Ride
                    </button>
                    <button className="px-4 py-3 border-2 border-yellow-400 text-blue-900 rounded-lg hover:bg-yellow-50 transition-all duration-300">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                        />
                      </svg>
                    </button>
                  </div>
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
                  d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.29-1.009-5.824-2.562M15 6.306a7.962 7.962 0 00-6 0m6 0V5a2 2 0 00-2-2H9a2 2 0 00-2 2v1.306m8 0V7a2 2 0 012 2v6.414l-1.293-1.293a1 1 0 00-1.414 0L12 17.414l-2.293-2.293a1 1 0 00-1.414 0L7 16.414V9a2 2 0 012-2h8a2 2 0 012 2v.306z"
                />
              </svg>
              <h3 className="text-xl font-semibold text-gray-500 mb-2">No vehicles found</h3>
              <p className="text-gray-400">Try adjusting your filters to see more results</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default Listings
