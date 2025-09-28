import { Link } from "react-router-dom"

const Home = () => (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-yellow-50">
    {/* Hero Section */}
    <div className="relative overflow-hidden bg-gradient-to-r from-blue-900 to-blue-700 text-white">
      <div className="absolute inset-0 bg-black opacity-10"></div>
      <div className="relative max-w-7xl mx-auto px-4 py-20">
        <div className="text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 text-balance">
            Find Your Perfect
            <span className="text-yellow-400 block">Two Wheeler</span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto text-pretty">
            Discover the largest marketplace for motorcycles and scooters. Buy, sell, and explore with confidence.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/listings"
              className="bg-yellow-400 text-blue-900 font-bold px-8 py-4 rounded-lg text-lg hover:bg-yellow-300 transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              Browse Vehicles
            </Link>
            <Link
              to="/register"
              className="bg-transparent border-2 border-yellow-400 text-yellow-400 font-bold px-8 py-4 rounded-lg text-lg hover:bg-yellow-400 hover:text-blue-900 transition-all duration-300"
            >
              Start Selling
            </Link>
          </div>
        </div>
      </div>
    </div>

    {/* Features Section */}
    <div className="py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-blue-900 mb-4">Why Choose Vahan Bazar?</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Your trusted partner in finding the perfect two-wheeler with unmatched service and reliability.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-xl shadow-lg p-8 text-center border-t-4 border-yellow-400 hover:shadow-xl transition-shadow duration-300">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-blue-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-blue-900 mb-4">Verified Listings</h3>
            <p className="text-gray-600">
              All vehicles are thoroughly verified by our expert team to ensure quality and authenticity.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8 text-center border-t-4 border-yellow-400 hover:shadow-xl transition-shadow duration-300">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-blue-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-blue-900 mb-4">Best Prices</h3>
            <p className="text-gray-600">
              Get competitive prices with our transparent pricing system and no hidden charges.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg p-8 text-center border-t-4 border-yellow-400 hover:shadow-xl transition-shadow duration-300">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-blue-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.25a9.75 9.75 0 100 19.5 9.75 9.75 0 000-19.5z"
                />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-blue-900 mb-4">24/7 Support</h3>
            <p className="text-gray-600">
              Round-the-clock customer support to help you with any queries or assistance needed.
            </p>
          </div>
        </div>
      </div>
    </div>

    {/* Popular Categories */}
    <div className="bg-gray-50 py-20 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-blue-900 mb-4">Popular Categories</h2>
          <p className="text-xl text-gray-600">Explore our wide range of two-wheelers</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Link to="/listings?category=motorcycle" className="group">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform group-hover:scale-105">
              <div className="h-48 bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center">
                <svg className="w-20 h-20 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L13.09 8.26L22 9L13.09 9.74L12 16L10.91 9.74L2 9L10.91 8.26L12 2Z" />
                </svg>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-blue-900 mb-2">Motorcycles</h3>
                <p className="text-gray-600">High-performance bikes for every rider</p>
              </div>
            </div>
          </Link>

          <Link to="/listings?category=scooter" className="group">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform group-hover:scale-105">
              <div className="h-48 bg-gradient-to-br from-yellow-400 to-yellow-600 flex items-center justify-center">
                <svg className="w-20 h-20 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L13.09 8.26L22 9L13.09 9.74L12 16L10.91 9.74L2 9L10.91 8.26L12 2Z" />
                </svg>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-blue-900 mb-2">Scooters</h3>
                <p className="text-gray-600">Convenient and fuel-efficient rides</p>
              </div>
            </div>
          </Link>

          <Link to="/listings?category=electric" className="group">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform group-hover:scale-105">
              <div className="h-48 bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center">
                <svg className="w-20 h-20 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L13.09 8.26L22 9L13.09 9.74L12 16L10.91 9.74L2 9L10.91 8.26L12 2Z" />
                </svg>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-blue-900 mb-2">Electric</h3>
                <p className="text-gray-600">Eco-friendly and modern vehicles</p>
              </div>
            </div>
          </Link>

          <Link to="/listings?category=vintage" className="group">
            <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform group-hover:scale-105">
              <div className="h-48 bg-gradient-to-br from-purple-500 to-purple-700 flex items-center justify-center">
                <svg className="w-20 h-20 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L13.09 8.26L22 9L13.09 9.74L12 16L10.91 9.74L2 9L10.91 8.26L12 2Z" />
                </svg>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-blue-900 mb-2">Vintage</h3>
                <p className="text-gray-600">Classic and collectible motorcycles</p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>

    {/* CTA Section */}
    <div className="bg-gradient-to-r from-blue-900 to-blue-700 text-white py-20 px-4">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-4xl font-bold mb-6">Ready to Find Your Dream Ride?</h2>
        <p className="text-xl mb-8 text-blue-100">
          Join thousands of satisfied customers who found their perfect two-wheeler with us.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link
            to="/listings"
            className="bg-yellow-400 text-blue-900 font-bold px-8 py-4 rounded-lg text-lg hover:bg-yellow-300 transition-all duration-300 transform hover:scale-105"
          >
            Start Shopping
          </Link>
          <Link
            to="/register"
            className="bg-transparent border-2 border-yellow-400 text-yellow-400 font-bold px-8 py-4 rounded-lg text-lg hover:bg-yellow-400 hover:text-blue-900 transition-all duration-300"
          >
            Become a Dealer
          </Link>
        </div>
      </div>
    </div>
  </div>
)

export default Home
