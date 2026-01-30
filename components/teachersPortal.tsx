"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  ClipboardList,
  Eye,
  CalendarCheck,
  Calendar,
  FileText,
  Megaphone,
  BookOpen,
  Newspaper,
  MessageSquare,
  GraduationCap,
  Menu,
  X,
} from "lucide-react"

import RequireRole from "./RequireRole"
import MarksEntryPage from "./MarksEntry"
import ViewMarksPage from "./MarksView"
import MarkAttendancePage from "./AtendMark"
import ViewAttendancePages from "@/app/attendance/view/page"
import CertificatesPage from "./Certificates"
import HomeworkPage from "./Homework"
import NewsFeedPage from "./NewsFeed"
import EventsPage from "./Events"
import CommunicationPage from "@/app/communication/page"
import TeacherLeavesPage from "./teacherleave"
import LibraryIssueComponent from "./LibraryIssue"



/* ---------------- SIDEBAR ACTIONS ---------------- */

const actions = [
  { id: "marks-entry", label: "Marks Entry", icon: ClipboardList },
  { id: "marks-view", label: "Marks View", icon: Eye },
  { id: "attendance-mark", label: "Attendance Mark", icon: CalendarCheck },
  { id: "attendance-view", label: "Attendance View", icon: Calendar },
  { id: "certificates", label: "Certificates", icon: FileText },
  { id: "events", label: "Events", icon: Megaphone },
  { id: "homework", label: "Homeworks", icon: BookOpen },
  { id: "newsfeed", label: "News Feed", icon: Newspaper },
  { id: "communication", label: "Communication", icon: MessageSquare },
  { id: "leaves", label: "Leaves Management", icon: Calendar },
  { id: "library-issue", label: "Library Issue", icon: BookOpen  },
]

/* ---------------- MAIN PAGE ---------------- */

export default function TeachersPage() {
  const [active, setActive] = useState(actions[0])
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-black m-0 p-0">
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
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold text-white">
                Teacher Portal
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
                className={`w-full flex items-center gap-3 md:gap-4 px-3 md:px-4 py-2.5 md:py-3 rounded-lg text-left transition
                  ${
                    isActive
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
      <main className="flex-1 overflow-hidden bg-black m-0 p-0 pt-16 md:pt-0">
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
    case "marks-entry":
      return <MarksEntry />

    case "marks-view":
      return <MarksView />

    case "attendance-mark":
      return <AttendanceMark />

    case "attendance-view":
      return <AttendanceView />

    case "certificates":
      return <Certificate />

    case "homework":
      return <Homework />

    case "newsfeed":
      return <Newsfeed />

    case "events":
      return <Events />

    case "communication":
      return <Communication />

    case "leaves":
      return <Leaves />
    case "library-issue":
  return <LibraryIssue />
    default:
      return <ComingSoon />
  }
}

/* ---------------- PAGE WRAPPERS ---------------- */

function MarksEntry() {
  return (
    <RequireRole allowedRoles={["TEACHER"]}>
      <MarksEntryPage />
    </RequireRole>
  )
}

function MarksView() {
  return (
    <RequireRole allowedRoles={["TEACHER"]}>
      <ViewMarksPage />
    </RequireRole>
  )
}

function AttendanceMark() {
  return (
    <RequireRole allowedRoles={["TEACHER"]}>
      <MarkAttendancePage />
    </RequireRole>
  )
}

function AttendanceView() {
  return (
    <RequireRole allowedRoles={["TEACHER"]}>
      <ViewAttendancePages />
    </RequireRole>
  )
}

function Certificate() {
  return (
    <RequireRole allowedRoles={["TEACHER"]}>
      <CertificatesPage />
    </RequireRole>
  )
}

function Homework() {
  return (
    <RequireRole allowedRoles={["TEACHER"]}>
      <HomeworkPage />
    </RequireRole>
  )
}

function Newsfeed() {
  return (
    <RequireRole allowedRoles={["TEACHER"]}>
      <NewsFeedPage />
    </RequireRole>
  )
}

function Events() {
  return (
    <RequireRole allowedRoles={["TEACHER"]}>
      <EventsPage />
    </RequireRole>
  )
}

function Communication() {
  return (
    <RequireRole allowedRoles={["TEACHER"]}>
      <CommunicationPage />
    </RequireRole>
  )
}

function Leaves() {
  return (
    <RequireRole allowedRoles={["TEACHER"]}>
      <TeacherLeavesPage />
    </RequireRole>
  )
}
function LibraryIssue() {
  return (
    <RequireRole allowedRoles={["TEACHER"]}>
      <LibraryIssueComponent />
    </RequireRole>
  )
}


/* ---------------- FALLBACK ---------------- */

function ComingSoon() {
  return (
    <div className="h-full w-full flex items-center justify-center">
      <div className="text-center">
        <div className="w-20 h-20 bg-[#2d2d2d] rounded-full flex items-center justify-center mx-auto mb-4">
          <GraduationCap className="w-10 h-10 text-[#808080]" />
        </div>
        <p className="text-[#808080] text-lg">Feature under development</p>
      </div>
    </div>
  )
}
