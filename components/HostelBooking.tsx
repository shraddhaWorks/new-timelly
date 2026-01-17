"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { Building2, MapPin, Bed, CheckCircle, IndianRupee, Users, Calendar, AlertCircle } from "lucide-react";

interface Room {
  id: string;
  roomNumber: string;
  floor: number;
  cotCount: number;
  amount: number;
  availableCots: number[];
  bookedCotsCount: number;
  availableCotsCount: number;
  bookings: Array<{
    id: string;
    cotNumber: number;
    student: {
      user: { name: string | null; email: string | null };
    };
  }>;
}

interface HostelData {
  id: string;
  name: string;
  address: string;
  gender: string;
  rooms: Room[];
}

interface MyBooking {
  id: string;
  cotNumber: number;
  amount: number;
  paymentStatus: string;
  createdAt: string;
  room: {
    id: string;
    roomNumber: string;
    floor: number;
    hostel: {
      id: string;
      name: string;
      address: string;
      gender: string;
    };
  };
}

export default function HostelBooking() {
  const { data: session, status } = useSession();
  const [hostels, setHostels] = useState<HostelData[]>([]);
  const [myBooking, setMyBooking] = useState<MyBooking | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedHostel, setSelectedHostel] = useState<string | null>(null);
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [selectedCot, setSelectedCot] = useState<number | null>(null);
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
      fetchHostels();
      fetchMyBooking();
    } else if (status === "unauthenticated") {
      setLoading(false);
    }
  }, [session, status, mounted]);

  const fetchHostels = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/hostel/list");
      const data = await res.json();
      if (res.ok && data.hostels) {
        setHostels(data.hostels);
      } else {
        alert(data.message || "Failed to fetch hostels");
      }
    } catch (err: any) {
      console.error("Error fetching hostels:", err);
      alert(err?.message || "Failed to fetch hostels");
    } finally {
      setLoading(false);
    }
  };

  const fetchMyBooking = async () => {
    if (!session?.user?.studentId || !mounted) return;
    
    try {
      const res = await fetch("/api/hostel/list");
      const data = await res.json();
      if (res.ok && data.hostels) {
        for (const hostel of data.hostels) {
          for (const room of hostel.rooms || []) {
            if (room.bookings && Array.isArray(room.bookings)) {
              const myBook = room.bookings.find(
                (b: any) => b.student?.id === session.user.studentId
              );
              if (myBook) {
                setMyBooking({
                  id: myBook.id,
                  cotNumber: myBook.cotNumber,
                  amount: myBook.amount || 0,
                  paymentStatus: myBook.paymentStatus || "PENDING",
                  createdAt: myBook.createdAt || "",
                  room: {
                    id: room.id,
                    roomNumber: room.roomNumber,
                    floor: room.floor,
                    hostel: {
                      id: hostel.id,
                      name: hostel.name,
                      address: hostel.address,
                      gender: hostel.gender,
                    },
                  },
                });
                return;
              }
            }
          }
        }
      }
    } catch (err) {
      console.error("Error fetching my booking:", err);
    }
  };

  const handleBookCot = async () => {
    if (!selectedRoom || !selectedCot) {
      alert("Please select a room and cot");
      return;
    }

    if (!razorpayLoaded) {
      alert("Payment gateway is loading. Please wait a moment and try again.");
      return;
    }

    const selectedHostelData = hostels.find((h) => h.id === selectedHostel);
    const selectedRoomData = selectedHostelData?.rooms.find((r) => r.id === selectedRoom);

    if (!selectedRoomData) {
      alert("Selected room not found");
      return;
    }

    setBookingLoading(true);
    try {
      const res = await fetch("/api/hostel/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          roomId: selectedRoom,
          cotNumber: selectedCot,
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
        name: "Hostel Booking",
        description: `${selectedHostelData?.name} - Room ${selectedRoomData.roomNumber} - Cot ${selectedCot}`,
        handler: async (response: any) => {
          try {
            const verifyRes = await fetch("/api/hostel/booking/verify", {
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
            setSelectedHostel(null);
            setSelectedRoom(null);
            setSelectedCot(null);
            fetchHostels();
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
          color: "#16a34a",
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
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#808080] mx-auto mb-4"></div>
          <p className="text-white">Loading hostels...</p>
        </div>
      </div>
    );
  }

  if (status === "unauthenticated" || session?.user?.role !== "STUDENT") {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-6">
          <div className="flex items-center gap-3">
            <AlertCircle className="text-red-400" size={24} />
            <p className="text-red-400 text-lg font-medium">Access Denied: Only students can book hostels.</p>
          </div>
        </div>
      </div>
    );
  }

  const selectedHostelData = hostels.find((h) => h.id === selectedHostel);
  const selectedRoomData = selectedHostelData?.rooms.find((r) => r.id === selectedRoom);

  return (
    <div className="min-h-screen bg-black p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3"
        >
          <div className="w-12 h-12 bg-gradient-to-br from-[#2d2d2d] to-[#404040] rounded-xl flex items-center justify-center border border-[#333333] shadow-lg">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white">Hostel Booking</h1>
        </motion.div>

      {myBooking && myBooking.paymentStatus === "PAID" && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden bg-gradient-to-br from-[#1a1a1a] via-[#2d2d2d] to-[#1a1a1a] rounded-2xl shadow-2xl p-6 md:p-8 border-2 border-green-500/30 hover:border-green-500/50 transition-all duration-300"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-green-500/10 via-transparent to-green-500/10"></div>
          <div className="relative">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-green-500/20 to-green-600/20 rounded-xl flex items-center justify-center border border-green-500/30">
                <CheckCircle className="text-green-400" size={32} />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-white">My Booking</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-[#2d2d2d]/50 border border-[#404040] rounded-lg p-4 hover:bg-[#404040]/50 transition">
                <p className="text-sm text-[#808080] mb-1 flex items-center gap-2">
                  <Building2 size={14} />
                  Hostel
                </p>
                <p className="text-lg font-bold text-white">{myBooking.room.hostel.name}</p>
              </div>
              <div className="bg-[#2d2d2d]/50 border border-[#404040] rounded-lg p-4 hover:bg-[#404040]/50 transition">
                <p className="text-sm text-[#808080] mb-1 flex items-center gap-2">
                  <Building2 size={14} />
                  Room
                </p>
                <p className="text-lg font-bold text-white">Room {myBooking.room.roomNumber}</p>
              </div>
              <div className="bg-[#2d2d2d]/50 border border-[#404040] rounded-lg p-4 hover:bg-[#404040]/50 transition">
                <p className="text-sm text-[#808080] mb-1 flex items-center gap-2">
                  <Bed size={14} />
                  Cot Number
                </p>
                <p className="text-lg font-bold text-white">Cot {myBooking.cotNumber}</p>
              </div>
              <div className="bg-[#2d2d2d]/50 border border-[#404040] rounded-lg p-4 hover:bg-[#404040]/50 transition">
                <p className="text-sm text-[#808080] mb-1 flex items-center gap-2">
                  <IndianRupee size={14} />
                  Amount Paid
                </p>
                <p className="text-lg font-bold text-green-400">₹{myBooking.amount}</p>
              </div>
              <div className="bg-[#2d2d2d]/50 border border-[#404040] rounded-lg p-4 hover:bg-[#404040]/50 transition md:col-span-2">
                <p className="text-sm text-[#808080] mb-1 flex items-center gap-2">
                  <MapPin size={14} />
                  Address
                </p>
                <p className="text-lg font-medium text-white">{myBooking.room.hostel.address}</p>
              </div>
            </div>
            {myBooking.createdAt && (
              <div className="flex items-center gap-2 mt-4 pt-4 border-t border-[#333333] text-sm text-[#808080]">
                <Calendar size={14} />
                <span>Booked on: {mounted ? new Date(myBooking.createdAt).toLocaleDateString() : myBooking.createdAt}</span>
              </div>
            )}
          </div>
        </motion.div>
      )}

      <div>
        <motion.h2
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl md:text-3xl font-bold text-white mb-6 flex items-center gap-3"
        >
          <Building2 size={24} className="text-[#808080]" />
          {myBooking && myBooking.paymentStatus === "PAID" ? "Other Available Hostels" : "Available Hostels"}
        </motion.h2>
        {hostels.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-[#1a1a1a] border border-[#333333] rounded-xl shadow-lg p-12 text-center"
          >
            <Building2 size={48} className="mx-auto text-[#808080] mb-4 opacity-50" />
            <p className="text-[#808080] text-lg">No hostels available</p>
          </motion.div>
        ) : (
          <div className="space-y-6">
            {hostels.map((hostel, index) => {
              const isMyHostel = myBooking?.room.hostel.id === hostel.id && myBooking?.paymentStatus === "PAID";
              const hasBooking = myBooking && myBooking.paymentStatus === "PAID";

              return (
                <motion.div
                  key={hostel.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -4, scale: 1.01 }}
                  className={`relative overflow-hidden bg-gradient-to-br from-[#1a1a1a] to-[#2d2d2d] rounded-2xl shadow-lg p-6 md:p-8 border-2 ${
                    selectedHostel === hostel.id
                      ? "border-green-500/50 shadow-xl"
                      : "border-[#333333] hover:border-[#404040] hover:shadow-xl transition-all duration-300"
                  } ${hasBooking && !isMyHostel ? "opacity-60" : ""}`}
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#404040]/20 to-transparent rounded-bl-full"></div>
                  <div className="relative">
                    <div className="flex items-start justify-between mb-6">
                      <div>
                        <h3 className="text-2xl font-bold text-white mb-3">{hostel.name}</h3>
                        <div className="flex items-center gap-4 text-sm text-[#808080]">
                          <div className="flex items-center gap-2">
                            <MapPin size={14} />
                            <span>{hostel.address}</span>
                          </div>
                          <span className="inline-flex items-center px-3 py-1 bg-green-500/20 text-green-400 border border-green-500/30 rounded-full text-xs font-semibold">
                            {hostel.gender}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                      {hostel.rooms.map((room, roomIndex) => (
                        <motion.div
                          key={room.id}
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: roomIndex * 0.05 }}
                          whileHover={{ y: -4, scale: 1.02 }}
                          className={`border-2 rounded-xl p-4 cursor-pointer transition-all duration-300 ${
                            selectedRoom === room.id
                              ? "border-green-500/50 bg-[#2d2d2d] shadow-lg"
                              : "border-[#404040] hover:border-green-500/30 hover:bg-[#2d2d2d]/50"
                          } ${room.availableCotsCount === 0 ? "opacity-50 cursor-not-allowed" : ""}`}
                          onClick={() => {
                            if (room.availableCotsCount > 0 && !hasBooking) {
                              setSelectedHostel(hostel.id);
                              setSelectedRoom(room.id);
                              setSelectedCot(null);
                            }
                          }}
                        >
                          <div className="flex justify-between items-start mb-3">
                            <div>
                              <p className="font-semibold text-white">Room {room.roomNumber}</p>
                              <p className="text-xs text-[#808080]">Floor {room.floor}</p>
                            </div>
                            <span className="font-bold text-green-400 flex items-center gap-1">
                              <IndianRupee size={14} />
                              {room.amount}
                            </span>
                          </div>
                          <div className="mt-3">
                            <p className="text-xs text-[#808080] mb-2 flex items-center gap-2">
                              <Bed size={12} />
                              {room.availableCotsCount} / {room.cotCount} cots available
                            </p>
                            <div className="w-full bg-[#2d2d2d] rounded-full h-2 overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${(room.availableCotsCount / room.cotCount) * 100}%` }}
                                transition={{ duration: 0.5 }}
                                className="bg-gradient-to-r from-green-500 to-green-600 h-2 rounded-full"
                              ></motion.div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {selectedRoomData && (!myBooking || myBooking.paymentStatus !== "PAID") && selectedRoomData.availableCotsCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden bg-gradient-to-br from-[#1a1a1a] via-[#2d2d2d] to-[#1a1a1a] rounded-2xl shadow-2xl p-6 md:p-8 border border-[#333333] hover:border-[#404040] transition-all duration-300 space-y-6"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-[#404040]/10 via-transparent to-[#404040]/10"></div>
          <div className="relative">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <Bed size={24} />
              Book Cot - {selectedHostelData?.name} - Room {selectedRoomData.roomNumber}
            </h2>

            <div>
              <p className="text-sm text-[#808080] mb-4 font-medium">Select a cot (available cots are shown in green):</p>
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-3">
                {Array.from({ length: selectedRoomData.cotCount }, (_, i) => i + 1).map((cotNum) => {
                  const isBooked = !selectedRoomData.availableCots.includes(cotNum);
                  const isSelected = selectedCot === cotNum;

                  return (
                    <motion.button
                      key={cotNum}
                      onClick={() => !isBooked && setSelectedCot(cotNum)}
                      disabled={isBooked}
                      whileHover={!isBooked ? { scale: 1.1 } : {}}
                      whileTap={!isBooked ? { scale: 0.95 } : {}}
                      className={`p-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-1 border ${
                        isBooked
                          ? "bg-[#2d2d2d] text-[#6b6b6b] cursor-not-allowed border-[#404040]"
                          : isSelected
                          ? "bg-green-500 text-white ring-2 ring-green-400 border-green-500 shadow-lg"
                          : "bg-[#2d2d2d] text-white hover:bg-green-500/20 hover:border-green-500/50 border-[#404040]"
                      }`}
                    >
                      <Bed size={16} />
                      {cotNum}
                    </motion.button>
                  );
                })}
              </div>
              <div className="flex gap-4 mt-4">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-500/20 border border-green-500/50 rounded"></div>
                  <span className="text-sm text-[#808080]">Available</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-[#2d2d2d] border border-[#404040] rounded"></div>
                  <span className="text-sm text-[#808080]">Booked</span>
                </div>
              </div>
            </div>

            {selectedCot && selectedRoomData && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-[#2d2d2d]/50 rounded-xl p-4 border border-[#404040]"
              >
                <h3 className="font-semibold text-white mb-3 flex items-center gap-2">
                  <CheckCircle size={18} className="text-green-400" />
                  Booking Summary:
                </h3>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-[#808080]">
                    <span>Hostel:</span>
                    <span className="font-medium text-white">{selectedHostelData?.name}</span>
                  </div>
                  <div className="flex justify-between text-[#808080]">
                    <span>Room:</span>
                    <span className="font-medium text-white">Room {selectedRoomData.roomNumber} (Floor {selectedRoomData.floor})</span>
                  </div>
                  <div className="flex justify-between text-[#808080]">
                    <span>Cot:</span>
                    <span className="font-medium text-white">Cot {selectedCot}</span>
                  </div>
                  <div className="border-t border-[#404040] pt-2 mt-2 flex justify-between font-bold text-green-400">
                    <span className="flex items-center gap-2">
                      <IndianRupee size={16} />
                      Total Amount:
                    </span>
                    <span className="flex items-center gap-1">
                      <IndianRupee size={16} />
                      {selectedRoomData.amount}
                    </span>
                  </div>
                </div>
              </motion.div>
            )}

            <div className="flex gap-4 pt-2">
              <motion.button
                onClick={handleBookCot}
                disabled={!selectedCot || bookingLoading || !razorpayLoaded}
                whileHover={selectedCot && !bookingLoading && razorpayLoaded ? { scale: 1.02 } : {}}
                whileTap={selectedCot && !bookingLoading && razorpayLoaded ? { scale: 0.98 } : {}}
                className={`flex-1 px-6 py-3.5 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${
                  selectedCot && !bookingLoading && razorpayLoaded
                    ? "bg-gradient-to-r from-[#404040] to-[#6b6b6b] hover:from-[#6b6b6b] hover:to-[#404040] text-white border border-[#333333] hover:border-[#808080] shadow-lg"
                    : "bg-[#2d2d2d] text-[#6b6b6b] cursor-not-allowed border border-[#404040]"
                }`}
              >
                {bookingLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    <span>Processing...</span>
                  </>
                ) : razorpayLoaded ? (
                  <>
                    <IndianRupee size={18} />
                    <span>Pay ₹{selectedRoomData?.amount || 0}</span>
                  </>
                ) : (
                  "Loading Payment..."
                )}
              </motion.button>
              <motion.button
                onClick={() => {
                  setSelectedHostel(null);
                  setSelectedRoom(null);
                  setSelectedCot(null);
                }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="px-6 py-3.5 rounded-lg font-semibold bg-[#2d2d2d] hover:bg-[#404040] text-white transition-all duration-300 border border-[#333333] hover:border-[#808080]"
              >
                Cancel
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}
      </div>
    </div>
  );
}
