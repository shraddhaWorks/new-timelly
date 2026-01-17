"use client";

import BulkStudentUpload from "@/app/bulkstudent/page";
import { div } from "framer-motion/client";
import { useState } from "react";
import { motion } from "framer-motion";
import { UploadCloud, FileSpreadsheet } from "lucide-react";

export default function AddStudentPage() {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    fatherName: "",
    email: "",
    phoneNo: "",
    aadhaarNo: "",
    dob: "",
    address: "",
    totalFee: "",
    discountPercent: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    // Client-side validation
    if (!form.name || !form.dob || !form.fatherName || !form.aadhaarNo || !form.phoneNo) {
      alert("Please fill in all required fields: Name, Date of Birth, Father Name, Aadhaar Number, and Phone Number");
      return;
    }

    if (!form.totalFee) {
      alert("Please enter the total fee for this student");
      return;
    }

    const totalFee = Number(form.totalFee);
    const discountPercent = form.discountPercent ? Number(form.discountPercent) : 0;

    if (isNaN(totalFee) || totalFee <= 0) {
      alert("Total fee must be a positive number");
      return;
    }

    if (discountPercent < 0 || discountPercent > 100) {
      alert("Discount percentage must be between 0 and 100");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("/api/student/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...form,
          totalFee,
          discountPercent,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.message || "Failed to create student");
        return;
      }

      alert("Student created successfully");

      setForm({
        name: "",
        fatherName: "",
        email: "",
        phoneNo: "",
        aadhaarNo: "",
        dob: "",
        address: "",
        totalFee: "",
        discountPercent: "",
      });
    } catch (err) {
      console.error(err);
      alert("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Add Student Form */}
      <div className="min-h-screen flex items-center justify-center bg-black p-4">
        <div className="w-full max-w-2xl bg-[#1a1a1a] border border-[#333333] rounded-2xl shadow-2xl">
          <div className="p-6 space-y-6">
            <h1 className="text-2xl font-semibold text-white text-center">
              Add Student
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/** Student Name */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-[#808080]">Student Name <span className="text-red-400">*</span></label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Enter student name"
                  required
                  className="bg-[#2d2d2d] border border-[#404040] text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#808080] focus:border-transparent placeholder-[#6b6b6b]"
                />
              </div>

              {/** Father Name */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-[#808080]">Father Name <span className="text-red-400">*</span></label>
                <input
                  type="text"
                  name="fatherName"
                  value={form.fatherName}
                  onChange={handleChange}
                  placeholder="Enter father name"
                  required
                  className="bg-[#2d2d2d] border border-[#404040] text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#808080] focus:border-transparent placeholder-[#6b6b6b]"
                />
              </div>

              {/** Email */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-[#808080]">Email</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="student@email.com"
                  className="bg-[#2d2d2d] border border-[#404040] text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#808080] focus:border-transparent placeholder-[#6b6b6b]"
                />
              </div>

              {/** Phone */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-[#808080]">Phone Number <span className="text-red-400">*</span></label>
                <input
                  type="text"
                  name="phoneNo"
                  value={form.phoneNo}
                  onChange={handleChange}
                  placeholder="9876543210"
                  required
                  className="bg-[#2d2d2d] border border-[#404040] text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#808080] focus:border-transparent placeholder-[#6b6b6b]"
                />
              </div>

              {/** Aadhaar */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-[#808080]">Aadhaar Number <span className="text-red-400">*</span></label>
                <input
                  type="text"
                  name="aadhaarNo"
                  value={form.aadhaarNo}
                  onChange={handleChange}
                  placeholder="XXXX-XXXX-XXXX"
                  required
                  className="bg-[#2d2d2d] border border-[#404040] text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#808080] focus:border-transparent placeholder-[#6b6b6b]"
                />
              </div>

              {/** DOB */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-[#808080]">Date of Birth <span className="text-red-400">*</span></label>
                <input
                  type="date"
                  name="dob"
                  value={form.dob}
                  onChange={handleChange}
                  required
                  className="bg-[#2d2d2d] border border-[#404040] text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#808080] focus:border-transparent"
                />
              </div>

              {/** Address */}
              <div className="flex flex-col gap-1 md:col-span-2">
                <label className="text-sm font-medium text-[#808080]">Address</label>
                <input
                  type="text"
                  name="address"
                  value={form.address}
                  onChange={handleChange}
                  placeholder="Student address"
                  className="bg-[#2d2d2d] border border-[#404040] text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#808080] focus:border-transparent placeholder-[#6b6b6b]"
                />
              </div>

              {/** Total Fee */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-[#808080]">
                  Total Fee (₹) <span className="text-red-400">*</span>
                </label>
                <input
                  type="number"
                  name="totalFee"
                  value={form.totalFee}
                  onChange={handleChange}
                  placeholder="e.g. 12000"
                  min={0}
                  className="bg-[#2d2d2d] border border-[#404040] text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#808080] focus:border-transparent placeholder-[#6b6b6b]"
                />
              </div>

              {/** Discount Percent */}
              <div className="flex flex-col gap-1">
                <label className="text-sm font-medium text-[#808080]">
                  Discount (%) 
                </label>
                <input
                  type="number"
                  name="discountPercent"
                  value={form.discountPercent}
                  onChange={handleChange}
                  placeholder="e.g. 10"
                  min={0}
                  max={100}
                  className="bg-[#2d2d2d] border border-[#404040] text-white rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#808080] focus:border-transparent placeholder-[#6b6b6b]"
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="w-full bg-[#404040] hover:bg-[#6b6b6b] text-white py-2 rounded-xl font-medium transition border border-[#333333] disabled:opacity-50"
            >
              {loading ? "Saving..." : "Create Student"}
            </button>

            <p className="text-xs text-center text-[#6b6b6b]">
              Default password will be student's Date of Birth (YYYYMMDD)
            </p>
          </div>
        </div>
      </div>

      {/* Bulk Upload Section */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        viewport={{ once: true }}
        className="min-h-screen flex items-center justify-center bg-black p-6"
      >
        <motion.div
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 200 }}
          className="w-full max-w-3xl bg-[#1a1a1a] border border-[#333333] rounded-3xl shadow-2xl p-8"
        >
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center gap-4 mb-6"
          >
            <div className="p-4 rounded-2xl bg-[#2d2d2d] text-white shadow border border-[#333333]">
              <UploadCloud size={32} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">
                Bulk Student Upload
              </h2>
              <p className="text-sm text-[#808080]">
                Upload students using Excel sheet
              </p>
            </div>
          </motion.div>

          {/* Info Strip */}
          <motion.div
            whileHover={{ scale: 1.01 }}
            className="flex items-center gap-3 mb-6 bg-[#2d2d2d] border border-[#404040] rounded-xl p-4"
          >
            <FileSpreadsheet className="text-[#808080]" />
            <p className="text-sm text-white">
              Accepted format: <b className="text-white">.xlsx</b> · Follow the sample template
            </p>
          </motion.div>

          {/* Excel Upload Component (UNCHANGED LOGIC) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="rounded-2xl border-2 border-dashed border-[#404040] p-6 hover:border-[#808080] transition"
          >
            <BulkStudentUpload />
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
    
  );
}
