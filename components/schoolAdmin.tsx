"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  School,
  Users,
  Building2,
  CreditCard,
  Newspaper,
  Megaphone,
  Menu,
  X,
  Search,
  FileText,
  CalendarCheck,
  FileCheck,
  Bus,
  Calendar,
} from "lucide-react"

import RequireRole from "./RequireRole"

// PAGES
import SchoolPage from "./school"
import TeacherSignupPage from "./teachers"
import StudentLookupTab from "./schoolAdmin/StudentLookupTab"
import CircularsTab from "./schoolAdmin/CircularsTab"
import AdminLeaveTab from "./adminleave"
import PaymentsPage from "@/app/payments/page"
import NewsFeedPage from "./NewsFeed"
import EventsPage from "./Events"
import ClassesPage from "./Classes"
import AddStudentPage from "./addStudents"
import TCPage from "./tc"
import BusManagement from "./BusManagement"
import HostelManagement from "./HostelManagement"
import TimetableManagement from "./TimetableManagement"
import RoomAllocationManagement from "./RoomAllocationManagement"

/* ---------------- ACTIONS ---------------- */

const actions = [
  { id: "school", label: "School Details", icon: Building2 },
  { id: "teachers", label: "Teachers", icon: Users },
  { id: "students", label: "Students", icon: Users },
  { id: "classes", label: "Classes", icon: School },
  { id: "studentLookup", label: "Student Lookup", icon: Search },
  { id: "payments", label: "Payments & Fees", icon: CreditCard },
  { id: "newsfeed", label: "Newsfeed", icon: Newspaper },
  { id: "events", label: "Events", icon: Megaphone },
  { id: "circulars", label: "Circulars", icon: FileText },
  { id: "leaveMgmt", label: "Leave Management", icon: CalendarCheck },
  { id: "tc", label: "TC Requests", icon: FileCheck },
  
]

/* ---------------- MAIN PAGE ---------------- */

export default function PrincipalPage() {
  const [active, setActive] = useState(actions[0])
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-black">
      {/* Mobile Menu */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-[#1a1a1a] border border-[#333333] rounded-lg text-white"
      >
        {sidebarOpen ? <X /> : <Menu />}
      </button>

      {sidebarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside
        className={`fixed md:static inset-y-0 left-0 z-40 w-64 md:w-72 glass-strong border-r border-white/10 transition-transform ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="p-6 border-b border-white/10">
          <h1 className="text-2xl font-bold text-white">School Admin</h1>
          <p className="text-sm text-gray-400">Dashboard</p>
        </div>

        <nav className="p-4 space-y-2">
          {actions.map((item) => {
            const Icon = item.icon
            const isActive = active.id === item.id

            return (
              <motion.button
                key={item.id}
                onClick={() => {
                  setActive(item)
                  setSidebarOpen(false)
                }}
                whileHover={{ scale: 1.02, x: 4 }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left ${
                  isActive
                    ? "bg-white/15 text-white"
                    : "text-white/70 hover:bg-white/10"
                }`}
              >
                <Icon size={18} />
                {item.label}
              </motion.button>
            )
          })}
        </nav>
      </aside>

      {/* CONTENT */}
      <main className="flex-1 pt-16 md:pt-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={active.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-6"
          >
            {renderContent(active.id)}
          </motion.div>
        </AnimatePresence>
      </main>
    </div>
  )
}

/* ---------------- CONTENT SWITCH ---------------- */

function renderContent(section: string) {
  switch (section) {
    case "school":
      return <SchoolDetails />
    case "teachers":
      return <Teachers />
    case "students":
      return <Students />
    case "classes":
      return <Classes />
    case "studentLookup":
      return <StudentLookup />
    case "payments":
      return <Payments />
    case "newsfeed":
      return <NewsFeed />
    case "events":
      return <Events />
    case "circulars":
      return <Circulars />
    case "leaveMgmt":
      return <LeaveMgmt />
    case "tc":
      return <TCRequests />
   
    default:
      return <ComingSoon />
  }
}

/* ---------------- SECTIONS (ONLY SCHOOLADMIN) ---------------- */

const Wrapper = ({ children }: { children: React.ReactNode }) => (
  <RequireRole allowedRoles={["SCHOOLADMIN"]}>{children}</RequireRole>
)

const SchoolDetails = () => <Wrapper><SchoolPage /></Wrapper>
const Teachers = () => <Wrapper><TeacherSignupPage /></Wrapper>
const Students = () => <Wrapper><AddStudentPage /></Wrapper>
const Classes = () => <Wrapper><ClassesPage /></Wrapper>
const StudentLookup = () => <Wrapper><StudentLookupTab /></Wrapper>
const Circulars = () => <Wrapper><CircularsTab /></Wrapper>
const LeaveMgmt = () => <Wrapper><AdminLeaveTab /></Wrapper>
const Payments = () => <Wrapper><PaymentsPage /></Wrapper>
const NewsFeed = () => <Wrapper><NewsFeedPage /></Wrapper>
const Events = () => <Wrapper><EventsPage /></Wrapper>
const TCRequests = () => <Wrapper><TCPage /></Wrapper>


/* ---------------- FALLBACK ---------------- */

function ComingSoon() {
  return (
    <div className="h-full flex items-center justify-center text-gray-400">
      Feature under development
    </div>
  )
}
