"use client"

import { useEffect, useState } from "react"
import { motion } from "framer-motion"
import { Calendar, Clock, FileText, Send, CheckCircle2, XCircle, AlertCircle } from "lucide-react"

interface Leave {
  id: string
  leaveType: string
  fromDate: string
  toDate: string
  status: string
  remarks?: string | null
}

export default function TeacherLeavesPage() {
  const [leaves, setLeaves] = useState<Leave[]>([])
  const [form, setForm] = useState({
    leaveType: "CASUAL",
    reason: "",
    fromDate: "",
    toDate: ""
  })

  async function fetchLeaves() {
    const res = await fetch("/api/leaves/my")
    const data = await res.json()
    setLeaves(data)
  }

  async function applyLeave(e: any) {
    e.preventDefault()

    await fetch("/api/leaves/apply", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    })

    setForm({ leaveType: "CASUAL", reason: "", fromDate: "", toDate: "" })
    fetchLeaves()
  }

  useEffect(() => {
    fetchLeaves()
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "bg-green-500/20 text-green-400 border-green-500/30"
      case "REJECTED":
        return "bg-red-500/20 text-red-400 border-red-500/30"
      case "PENDING":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
      default:
        return "bg-[#2d2d2d] text-[#808080] border-[#404040]"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "APPROVED":
        return <CheckCircle2 size={16} />
      case "REJECTED":
        return <XCircle size={16} />
      case "PENDING":
        return <AlertCircle size={16} />
      default:
        return null
    }
  }

  return (
    <div className="min-h-screen bg-black p-4 md:p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-3"
        >
          <div className="w-12 h-12 bg-gradient-to-br from-[#2d2d2d] to-[#404040] rounded-xl flex items-center justify-center border border-[#333333] shadow-lg">
            <Calendar className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white">Apply for Leave</h1>
        </motion.div>

        {/* Form */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          onSubmit={applyLeave}
          className="relative overflow-hidden bg-gradient-to-br from-[#1a1a1a] via-[#2d2d2d] to-[#1a1a1a] rounded-2xl shadow-2xl p-6 md:p-8 border border-[#333333] hover:border-[#404040] transition-all duration-300 space-y-5"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-[#404040]/10 via-transparent to-[#404040]/10"></div>
          <div className="relative">
            <label className="block text-sm font-medium text-[#808080] mb-2 flex items-center gap-2">
              <FileText size={16} />
              Leave Type <span className="text-red-400">*</span>
            </label>
            <select
              value={form.leaveType}
              onChange={e => setForm({ ...form, leaveType: e.target.value })}
              className="w-full bg-[#2d2d2d] border border-[#404040] text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#808080] focus:border-transparent hover:border-[#808080] transition"
            >
              <option value="CASUAL" className="bg-[#2d2d2d]">Casual</option>
              <option value="SICK" className="bg-[#2d2d2d]">Sick</option>
              <option value="PAID" className="bg-[#2d2d2d]">Paid</option>
              <option value="UNPAID" className="bg-[#2d2d2d]">Unpaid</option>
            </select>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-[#808080] mb-2 flex items-center gap-2">
                  <Calendar size={16} />
                  From Date <span className="text-red-400">*</span>
                </label>
                <input
                  type="date"
                  value={form.fromDate}
                  onChange={e => setForm({ ...form, fromDate: e.target.value })}
                  required
                  className="w-full bg-[#2d2d2d] border border-[#404040] text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#808080] focus:border-transparent hover:border-[#808080] transition"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#808080] mb-2 flex items-center gap-2">
                  <Calendar size={16} />
                  To Date <span className="text-red-400">*</span>
                </label>
                <input
                  type="date"
                  value={form.toDate}
                  onChange={e => setForm({ ...form, toDate: e.target.value })}
                  required
                  className="w-full bg-[#2d2d2d] border border-[#404040] text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#808080] focus:border-transparent hover:border-[#808080] transition"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-[#808080] mb-2 flex items-center gap-2">
                <FileText size={16} />
                Reason <span className="text-red-400">*</span>
              </label>
              <textarea
                placeholder="Enter reason for leave..."
                value={form.reason}
                onChange={e => setForm({ ...form, reason: e.target.value })}
                required
                rows={4}
                className="w-full bg-[#2d2d2d] border border-[#404040] text-white rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-[#808080] focus:border-transparent hover:border-[#808080] transition placeholder-[#6b6b6b] resize-none"
              />
            </div>

            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full mt-6 bg-gradient-to-r from-[#404040] to-[#6b6b6b] hover:from-[#6b6b6b] hover:to-[#404040] text-white py-3.5 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 border border-[#333333] hover:border-[#808080] shadow-lg"
            >
              <Send size={20} />
              Apply Leave
            </motion.button>
          </div>
        </motion.form>

        {/* My Leaves */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h2 className="text-2xl md:text-3xl font-bold mb-6 text-white flex items-center gap-3">
            <Calendar size={24} />
            My Leaves
          </h2>

          {leaves.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-[#1a1a1a] border border-[#333333] rounded-xl p-12 text-center"
            >
              <Calendar className="w-16 h-16 mx-auto mb-4 text-[#808080] opacity-50" />
              <p className="text-[#808080] text-lg">No leaves applied yet</p>
            </motion.div>
          ) : (
            <div className="space-y-4">
              {leaves.map((leave, index) => (
                <motion.div
                  key={leave.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  whileHover={{ y: -4, scale: 1.01 }}
                  className="relative overflow-hidden bg-gradient-to-br from-[#1a1a1a] to-[#2d2d2d] rounded-xl shadow-lg p-6 border border-[#333333] hover:border-[#404040] transition-all duration-300"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#404040]/20 to-transparent rounded-bl-full"></div>
                  <div className="relative flex justify-between items-center">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 bg-[#2d2d2d] rounded-lg flex items-center justify-center border border-[#404040]">
                          <Calendar className="w-5 h-5 text-[#808080]" />
                        </div>
                        <div>
                          <div className="font-semibold text-white text-lg">{leave.leaveType}</div>
                          <div className="text-[#808080] text-sm flex items-center gap-2 mt-1">
                            <Clock size={14} />
                            <span>{leave.fromDate.slice(0, 10)} to {leave.toDate.slice(0, 10)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div>
                      <span
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-full font-semibold text-sm border ${getStatusColor(leave.status)}`}
                      >
                        {getStatusIcon(leave.status)}
                        {leave.status}
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  )
}
