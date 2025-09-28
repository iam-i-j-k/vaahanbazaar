"use client"

import { useEffect, useState, useContext } from "react"
import axios from "axios"
import { AuthContext } from "../contexts/AuthContext"
import { Link } from "react-router-dom"

const DealerBookings = () => {
  const { user } = useContext(AuthContext)
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [filter, setFilter] = useState("all")

  const tokenHeader = () => {
    const token = localStorage.getItem("token")
    return token ? { Authorization: `Bearer ${token}` } : {}
  }

  const fetchBookings = async () => {
    setLoading(true)
    setError("")
    try {
      const token = localStorage.getItem("token")
      if (!token) {
        setError("Not authenticated")
        setBookings([])
        setLoading(false)
        return
      }

      // Try dealer-scoped endpoint first; fallback to generic bookings endpoint
      let res
      try {
        res = await axios.get("http://localhost:5000/api/dealer/bookings", { headers: tokenHeader() })
      } catch (err) {
        // fallback
        console.log(err)
      }

      const data = res.data?.bookings ?? res.data
      // Filter to bookings owned by this dealer if API returned global bookings
      const arr = Array.isArray(data) ? data : []
      const myBookings = arr.filter((b) => {
        if (!b.dealer && !b.listing) return false
        // prefer explicit dealer id on booking
        if (b.dealer && b.dealer.id)
          return String(b.dealer.id) === String(user.id) || String(b.dealer.id) === String(b.dealerId)
        // fallback: listing.dealerId
        if (b.listing && (b.listing.dealerId || (b.listing.dealer && b.listing.dealer.id))) {
          const dealerId = b.listing.dealerId ?? b.listing.dealer?.id
          return String(dealerId) === String(user.id)
        }
        return false
      })

      setBookings(myBookings)
    } catch (err) {
      console.error("Failed to fetch dealer bookings", err)
      setError(err.response?.data?.error || err.message || "Failed to fetch bookings")
      setBookings([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!user) return
    fetchBookings()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  const updateStatus = async (bookingId, status) => {
    try {
      await axios.put(`http://localhost:5000/api/bookings/${bookingId}`, { status }, { headers: tokenHeader() })
      setBookings((prev) => prev.map((b) => (b.id === bookingId ? { ...b, status } : b)))
    } catch (err) {
      console.error("Failed to update booking status", err)
      setError(err.response?.data?.error || err.message || "Failed to update booking")
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "confirmed":
        return "bg-green-100 text-green-800 border-green-200"
      case "completed":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "cancelled":
        return "bg-red-100 text-red-800 border-red-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const filteredBookings = bookings.filter((booking) => {
    if (filter === "all") return true
    return booking.status === filter
  })

  const getStatusCounts = () => {
    return {
      all: bookings.length,
      pending: bookings.filter((b) => b.status === "pending").length,
      confirmed: bookings.filter((b) => b.status === "confirmed").length,
      completed: bookings.filter((b) => b.status === "completed").length,
      cancelled: bookings.filter((b) => b.status === "cancelled").length,
    }
  }

  const statusCounts = getStatusCounts()

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-xl shadow-lg p-8 max-w-md w-full text-center border-t-4 border-red-400">
          <svg className="w-16 h-16 text-red-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
            />
          </svg>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-6">You must be logged in as a dealer to view bookings.</p>
          <Link
            to="/login"
            className="bg-blue-900 text-yellow-400 font-bold px-6 py-3 rounded-lg hover:bg-blue-700 transition-all duration-300"
          >
            Login as Dealer
          </Link>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-900 mx-auto mb-4"></div>
          <p className="text-xl text-gray-600">Loading bookings...</p>
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
                    d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
                Test Ride Bookings
              </h1>
              <p className="text-blue-100 text-lg">Manage customer test ride appointments for your vehicles</p>
            </div>
            <div className="flex gap-3 mt-4 md:mt-0">
              <button
                onClick={fetchBookings}
                className="bg-white text-blue-900 font-semibold px-4 py-2 rounded-lg hover:bg-gray-100 transition-all duration-300 flex items-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
                Refresh
              </button>
              <Link
                to="/dealer/listings"
                className="bg-yellow-400 text-blue-900 font-bold px-4 py-2 rounded-lg hover:bg-yellow-300 transition-all duration-300 flex items-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  />
                </svg>
                My Listings
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              {error}
            </div>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          {[
            { key: "all", label: "Total", color: "bg-blue-500", count: statusCounts.all },
            { key: "pending", label: "Pending", color: "bg-yellow-500", count: statusCounts.pending },
            { key: "confirmed", label: "Confirmed", color: "bg-green-500", count: statusCounts.confirmed },
            { key: "completed", label: "Completed", color: "bg-blue-600", count: statusCounts.completed },
            { key: "cancelled", label: "Cancelled", color: "bg-red-500", count: statusCounts.cancelled },
          ].map((stat) => (
            <button
              key={stat.key}
              onClick={() => setFilter(stat.key)}
              className={`bg-white rounded-xl shadow-lg p-4 text-center transition-all duration-300 hover:shadow-xl transform hover:scale-105 ${
                filter === stat.key ? "ring-2 ring-blue-500" : ""
              }`}
            >
              <div className={`w-12 h-12 ${stat.color} rounded-full flex items-center justify-center mx-auto mb-2`}>
                <span className="text-white font-bold text-lg">{stat.count}</span>
              </div>
              <p className="text-sm font-semibold text-gray-700">{stat.label}</p>
            </button>
          ))}
        </div>

        {/* Bookings List */}
        <div className="bg-white rounded-xl shadow-lg border-t-4 border-blue-900">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">
                  {filter === "all" ? "All Bookings" : `${filter.charAt(0).toUpperCase() + filter.slice(1)} Bookings`}
                </h2>
                <p className="text-gray-600 mt-1">Manage customer test ride appointments</p>
              </div>
              <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                {filteredBookings.length} {filteredBookings.length === 1 ? "booking" : "bookings"}
              </span>
            </div>
          </div>

          <div className="p-6">
            {filteredBookings.length === 0 ? (
              <div className="text-center py-16">
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
                    d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
                <h3 className="text-xl font-semibold text-gray-500 mb-2">
                  {filter === "all" ? "No bookings found" : `No ${filter} bookings`}
                </h3>
                <p className="text-gray-400 mb-6">
                  {filter === "all"
                    ? "Customer bookings will appear here when they schedule test rides"
                    : `No bookings with ${filter} status found`}
                </p>
                <Link
                  to="/dealer/listings"
                  className="bg-blue-900 text-yellow-400 font-bold px-6 py-3 rounded-lg hover:bg-blue-700 transition-all duration-300 inline-flex items-center"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                    />
                  </svg>
                  View My Listings
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                {filteredBookings.map((b) => {
                  const listing = b.listing ?? b.listingId ?? {}
                  const buyer = b.user ?? b.buyer ?? {}
                  const appointment = b.appointmentTs
                    ? new Date(b.appointmentTs).toLocaleString()
                    : b.createdAt
                      ? new Date(b.createdAt).toLocaleString()
                      : "—"
                  return (
                    <div
                      key={b.id}
                      className="bg-gray-50 rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-all duration-300"
                    >
                      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-3">
                            <h3 className="text-xl font-bold text-blue-900">
                              {listing.title ??
                                (listing.model
                                  ? `${listing.model.brand} ${listing.model.modelName}`
                                  : "Untitled listing")}
                            </h3>
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(
                                b.status ?? "pending",
                              )}`}
                            >
                              {(b.status ?? "pending").toUpperCase()}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div className="flex items-center text-gray-600">
                              <svg
                                className="w-4 h-4 mr-2 text-blue-500"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0h6m-6 0l-2 2m8-2l2 2m-2-2v10a2 2 0 01-2 2H8a2 2 0 01-2-2V9"
                                />
                              </svg>
                              <div>
                                <span className="font-semibold">Appointment:</span>
                                <p className="text-gray-800">{appointment}</p>
                              </div>
                            </div>

                            <div className="flex items-center text-gray-600">
                              <svg
                                className="w-4 h-4 mr-2 text-green-500"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                                />
                              </svg>
                              <div>
                                <span className="font-semibold">Customer:</span>
                                <p className="text-gray-800">{buyer.name ?? buyer.email ?? "—"}</p>
                              </div>
                            </div>

                            <div className="flex items-center text-gray-600">
                              <svg
                                className="w-4 h-4 mr-2 text-purple-500"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                                />
                              </svg>
                              <div>
                                <span className="font-semibold">Contact:</span>
                                {buyer.email ? (
                                  <a href={`mailto:${buyer.email}`} className="text-blue-600 hover:text-blue-800">
                                    {buyer.email}
                                  </a>
                                ) : (
                                  <p className="text-gray-800">—</p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          {b.status !== "confirmed" && (
                            <button
                              onClick={() => updateStatus(b.id, "confirmed")}
                              className="bg-green-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center"
                            >
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              Confirm
                            </button>
                          )}
                          {b.status !== "completed" && (
                            <button
                              onClick={() => updateStatus(b.id, "completed")}
                              className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors flex items-center"
                            >
                              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                                />
                              </svg>
                              Complete
                            </button>
                          )}
                          <Link
                            to={`/dealer/listings/${listing.id}`}
                            className="bg-yellow-400 text-blue-900 px-4 py-2 rounded-lg font-semibold hover:bg-yellow-300 transition-colors flex items-center"
                          >
                            <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                              />
                            </svg>
                            View Listing
                          </Link>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default DealerBookings
