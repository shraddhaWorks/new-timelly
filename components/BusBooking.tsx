"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSession } from "next-auth/react";
import { Bus, MapPin, Clock, Phone, Users, CheckCircle, IndianRupee, AlertCircle, TrendingUp } from "lucide-react";

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
    };
  }>;
}

interface MyBooking {
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
}

export default function BusBooking() {
  const { data: session, status } = useSession();
  const [buses, setBuses] = useState<BusData[]>([]);
  const [myBooking, setMyBooking] = useState<MyBooking | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedBus, setSelectedBus] = useState<string | null>(null);
  const [selectedRoute, setSelectedRoute] = useState<string | null>(null);
  const [selectedSeat, setSelectedSeat] = useState<number | null>(null);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    
    if (!(window as any).Razorpay) {
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      script.onload = () => setRazorpayLoaded(true);
      script.onerror = () => {
        console.error("Failed to load Razorpay script");
      };
      document.body.appendChild(script);
    } else {
      setRazorpayLoaded(true);
    }
  }, [mounted]);

  useEffect(() => {
    if (!mounted) return;
    
    if (status === "authenticated" && session?.user?.role === "STUDENT") {
      fetchBuses();
      fetchMyBooking();
    } else if (status === "unauthenticated") {
      setLoading(false);
    }
  }, [session, status, mounted]);

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

  const fetchMyBooking = async () => {
    if (!session?.user?.studentId || !mounted) return;
    
    try {
      const res = await fetch("/api/bus/list");
      const data = await res.json();
      if (res.ok && data.buses) {
        for (const bus of data.buses) {
          if (bus.bookings && Array.isArray(bus.bookings)) {
            const myBook = bus.bookings.find(
              (b: any) => b.student?.id === session.user.studentId
            );
            if (myBook) {
              setMyBooking({
                id: myBook.id,
                seatNumber: myBook.seatNumber,
                amount: myBook.amount || 0,
                paymentStatus: myBook.paymentStatus || "PENDING",
                createdAt: myBook.createdAt || "",
                bus: {
                  id: bus.id,
                  busNumber: bus.busNumber,
                  driverName: bus.driverName,
                  driverNumber: bus.driverNumber,
                  time: bus.time,
                },
                route: myBook.route,
              });
              break;
            }
          }
        }
      }
    } catch (err) {
      console.error("Error fetching my booking:", err);
    }
  };

  const handleBookSeat = async () => {
    if (!selectedBus || !selectedSeat || !selectedRoute) {
      alert("Please select a bus, route, and seat");
      return;
    }

    if (!razorpayLoaded) {
      alert("Payment gateway is loading. Please wait a moment and try again.");
      return;
    }

    const selectedBusData = buses.find((b) => b.id === selectedBus);
    const selectedRouteData = selectedBusData?.routes.find((r) => r.id === selectedRoute);

    if (!selectedRouteData) {
      alert("Selected route not found");
      return;
    }

    setBookingLoading(true);
    try {
      const res = await fetch("/api/bus/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          busId: selectedBus,
          routeId: selectedRoute,
          seatNumber: selectedSeat,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Failed to create booking");
        return;
      }

      const { booking, razorpayOrder } = data;

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID!,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        order_id: razorpayOrder.id,
        name: "Bus Booking",
        description: `Bus ${selectedBusData?.busNumber} - Seat ${selectedSeat} - ${selectedRouteData.location}`,
        handler: async (response: any) => {
          try {
            const verifyRes = await fetch("/api/bus/booking/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                bookingId: booking.id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            const verifyData = await verifyRes.json();

            if (!verifyRes.ok) {
              alert(verifyData.message || "Payment verification failed");
              return;
            }

            alert("Payment successful! Your booking is confirmed.");
            setSelectedBus(null);
            setSelectedRoute(null);
            setSelectedSeat(null);
            fetchBuses();
            fetchMyBooking();
          } catch (err) {
            console.error("Payment verification error:", err);
            alert("Payment verification failed. Please contact support.");
          }
        },
        prefill: {
          name: session?.user?.name || "",
          email: session?.user?.email || "",
        },
        theme: {
          color: "#404040",
        },
        modal: {
          ondismiss: () => {
            console.log("Payment cancelled");
          },
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    } finally {
      setBookingLoading(false);
    }
  };

  if (!mounted) {
    return null;
  }

  if (loading || status === "loading") {
    return (
      <div className="flex items-center justify-center h-full bg-black min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#808080]"></div>
          <p className="mt-4 text-white font-medium">Loading buses...</p>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated" || session?.user?.role !== "STUDENT") {
    return (
      <div className="flex items-center justify-center h-full bg-black min-h-screen">
        <p className="text-red-400 text-lg font-medium">Access Denied: Only students can book buses.</p>
      </div>
    );
  }

  const selectedBusData = buses.find((b) => b.id === selectedBus);
  const selectedRouteData = selectedBusData?.routes.find((r) => r.id === selectedRoute);

  return (
    <div className="min-h-screen bg-black p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6"
        >
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-[#2d2d2d] to-[#404040] rounded-xl flex items-center justify-center border border-[#333333] shadow-lg">
              <Bus className="w-6 h-6 text-white" />
            </div>
            Bus Booking
          </h1>
          <p className="text-[#808080] text-sm md:text-base">Book your seat and pay securely</p>
        </motion.div>

        {/* My Booking */}
        <AnimatePresence>
          {myBooking && myBooking.paymentStatus === "PAID" && (
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative overflow-hidden bg-gradient-to-br from-[#1a1a1a] via-[#2d2d2d] to-[#1a1a1a] rounded-2xl shadow-2xl p-6 md:p-8 border border-[#333333] hover:border-[#404040] transition-all duration-300"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[#404040]/10 via-transparent to-[#404040]/10"></div>
              <div className="relative">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-xl flex items-center justify-center border border-green-500/30 shadow-lg">
                    <CheckCircle className="text-green-400" size={32} />
                  </div>
                  <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-white">My Booking</h2>
                    <p className="text-[#808080] text-sm">Confirmed and paid</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <div className="bg-[#2d2d2d]/50 border border-[#404040] rounded-lg p-4 hover:bg-[#404040]/50 transition">
                    <p className="text-sm text-[#808080] mb-1 flex items-center gap-2">
                      <Bus size={14} />
                      Bus Number
                    </p>
                    <p className="text-lg font-bold text-white">{myBooking.bus.busNumber}</p>
                  </div>
                  <div className="bg-[#2d2d2d]/50 border border-[#404040] rounded-lg p-4 hover:bg-[#404040]/50 transition">
                    <p className="text-sm text-[#808080] mb-1 flex items-center gap-2">
                      <Users size={14} />
                      Seat Number
                    </p>
                    <p className="text-lg font-bold text-white">Seat {myBooking.seatNumber}</p>
                  </div>
                  <div className="bg-[#2d2d2d]/50 border border-[#404040] rounded-lg p-4 hover:bg-[#404040]/50 transition">
                    <p className="text-sm text-[#808080] mb-1 flex items-center gap-2">
                      <MapPin size={14} />
                      Location
                    </p>
                    <p className="text-lg font-medium text-white">{myBooking.route?.location || "N/A"}</p>
                  </div>
                  <div className="bg-[#2d2d2d]/50 border border-[#404040] rounded-lg p-4 hover:bg-[#404040]/50 transition">
                    <p className="text-sm text-[#808080] mb-1 flex items-center gap-2">
                      <IndianRupee size={14} />
                      Amount Paid
                    </p>
                    <p className="text-lg font-bold text-green-400">₹{myBooking.amount}</p>
                  </div>
                  <div className="bg-[#2d2d2d]/50 border border-[#404040] rounded-lg p-4 hover:bg-[#404040]/50 transition">
                    <p className="text-sm text-[#808080] mb-1 flex items-center gap-2">
                      <Clock size={14} />
                      Time
                    </p>
                    <p className="text-lg font-medium text-white">{myBooking.bus.time}</p>
                  </div>
                  <div className="bg-[#2d2d2d]/50 border border-[#404040] rounded-lg p-4 hover:bg-[#404040]/50 transition">
                    <p className="text-sm text-[#808080] mb-1 flex items-center gap-2">
                      <Phone size={14} />
                      Driver
                    </p>
                    <p className="text-lg font-medium text-white">{myBooking.bus.driverName}</p>
                  </div>
                </div>
                {myBooking.createdAt && (
                  <p className="text-sm text-[#6b6b6b] mt-6 flex items-center gap-2">
                    <Clock size={14} />
                    Booked on: {mounted ? new Date(myBooking.createdAt).toLocaleDateString() : myBooking.createdAt}
                  </p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Available Buses */}
        <div>
          <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
            <TrendingUp className="w-6 h-6 text-[#808080]" />
            {myBooking && myBooking.paymentStatus === "PAID" ? "Other Available Buses" : "Available Buses"}
          </h2>
          {buses.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-[#1a1a1a] border border-[#333333] rounded-2xl shadow-lg p-12 text-center"
            >
              <Bus size={48} className="mx-auto text-[#808080] mb-4 opacity-50" />
              <p className="text-[#808080] text-lg">No buses available</p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {buses.map((bus, index) => {
                const isMyBus = myBooking?.bus.id === bus.id && myBooking?.paymentStatus === "PAID";
                const hasBooking = myBooking && myBooking.paymentStatus === "PAID";

                return (
                  <motion.div
                    key={bus.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ y: -8, scale: 1.02 }}
                    className={`relative overflow-hidden bg-gradient-to-br from-[#1a1a1a] to-[#2d2d2d] rounded-xl shadow-lg p-6 border-2 transition-all duration-300 ${
                      selectedBus === bus.id
                        ? "border-[#808080] shadow-2xl ring-2 ring-[#808080]/20"
                        : "border-[#333333] hover:border-[#404040] hover:shadow-xl"
                    } ${hasBooking && !isMyBus ? "opacity-50" : ""}`}
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
                          {bus.routes && bus.routes.length > 0 ? bus.routes.map((route) => (
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
                          )) : (
                            <p className="text-xs text-[#6b6b6b]">No routes configured</p>
                          )}
                        </div>
                      </div>

                      <div className="border-t border-[#333333] pt-4 mb-4">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-[#808080]">Available Seats</span>
                          <span className="text-sm font-medium text-white">
                            {bus.availableSeatsCount} / {bus.totalSeats}
                          </span>
                        </div>
                        <div className="w-full bg-[#2d2d2d] rounded-full h-2 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${(bus.availableSeatsCount / bus.totalSeats) * 100}%` }}
                            transition={{ duration: 0.5 }}
                            className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full"
                          ></motion.div>
                        </div>
                      </div>

                      {!hasBooking && bus.availableSeatsCount > 0 && (
                        <motion.button
                          onClick={() => setSelectedBus(bus.id)}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className={`w-full py-3 rounded-lg font-semibold transition-all duration-300 ${
                            selectedBus === bus.id
                              ? "bg-gradient-to-r from-[#404040] to-[#6b6b6b] text-white shadow-lg border border-[#808080]"
                              : "bg-gradient-to-r from-[#404040] to-[#2d2d2d] hover:from-[#6b6b6b] hover:to-[#404040] text-white border border-[#333333] hover:border-[#808080]"
                          }`}
                        >
                          {selectedBus === bus.id ? "✓ Selected" : "Select This Bus"}
                        </motion.button>
                      )}

                      {hasBooking && !isMyBus && (
                        <p className="text-sm text-center text-[#808080] py-2">
                          You already have a booking
                        </p>
                      )}

                      {isMyBus && (
                        <p className="text-sm text-center text-green-400 font-medium py-2 flex items-center justify-center gap-2">
                          <CheckCircle size={16} />
                          This is your booked bus
                        </p>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* Route and Seat Selection */}
        <AnimatePresence>
          {selectedBusData && (!myBooking || myBooking.paymentStatus !== "PAID") && selectedBusData.availableSeatsCount > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="relative overflow-hidden bg-gradient-to-br from-[#1a1a1a] via-[#2d2d2d] to-[#1a1a1a] rounded-2xl shadow-2xl p-6 md:p-8 border border-[#333333] space-y-6 hover:border-[#404040] transition-all duration-300"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[#404040]/10 via-transparent to-[#404040]/10"></div>
              <div className="relative">
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-2 flex items-center gap-3">
                  <Bus className="w-7 h-7 text-[#808080]" />
                  Book Seat - {selectedBusData.busNumber}
                </h2>

                {/* Route Selection */}
                {!selectedRoute && (
                  <div>
                    <p className="text-sm text-[#808080] mb-4 font-medium flex items-center gap-2">
                      <MapPin size={16} />
                      Select a Route (Location):
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {selectedBusData.routes && selectedBusData.routes.length > 0 ? selectedBusData.routes.map((route, index) => (
                        <motion.button
                          key={route.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          whileHover={{ scale: 1.05, x: 4 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setSelectedRoute(route.id)}
                          className="p-4 border-2 border-[#333333] rounded-lg hover:border-[#808080] bg-[#2d2d2d] hover:bg-[#404040] transition-all duration-300 text-left group"
                        >
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2">
                              <MapPin size={18} className="text-[#808080] group-hover:text-white transition" />
                              <span className="font-medium text-white">{route.location}</span>
                            </div>
                            <span className="font-bold text-green-400 text-lg flex items-center gap-1">
                              <IndianRupee size={18} />
                              {route.amount}
                            </span>
                          </div>
                        </motion.button>
                      )) : (
                        <p className="text-[#808080]">No routes available for this bus</p>
                      )}
                    </div>
                  </div>
                )}

                {/* Seat Selection */}
                {selectedRoute && (
                  <>
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center justify-between p-4 bg-[#2d2d2d] border border-[#404040] rounded-lg hover:border-[#808080] transition"
                    >
                      <div className="flex items-center gap-2">
                        <MapPin size={18} className="text-[#808080]" />
                        <span className="font-medium text-white">{selectedRouteData?.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <IndianRupee size={18} className="text-green-400" />
                        <span className="font-bold text-green-400 text-lg">₹{selectedRouteData?.amount}</span>
                      </div>
                      <button
                        onClick={() => setSelectedRoute(null)}
                        className="text-sm text-[#808080] hover:text-white transition"
                      >
                        Change
                      </button>
                    </motion.div>

                    <div>
                      <p className="text-sm text-[#808080] mb-4 font-medium">
                        Select a seat (available seats are shown in green):
                      </p>
                      <div className="grid grid-cols-10 gap-2">
                        {Array.from({ length: selectedBusData.totalSeats }, (_, i) => i + 1).map(
                          (seatNum, index) => {
                            const isBooked = !selectedBusData.availableSeats.includes(seatNum);
                            const isSelected = selectedSeat === seatNum;

                            return (
                              <motion.button
                                key={seatNum}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: index * 0.01 }}
                                whileHover={!isBooked ? { scale: 1.1, y: -2 } : {}}
                                whileTap={!isBooked ? { scale: 0.9 } : {}}
                                onClick={() => !isBooked && setSelectedSeat(seatNum)}
                                disabled={isBooked}
                                className={`p-3 rounded-lg font-medium transition-all duration-200 ${
                                  isBooked
                                    ? "bg-[#2d2d2d] text-[#6b6b6b] cursor-not-allowed border border-[#333333]"
                                    : isSelected
                                    ? "bg-gradient-to-br from-green-500 to-green-600 text-white ring-2 ring-green-400 shadow-lg scale-110"
                                    : "bg-[#2d2d2d] text-white hover:bg-[#404040] border border-[#333333] hover:border-[#808080]"
                                }`}
                              >
                                {seatNum}
                              </motion.button>
                            );
                          }
                        )}
                      </div>
                      <div className="flex gap-4 mt-4">
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 bg-gradient-to-br from-green-500 to-green-600 border border-green-400 rounded"></div>
                          <span className="text-sm text-[#808080]">Available</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="w-4 h-4 bg-[#2d2d2d] border border-[#333333] rounded"></div>
                          <span className="text-sm text-[#808080]">Booked</span>
                        </div>
                      </div>
                    </div>

                    {/* Payment Summary */}
                    {selectedSeat && selectedRouteData && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-gradient-to-br from-[#2d2d2d] to-[#1a1a1a] border border-[#404040] rounded-lg p-5 hover:border-[#808080] transition"
                      >
                        <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                          <TrendingUp size={18} />
                          Booking Summary:
                        </h3>
                        <div className="space-y-3 text-sm">
                          <div className="flex justify-between">
                            <span className="text-[#808080]">Bus:</span>
                            <span className="font-medium text-white">{selectedBusData.busNumber}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[#808080]">Route:</span>
                            <span className="font-medium text-white">{selectedRouteData.location}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-[#808080]">Seat:</span>
                            <span className="font-medium text-white">Seat {selectedSeat}</span>
                          </div>
                          <div className="border-t border-[#404040] pt-3 mt-3 flex justify-between font-bold text-green-400 text-lg">
                            <span>Total Amount:</span>
                            <span className="flex items-center gap-1">
                              <IndianRupee size={18} />
                              {selectedRouteData.amount}
                            </span>
                          </div>
                        </div>
                      </motion.div>
                    )}

                    <div className="flex gap-4 pt-2">
                      <motion.button
                        onClick={handleBookSeat}
                        disabled={!selectedSeat || bookingLoading || !razorpayLoaded}
                        whileHover={!bookingLoading && razorpayLoaded ? { scale: 1.05 } : {}}
                        whileTap={!bookingLoading && razorpayLoaded ? { scale: 0.95 } : {}}
                        className={`flex-1 px-6 py-3.5 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
                          selectedSeat && !bookingLoading && razorpayLoaded
                            ? "bg-gradient-to-r from-[#404040] to-[#6b6b6b] hover:from-[#6b6b6b] hover:to-[#404040] text-white border border-[#808080] shadow-lg"
                            : "bg-[#2d2d2d] text-[#6b6b6b] cursor-not-allowed border border-[#333333]"
                        }`}
                      >
                        {bookingLoading ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            <span>Processing...</span>
                          </>
                        ) : razorpayLoaded ? (
                          <>
                            <IndianRupee size={20} />
                            <span>Pay ₹{selectedRouteData?.amount || 0}</span>
                          </>
                        ) : (
                          "Loading Payment..."
                        )}
                      </motion.button>
                      <motion.button
                        onClick={() => {
                          setSelectedBus(null);
                          setSelectedRoute(null);
                          setSelectedSeat(null);
                        }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        className="px-6 py-3.5 rounded-lg font-semibold bg-[#2d2d2d] hover:bg-[#404040] text-white border border-[#333333] hover:border-[#808080] transition-all duration-300"
                      >
                        Cancel
                      </motion.button>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
