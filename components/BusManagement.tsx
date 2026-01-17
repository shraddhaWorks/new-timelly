"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Bus, Plus, Users, Clock, Phone, MapPin, X, IndianRupee } from "lucide-react";

interface Route {
  id: string;
  location: string;
  amount: number;
}

interface BusRoute {
  id: string;
  location: string;
  amount: number;
}

interface BusData {
  id: string;
  busNumber: string;
  driverName: string;
  driverNumber: string;
  totalSeats: number;
  time: string;
  routes: BusRoute[];
  availableSeats: number[];
  bookedSeatsCount: number;
  availableSeatsCount: number;
  bookings: Array<{
    id: string;
    seatNumber: number;
    route?: { id: string; location: string; amount: number };
    student: {
      user: { name: string | null; email: string | null };
      class: { name: string; section: string | null } | null;
    };
  }>;
  createdAt: string;
}

interface Booking {
  id: string;
  seatNumber: number;
  amount: number;
  paymentStatus: string;
  createdAt: string;
  bus: {
    id: string;
    busNumber: string;
    driverName: string;
    driverNumber: string;
    time: string;
  };
  route?: {
    id: string;
    location: string;
    amount: number;
  };
  student: {
    user: { name: string | null; email: string | null };
    class: { name: string; section: string | null } | null;
  };
}

export default function BusManagement() {
  const [buses, setBuses] = useState<BusData[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"buses" | "create" | "bookings">("buses");
  const [creating, setCreating] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    busNumber: "",
    driverName: "",
    driverNumber: "",
    totalSeats: "",
    time: "",
  });

  const [routes, setRoutes] = useState<Array<{ location: string; amount: string }>>([
    { location: "", amount: "" },
  ]);

  useEffect(() => {
    fetchBuses();
    fetchBookings();
  }, []);

  const fetchBuses = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/bus/list");
      const data = await res.json();
      if (res.ok && data.buses) {
        setBuses(data.buses);
      } else {
        console.error("Error fetching buses:", data.message || "Unknown error");
        alert(data.message || "Failed to fetch buses");
      }
    } catch (err: any) {
      console.error("Error fetching buses:", err);
      alert(err?.message || "Failed to fetch buses. Please check console for details.");
    } finally {
      setLoading(false);
    }
  };

  const fetchBookings = async () => {
    try {
      const res = await fetch("/api/bus/bookings");
      const data = await res.json();
      if (res.ok && data.bookings) {
        setBookings(data.bookings);
      }
    } catch (err) {
      console.error("Error fetching bookings:", err);
    }
  };

  const handleCreateBus = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate routes
    const validRoutes = routes.filter(r => r.location.trim() && r.amount && parseFloat(r.amount) >= 0);
    if (validRoutes.length === 0) {
      alert("Please add at least one route with location and amount");
      return;
    }

    setCreating(true);
    try {
      const res = await fetch("/api/bus/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          routes: validRoutes.map(r => ({
            location: r.location.trim(),
            amount: parseFloat(r.amount),
          })),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Failed to create bus");
        return;
      }

      alert("Bus created successfully!");
      setFormData({
        busNumber: "",
        driverName: "",
        driverNumber: "",
        totalSeats: "",
        time: "",
      });
      setRoutes([{ location: "", amount: "" }]);
      setActiveTab("buses");
      fetchBuses();
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    } finally {
      setCreating(false);
    }
  };

  const addRoute = () => {
    setRoutes([...routes, { location: "", amount: "" }]);
  };

  const removeRoute = (index: number) => {
    if (routes.length > 1) {
      setRoutes(routes.filter((_, i) => i !== index));
    }
  };

  const updateRoute = (index: number, field: "location" | "amount", value: string) => {
    const updated = [...routes];
    updated[index][field] = value;
    setRoutes(updated);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full bg-black min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#808080]"></div>
          <p className="mt-4 text-white font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
        >
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-[#2d2d2d] to-[#404040] rounded-xl flex items-center justify-center border border-[#333333] shadow-lg">
                <Bus className="w-6 h-6 text-white" />
              </div>
              Bus Management
            </h1>
            <p className="text-[#808080] text-sm md:text-base">Manage buses, routes, and bookings</p>
          </div>
          <div className="flex gap-2 flex-wrap">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTab("buses")}
              className={`px-4 py-2.5 rounded-lg font-semibold transition-all duration-300 flex items-center gap-2 ${
                activeTab === "buses"
                  ? "bg-gradient-to-r from-[#404040] to-[#6b6b6b] text-white shadow-lg border border-[#808080]"
                  : "bg-[#2d2d2d] text-[#808080] hover:bg-[#404040] hover:text-white border border-[#333333]"
              }`}
            >
              <Bus size={18} />
              All Buses
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTab("create")}
              className={`px-4 py-2.5 rounded-lg font-semibold transition-all duration-300 flex items-center gap-2 ${
                activeTab === "create"
                  ? "bg-gradient-to-r from-[#404040] to-[#6b6b6b] text-white shadow-lg border border-[#808080]"
                  : "bg-[#2d2d2d] text-[#808080] hover:bg-[#404040] hover:text-white border border-[#333333]"
              }`}
            >
              <Plus size={18} />
              Create Bus
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveTab("bookings")}
              className={`px-4 py-2.5 rounded-lg font-semibold transition-all duration-300 flex items-center gap-2 ${
                activeTab === "bookings"
                  ? "bg-gradient-to-r from-[#404040] to-[#6b6b6b] text-white shadow-lg border border-[#808080]"
                  : "bg-[#2d2d2d] text-[#808080] hover:bg-[#404040] hover:text-white border border-[#333333]"
              }`}
            >
              <Users size={18} />
              All Bookings
            </motion.button>
          </div>
        </motion.div>

      {/* Create Bus Form */}
      {activeTab === "create" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden bg-gradient-to-br from-[#1a1a1a] via-[#2d2d2d] to-[#1a1a1a] rounded-2xl shadow-2xl p-6 md:p-8 border border-[#333333] hover:border-[#404040] transition-all duration-300"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-[#404040]/10 via-transparent to-[#404040]/10"></div>
          <div className="relative">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-6 flex items-center gap-3">
              <Plus className="w-7 h-7 text-[#808080]" />
              Create New Bus
            </h2>
            <form onSubmit={handleCreateBus} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#808080] mb-2 flex items-center gap-2">
                    <Bus size={16} />
                    Bus Number <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.busNumber}
                    onChange={(e) => setFormData({ ...formData, busNumber: e.target.value })}
                    className="w-full bg-[#2d2d2d] border border-[#404040] text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#808080] focus:border-transparent hover:border-[#808080] transition placeholder-[#6b6b6b]"
                    placeholder="e.g., MH-12-AB-1234"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#808080] mb-2 flex items-center gap-2">
                    <Users size={16} />
                    Driver Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.driverName}
                    onChange={(e) => setFormData({ ...formData, driverName: e.target.value })}
                    className="w-full bg-[#2d2d2d] border border-[#404040] text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#808080] focus:border-transparent hover:border-[#808080] transition placeholder-[#6b6b6b]"
                    placeholder="Driver full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#808080] mb-2 flex items-center gap-2">
                    <Phone size={16} />
                    Driver Number <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.driverNumber}
                    onChange={(e) => setFormData({ ...formData, driverNumber: e.target.value })}
                    className="w-full bg-[#2d2d2d] border border-[#404040] text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#808080] focus:border-transparent hover:border-[#808080] transition placeholder-[#6b6b6b]"
                    placeholder="e.g., +91 9876543210"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#808080] mb-2 flex items-center gap-2">
                    <Users size={16} />
                    Total Seats <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={formData.totalSeats}
                    onChange={(e) => setFormData({ ...formData, totalSeats: e.target.value })}
                    className="w-full bg-[#2d2d2d] border border-[#404040] text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#808080] focus:border-transparent hover:border-[#808080] transition placeholder-[#6b6b6b]"
                    placeholder="e.g., 40"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#808080] mb-2 flex items-center gap-2">
                    <Clock size={16} />
                    Time <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.time}
                    onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                    className="w-full bg-[#2d2d2d] border border-[#404040] text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#808080] focus:border-transparent hover:border-[#808080] transition placeholder-[#6b6b6b]"
                    placeholder="e.g., 08:00 AM"
                  />
                </div>
              </div>

              {/* Routes Section */}
              <div className="border-t border-[#333333] pt-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                    <MapPin size={20} />
                    Routes & Pricing
                  </h3>
                  <motion.button
                    type="button"
                    onClick={addRoute}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="flex items-center gap-2 px-4 py-2 bg-[#2d2d2d] hover:bg-[#404040] text-white rounded-lg transition text-sm font-medium border border-[#333333] hover:border-[#808080]"
                  >
                    <Plus size={16} />
                    Add Route
                  </motion.button>
                </div>
                <div className="space-y-3">
                  {routes.map((route, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex gap-3 items-start p-4 bg-[#2d2d2d]/50 border border-[#404040] rounded-lg hover:bg-[#404040]/50 transition"
                    >
                      <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-[#808080] mb-1 flex items-center gap-2">
                            <MapPin size={14} />
                            Location <span className="text-red-400">*</span>
                          </label>
                          <input
                            type="text"
                            required
                            value={route.location}
                            onChange={(e) => updateRoute(index, "location", e.target.value)}
                            className="w-full bg-[#1a1a1a] border border-[#404040] text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#808080] focus:border-transparent hover:border-[#808080] transition placeholder-[#6b6b6b]"
                            placeholder="e.g., Main Gate, City Center"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-[#808080] mb-1 flex items-center gap-2">
                            <IndianRupee size={14} />
                            Amount (₹) <span className="text-red-400">*</span>
                          </label>
                          <input
                            type="number"
                            required
                            min="0"
                            step="0.01"
                            value={route.amount}
                            onChange={(e) => updateRoute(index, "amount", e.target.value)}
                            className="w-full bg-[#1a1a1a] border border-[#404040] text-white rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#808080] focus:border-transparent hover:border-[#808080] transition placeholder-[#6b6b6b]"
                            placeholder="e.g., 500"
                          />
                        </div>
                      </div>
                      {routes.length > 1 && (
                        <motion.button
                          type="button"
                          onClick={() => removeRoute(index)}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="mt-6 p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition border border-red-500/30 hover:border-red-400"
                        >
                          <X size={20} />
                        </motion.button>
                      )}
                    </motion.div>
                  ))}
                </div>
                <p className="text-xs text-[#6b6b6b] mt-3">
                  Add multiple routes (locations) for this bus. Each route can have a different price.
                </p>
              </div>

              <div className="flex gap-4 pt-4">
                <motion.button
                  type="submit"
                  disabled={creating}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-gradient-to-r from-[#404040] to-[#6b6b6b] hover:from-[#6b6b6b] hover:to-[#404040] disabled:opacity-50 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center gap-2 border border-[#333333] hover:border-[#808080] shadow-lg disabled:cursor-not-allowed"
                >
                  {creating ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span>Creating...</span>
                    </>
                  ) : (
                    <>
                      <Plus size={18} />
                      <span>Create Bus</span>
                    </>
                  )}
                </motion.button>
                <motion.button
                  type="button"
                  onClick={() => {
                    setActiveTab("buses");
                    setFormData({
                      busNumber: "",
                      driverName: "",
                      driverNumber: "",
                      totalSeats: "",
                      time: "",
                    });
                    setRoutes([{ location: "", amount: "" }]);
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-[#2d2d2d] hover:bg-[#404040] text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 border border-[#333333] hover:border-[#808080]"
                >
                  Cancel
                </motion.button>
              </div>
            </form>
          </div>
        </motion.div>
      )}

      {/* All Buses */}
      {activeTab === "buses" && (
        <div className="space-y-4">
          {buses.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-[#1a1a1a] border border-[#333333] rounded-xl shadow-lg p-12 text-center"
            >
              <Bus size={48} className="mx-auto text-[#808080] mb-4 opacity-50" />
              <p className="text-[#808080] text-lg mb-4">No buses created yet</p>
              <motion.button
                onClick={() => setActiveTab("create")}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="mt-4 bg-gradient-to-r from-[#404040] to-[#6b6b6b] hover:from-[#6b6b6b] hover:to-[#404040] text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 flex items-center gap-2 border border-[#333333] hover:border-[#808080] shadow-lg mx-auto"
              >
                <Plus size={18} />
                Create First Bus
              </motion.button>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {buses.map((bus, index) => (
                <motion.div
                  key={bus.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -8, scale: 1.02 }}
                  className="relative overflow-hidden bg-gradient-to-br from-[#1a1a1a] to-[#2d2d2d] rounded-xl shadow-lg p-6 border border-[#333333] hover:border-[#404040] hover:shadow-xl transition-all duration-300"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#404040]/20 to-transparent rounded-bl-full"></div>
                  <div className="relative">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-[#404040] to-[#2d2d2d] p-3 rounded-lg border border-[#333333] shadow-lg">
                          <Bus className="text-white" size={24} />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-white">{bus.busNumber}</h3>
                          <p className="text-sm text-[#808080]">Driver: {bus.driverName}</p>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3 mb-4">
                      <div className="flex items-center gap-2 text-sm">
                        <Phone size={16} className="text-[#808080]" />
                        <span className="text-[#808080]">{bus.driverNumber}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Clock size={16} className="text-[#808080]" />
                        <span className="text-[#808080]">{bus.time}</span>
                      </div>
                    </div>

                    {/* Routes */}
                    <div className="mb-4 pb-4 border-b border-[#333333]">
                      <p className="text-sm font-medium text-[#808080] mb-3 flex items-center gap-2">
                        <MapPin size={14} />
                        Routes & Pricing:
                      </p>
                      <div className="space-y-2">
                        {bus.routes.map((route) => (
                          <motion.div
                            key={route.id}
                            whileHover={{ x: 4 }}
                            className="flex justify-between items-center p-3 bg-[#2d2d2d] border border-[#404040] rounded-lg hover:bg-[#404040] transition"
                          >
                            <div className="flex items-center gap-2">
                              <MapPin size={14} className="text-[#808080]" />
                              <span className="text-sm text-white">{route.location}</span>
                            </div>
                            <span className="text-sm font-semibold text-green-400 flex items-center gap-1">
                              <IndianRupee size={14} />
                              {route.amount}
                            </span>
                          </motion.div>
                        ))}
                      </div>
                    </div>

                    <div className="border-t border-[#333333] pt-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-[#808080]">Seats</span>
                        <span className="text-sm font-medium text-white">
                          {bus.bookedSeatsCount} / {bus.totalSeats} booked
                        </span>
                      </div>
                      <div className="w-full bg-[#2d2d2d] rounded-full h-2 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${(bus.bookedSeatsCount / bus.totalSeats) * 100}%` }}
                          transition={{ duration: 0.5 }}
                          className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full"
                        ></motion.div>
                      </div>
                      <p className="text-xs text-[#6b6b6b] mt-2">
                        {bus.availableSeatsCount} seats available
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* All Bookings */}
      {activeTab === "bookings" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#1a1a1a] border border-[#333333] rounded-xl shadow-lg p-6 hover:border-[#404040] transition"
        >
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <Users className="w-7 h-7 text-[#808080]" />
            All Student Bookings
          </h2>
          {bookings.length === 0 ? (
            <div className="text-center py-12">
              <Users size={48} className="mx-auto text-[#808080] mb-4 opacity-50" />
              <p className="text-[#808080] text-lg">No bookings yet</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#2d2d2d] border-b border-[#333333]">
                  <tr>
                    <th className="px-4 py-4 text-left text-sm font-medium text-white">
                      <div className="flex items-center gap-2">
                        <Users size={16} />
                        Student Name
                      </div>
                    </th>
                    <th className="px-4 py-4 text-left text-sm font-medium text-white">Class</th>
                    <th className="px-4 py-4 text-left text-sm font-medium text-white">
                      <div className="flex items-center gap-2">
                        <Bus size={16} />
                        Bus Number
                      </div>
                    </th>
                    <th className="px-4 py-4 text-left text-sm font-medium text-white">Seat</th>
                    <th className="px-4 py-4 text-left text-sm font-medium text-white">
                      <div className="flex items-center gap-2">
                        <MapPin size={16} />
                        Location
                      </div>
                    </th>
                    <th className="px-4 py-4 text-left text-sm font-medium text-white">
                      <div className="flex items-center gap-2">
                        <IndianRupee size={16} />
                        Amount
                      </div>
                    </th>
                    <th className="px-4 py-4 text-left text-sm font-medium text-white">Payment</th>
                    <th className="px-4 py-4 text-left text-sm font-medium text-white">
                      <div className="flex items-center gap-2">
                        <Clock size={16} />
                        Booked On
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#333333]">
                  {bookings.map((booking, index) => (
                    <motion.tr
                      key={booking.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-[#2d2d2d] transition"
                    >
                      <td className="px-4 py-4 font-medium text-white">
                        {booking.student.user.name || "N/A"}
                      </td>
                      <td className="px-4 py-4 text-[#808080]">
                        {booking.student.class
                          ? `${booking.student.class.name}${booking.student.class.section ? ` - ${booking.student.class.section}` : ""}`
                          : "N/A"}
                      </td>
                      <td className="px-4 py-4 font-medium text-white">
                        {booking.bus.busNumber}
                      </td>
                      <td className="px-4 py-4">
                        <span className="inline-flex items-center px-3 py-1 bg-green-500/20 text-green-400 border border-green-500/30 rounded-full text-sm font-medium">
                          Seat {booking.seatNumber}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-[#808080]">{booking.route?.location || "N/A"}</td>
                      <td className="px-4 py-4 font-semibold text-green-400 flex items-center gap-1">
                        <IndianRupee size={16} />
                        {booking.amount}
                      </td>
                      <td className="px-4 py-4">
                        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold border ${
                          booking.paymentStatus === "PAID" 
                            ? "bg-green-500/20 text-green-400 border-green-500/30" 
                            : booking.paymentStatus === "FAILED"
                            ? "bg-red-500/20 text-red-400 border-red-500/30"
                            : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                        }`}>
                          {booking.paymentStatus}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm text-[#808080]">
                        {new Date(booking.createdAt).toLocaleDateString()}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      )}
      </div>
    </div>
  );
}