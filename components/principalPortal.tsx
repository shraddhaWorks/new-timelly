"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  School,
  Users,
  GraduationCap,
  Building2,
  FileCheck,
  CreditCard,
  Newspaper,
  Megaphone,
  Calendar,
  Bus,
  Menu,
  X,
} from "lucide-react"
import RequireRole from "./RequireRole"
import ClassesPage from "./Classes"
import AddStudentPage from "./addStudents"
import TeacherSignupPage from "./teachers"
import SchoolPage from "./school"
import TCPage from "./tc"
import Page from "@/app/payments/page"
import NewsFeedPage from "./NewsFeed"
import EventsPage from "./Events"
import AdminLeavesPage from "./adminleave"
import BusManagement from "./BusManagement"
import HostelManagement from "./HostelManagement"
import TimetableManagement from "./TimetableManagement"
import RoomAllocationManagement from "./RoomAllocationManagement"
import HodSignupPageComponent from "./hodSignup"
/* ---------------- SIDEBAR ACTIONS ---------------- */

const actions = [
  { id: "classes", label: "Classes", icon: School },
  { id: "students", label: "Students", icon: Users },
  { id: "teachers", label: "Teachers", icon: GraduationCap },
  { id: "tc", label: "TC Requests", icon: FileCheck },
  { id: "newsfeed", label: "Newsfeed", icon: Newspaper },
  { id: "events", label: "Events", icon: Megaphone },
  { id: "leave", label: "Leave Applications", icon: Calendar },
  { id: "bus", label: "Bus Management", icon: Bus },
  { id: "hostel", label: "Hostel Management", icon: Building2 },
  { id: "timetable", label: "Timetable Management", icon: Calendar },
  { id: "room-allocation", label: "Room Allocation", icon: Building2 },
  { id: "hod", label: "HOD Management", icon: Users },
]

/* ---------------- MAIN PAGE ---------------- */

export default function PrincipalPortalPage() {
  const [active, setActive] = useState(actions[0])
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-black">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-[#1a1a1a] border border-[#333333] rounded-lg text-white hover:bg-[#2d2d2d] transition"
      >
        {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-40
        w-64 md:w-72 bg-[#1a1a1a] border-r border-[#333333] shadow-2xl flex-shrink-0
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-6 border-b border-[#333333]">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-[#404040] rounded-lg flex items-center justify-center">
              <School className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-white">
                School Admin
              </h1>
              <p className="text-xs md:text-sm text-[#808080]">
                Dashboard
              </p>
            </div>
          </div>
        </div>

        <nav className="p-3 md:p-4 space-y-2 overflow-y-auto max-h-[calc(100vh-120px)]">
          {actions.map((item) => {
            const Icon = item.icon
            const isActive = active.id === item.id

            return (
              <motion.button
                key={item.id}
                whileHover={{ scale: 1.02, x: 4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setActive(item)
                  setSidebarOpen(false) // Close sidebar on mobile when item is clicked
                }}
                className={`w-full flex items-center gap-3 md:gap-4 px-3 md:px-4 py-2.5 md:py-3 rounded-lg transition text-left
                  ${isActive
                    ? "bg-[#404040] text-white shadow-lg border-l-4 border-[#808080]"
                    : "text-[#808080] hover:bg-[#2d2d2d] hover:text-white"
                  }
                `}
              >
                <Icon size={18} className="flex-shrink-0" />
                <span className="font-medium text-sm md:text-base truncate">{item.label}</span>
              </motion.button>
            )
          })}
        </nav>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 overflow-hidden bg-black p-0 m-0 pt-16 md:pt-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={active.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.35 }}
            className="bg-black h-full w-full overflow-auto p-4 md:p-6"
          >
            {/* CONTENT AREA */}
            <div className="h-full w-full">
              {renderContent(active.id)}
            </div>
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  )
}

/* ---------------- CONTENT RENDERER ---------------- */

function renderContent(section: string) {
  switch (section) {
    case "classes":
      return <Classes />
    case "students":
      return <Students />
    case "teachers":
      return <Teachers />
    case "tc":
      return <TCRequests />
    case "newsfeed":
      return <NewsFeed />
    case "events":
      return <Events />
    case "leave":
      return <LeaveApplications />
    case "bus":
      return <BusManagementSection />
    case "hostel":
      return <HostelManagementSection />
    case "timetable":
      return <TimetableManagementSection />
    case "room-allocation":
      return <RoomAllocationManagementSection />
    case "hod":
      return <HodSignupPageWrapper />
    default:
      return <ComingSoon />
  }
}

/* ---------------- PAGE WRAPPERS ---------------- */

function Classes() {
  return (
    <RequireRole allowedRoles={["PRINCIPAL"]}>
      <ClassesPage />
    </RequireRole>
  )
}

function Students() {
  return (
    <RequireRole allowedRoles={["PRINCIPAL"]}>
      <AddStudentPage />
    </RequireRole>
  )
}

function Teachers() {
  return (
    <RequireRole allowedRoles={["PRINCIPAL"]}>
      <TeacherSignupPage />
    </RequireRole>
  )
}

function TCRequests() {
  return (
    <RequireRole allowedRoles={["PRINCIPAL"]}>
      <TCPage />
    </RequireRole>
  )
}

function NewsFeed() {
  return (
    <RequireRole allowedRoles={["PRINCIPAL"]}>
      <NewsFeedPage />
    </RequireRole>
  )
}

function Events() {
  return (
    <RequireRole allowedRoles={["PRINCIPAL"]}>
      <EventsPage />
    </RequireRole>
  )
}

function LeaveApplications() {
  return (
    <RequireRole allowedRoles={["PRINCIPAL"]}>
      <AdminLeavesPage />
    </RequireRole>
  )
}

function BusManagementSection() {
  return (
    <RequireRole allowedRoles={["PRINCIPAL"]}>
      <BusManagement />
    </RequireRole>
  )
}

function HostelManagementSection() {
  return (
    <RequireRole allowedRoles={["PRINCIPAL"]}>
      <HostelManagement />
    </RequireRole>
  )
}

function TimetableManagementSection() {
  return (
    <RequireRole allowedRoles={["PRINCIPAL"]}>
      <TimetableManagement />
    </RequireRole>
  )
}

function RoomAllocationManagementSection() {
  return (
    <RequireRole allowedRoles={["PRINCIPAL"]}>
      <RoomAllocationManagement />
    </RequireRole>
  )
}

function HodSignupPageWrapper() {
  return (
    <RequireRole allowedRoles={["PRINCIPAL"]}>
      <HodSignupPageComponent />
    </RequireRole>
  )
}

/* ---------------- FALLBACK ---------------- */

function ComingSoon() {
  return (
    <div className="h-full w-full flex items-center justify-center">
      <div className="text-center">
        <div className="w-20 h-20 bg-[#2d2d2d] rounded-full flex items-center justify-center mx-auto mb-4">
          <School className="w-10 h-10 text-[#808080]" />
        </div>
        <p className="text-[#808080] text-lg">Feature under development</p>
      </div>
    </div>
  )
}
