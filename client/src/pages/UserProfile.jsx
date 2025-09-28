import { useEffect, useState, useContext } from "react"
import axios from "axios"
import { AuthContext } from "../contexts/AuthContext"
import { Link } from "react-router-dom"

const UserProfile = () => {
  const { user } = useContext(AuthContext)
  const [profile, setProfile] = useState(null)
  const [listings, setListings] = useState([])
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  const tokenHeader = () => {
    const token = localStorage.getItem("token")
    return token ? { Authorization: `Bearer ${token}` } : {}
  }

  const fetchData = async () => {
    setLoading(true)
    setError("")
    try {
      // always fetch authenticated user profile
      const pRes = await axios.get("http://localhost:5000/api/user/me", { headers: tokenHeader() })
      const pData = pRes.data?.user ?? pRes.data
      setProfile(pData ?? null)

      // if dealer -> fetch dealer's own listings (dealer endpoint)
      if (pData?.role === "dealer") {
        const lRes = await axios.get("http://localhost:5000/api/dealer/dealerListings", { headers: tokenHeader() })
        const lData = lRes.data?.listings ?? lRes.data
        setListings(Array.isArray(lData) ? lData : [])
        setBookings([]) // not applicable for dealer view here (bookings fetched separately if needed)
      } else {
        // for normal users fetch bookings (filter on client if endpoint returns global bookings)
        const bRes = await axios.get("http://localhost:5000/api/bookings", { headers: tokenHeader() })
        const bData = bRes.data?.bookings ?? bRes.data
        const arr = Array.isArray(bData) ? bData : []
        // filter bookings that belong to this user
        const myBookings = arr.filter((b) => {
          if (!b.user && !b.userId) return false
          return String(b.user?.id ?? b.userId) === String(pData?.id ?? user?.id)
        })
        setBookings(myBookings)
        setListings([])
      }
    } catch (err) {
      console.error("Failed to load profile or related data", err)
      setError(err.response?.data?.error || err.message || "Failed to load data")
      setProfile(null)
      setListings([])
      setBookings([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!user) return
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user])

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-yellow-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Access Denied</h2>
            <p className="text-gray-600 mb-6">You must be logged in to view your profile.</p>
            <Link to="/login" className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-yellow-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading your profile...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-yellow-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full mx-4">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Error</h2>
            <p className="text-red-600 mb-6">{error}</p>
            <button onClick={fetchData} className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors">
              Try Again
            </button>
          </div>
        </div>
      </div>
    )
  }

  // compute dealer earnings only when profile is dealer and listings present
  const totalEarnings = profile?.role === "dealer"
    ? listings.reduce((sum, l) => {
        const price = Number(l.price) || 0
        const soldCount = l.soldCount ?? (Array.isArray(l.bookings) ? l.bookings.length : 0)
        return sum + price * soldCount
      }, 0)
    : 0

  const address = profile?.address || profile?.location?.address || profile?.dealerProfile?.address || "Not provided"

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-yellow-50">
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="flex items-center gap-6">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold">{profile?.name ?? user.name ?? user.email}</h1>
                <p className="text-blue-100 text-lg">{profile?.email ?? user.email}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="px-3 py-1 bg-yellow-400 text-blue-900 rounded-full text-sm font-semibold">
                    {profile?.role ?? user.role}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              {profile?.role === "dealer" ? (
                <>
                  <Link to="/dealer/profile" className="inline-flex items-center px-6 py-3 bg-yellow-400 text-blue-900 font-semibold rounded-xl hover:bg-yellow-300 transition-colors">Edit Profile</Link>
                  <Link to="/dealer/listings" className="inline-flex items-center px-6 py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-colors">Manage Listings</Link>
                </>
              ) : (
                <Link to="/bookings" className="inline-flex items-center px-6 py-3 bg-yellow-400 text-blue-900 font-semibold rounded-xl hover:bg-yellow-300 transition-colors">My Bookings</Link>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Total Listings</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{listings.length}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Total Earnings</p>
                <p className="text-3xl font-bold text-green-600 mt-2">₹ {Number(totalEarnings).toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">Member Since</p>
                <p className="text-lg font-semibold text-gray-900 mt-2">
                  {(profile?.createdAt ?? user?.createdAt) ? new Date(profile?.createdAt ?? user?.createdAt).toLocaleDateString() : "—"}
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 0h6m-6 0l-2 9a2 2 0 002 2h8a2 2 0 002-2l-2-9m-6 0V7" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900">Business Address</h3>
          </div>
          <p className="text-gray-700 text-lg">{address}</p>
        </div>

        {profile?.role === "dealer" ? (
          <div>
            <h3 className="text-xl font-semibold mb-4">My Listings</h3>
            {listings.length === 0 ? (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">No listings yet.</div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {listings.map((l) => {
                  const imageUrl = l.images && l.images.length > 0 ? l.images[0].url : ""
                  const model = l.model ?? {}
                  const soldCount = l.soldCount ?? (Array.isArray(l.bookings) ? l.bookings.length : 0)
                  return (
                    <div key={l.id} className="border rounded p-4 flex gap-4">
                      <div className="w-24 h-20 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
                        {imageUrl ? <img src={imageUrl} alt="Vehicle" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-gray-400">No Image</div>}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{model.brand ? `${model.brand} ${model.modelName || ""}` : l.title || "Untitled"}</h4>
                        <p className="text-lg font-bold text-blue-600 mt-1">{l.price ? `₹ ${Number(l.price).toLocaleString()}` : "Price not set"}</p>
                        <div className="flex gap-2 mt-4">
                          <Link to={`/dealer/listings/${l.id}/edit`} className="px-3 py-2 bg-yellow-400 text-blue-900 rounded-lg text-sm font-semibold">Edit</Link>
                          <Link to={`/dealer/listings/${l.id}`} className="px-3 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold">View Details</Link>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        ) : (
          <div>
            <h3 className="text-xl font-semibold mb-4">My Bookings</h3>
            {bookings.length === 0 ? (
              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded">You have no bookings.</div>
            ) : (
              <div className="space-y-4">
                {bookings.map(b => (
                  <div key={b.id} className="border rounded p-4">
                    <div className="font-semibold">{b.listing?.title ?? (b.listing?.model ? `${b.listing.model.brand} ${b.listing.model.modelName}` : 'Listing')}</div>
                    <div className="text-sm text-gray-600">Appointment: {b.appointmentTs ? new Date(b.appointmentTs).toLocaleString() : '—'}</div>
                    <div className="text-sm text-gray-600">Status: {b.status ?? 'pending'}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default UserProfile
