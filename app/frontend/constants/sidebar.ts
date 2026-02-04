// constants/sidebar/parent.ts
import {
    FiHome,
    FiBookOpen,
    FiCalendar,
    FiBarChart2,
    FiMessageCircle,
    FiCreditCard,
    FiFileText,
    FiLogOut,
    FiUsers,
    FiUser,
    FiPlusCircle,
} from "react-icons/fi";
import { SidebarItem } from "../types/sidebar";
import { Permission } from "../enums/permissions";

export const PARENT_MENU_ITEMS: SidebarItem[] = [
    {
        label: "Dashboard",
        tab: "dashboard",
        href: "/frontend/pages/parent?tab=dashboard",
        icon: FiHome,
        permission: Permission.DASHBOARD,
    },
    {
        label: "Homework",
        tab: "homework",
        href: "/frontend/pages/parent?tab=homework",
        icon: FiBookOpen,
        permission: Permission.HOMEWORK,
    },
    {
        label: "Attendance",
        tab: "attendance",
        href: "/frontend/pages/parent?tab=attendance",
        icon: FiCalendar,
        permission: Permission.ATTENDANCE,
    },
    {
        label: "Marks",
        tab: "marks",
        href: "/frontend/pages/parent?tab=marks",
        icon: FiBarChart2,
        permission: Permission.MARKS,
    },
    {
        label: "Chat",
        tab: "chat",
        href: "/frontend/pages/parent?tab=chat",
        icon: FiMessageCircle,
        permission: Permission.CHAT,
    },
    {
        label: "Fees",
        tab: "fees",
        href: "/frontend/pages/parent?tab=fees",
        icon: FiCreditCard,
        permission: Permission.FEES,
    },
    {
        label: "Certificates",
        tab: "certificates",
        href: "/frontend/pages/parent?tab=certificates",
        icon: FiFileText,
        permission: Permission.CERTIFICATES,
    },
    {
        label: "Logout",
        icon: FiLogOut,
        action: "logout",
    },
];


export const SCHOOLADMIN_MENU_ITEMS: SidebarItem[] = [
    {
        label: "Dashboard",
        tab: "dashboard",
        href: "/frontend/pages/schooladmin",
        icon: FiHome,
        permission: Permission.DASHBOARD,
    },
    {
        label: "Classes",
        tab: "classes",
        href: "/frontend/pages/schooladmin?tab=classes",
        icon: FiBookOpen,
        permission: Permission.CLASSES,
    },
    {
        label: "Students",
        tab: "students",
        href: "/frontend/pages/schooladmin?tab=students",
        icon: FiUsers,
        permission: Permission.STUDENTS,
    },
    {
        label: "Add User",
        tab: "add-user",
        href: "/frontend/pages/schooladmin?tab=add-user",
        icon: FiPlusCircle,
        permission: Permission.NEW_USER,
    }, {
        label: "Student Details",
        tab: "student-details",
        href: "/frontend/pages/schooladmin?tab=student-details",
        icon: FiUsers,
        permission: Permission.STUDENT_DETAILS,
    },
    {
        label: "Teachers",
        tab: "teachers",
        href: "/frontend/pages/schooladmin?tab=teachers",
        icon: FiUser,
        permission: Permission.TEACHERS,
    },
    {
        label: "Teacher Leaves",
        tab: "teacher-leaves",
        href: "/frontend/pages/schooladmin?tab=teacher-leaves",
        icon: FiCalendar,
        permission: Permission.TEACHER_LEAVES,
    },
    {
        label: "Teacher Audit",
        tab: "teacher-audit",
        href: "/frontend/pages/schooladmin?tab=teacher-audit",
        icon: FiFileText,
        permission: Permission.TEACHER_AUDIT,
    },
    {
        label: "Workshops & Events",
        tab: "workshops",
        href: "/frontend/pages/schooladmin?tab=workshops",
        icon: FiCalendar,
        permission: Permission.WORKSHOPS,
    },
    {
        label: "Newsfeed",
        tab: "newsfeed",
        href: "/frontend/pages/schooladmin?tab=newsfeed",
        icon: FiFileText,
        permission: Permission.NEWSFEED,
    }, {
        label: "Circulars",
        tab: "circulars",
        href: "/frontend/pages/schooladmin?tab=circulars",
        icon: FiFileText,
        permission: Permission.CIRCULARS,
    },
    {
        label: "Certificate Request",
        tab: "certificates",
        href: "/frontend/pages/schooladmin?tab=certificates",
        icon: FiFileText,
        permission: Permission.CERTIFICATES,
    },
    {
        label: "Fees",
        tab: "fees",
        href: "/frontend/pages/schooladmin?tab=fees",
        icon: FiCreditCard,
        permission: Permission.FEES,
    },
    {
        label: "Exams",
        tab: "exams",
        href: "/frontend/pages/schooladmin?tab=exams",
        icon: FiFileText,
        permission: Permission.EXAMS,
    },
    {
        label: "Analysis",
        tab: "analysis",
        href: "/frontend/pages/schooladmin?tab=analysis",
        icon: FiBarChart2,
        permission: Permission.ANALYSIS,
    },
    {
        label: "Settings",
        tab: "settings",
        href: "/frontend/pages/schooladmin?tab=settings",
        icon: FiUser,
        permission: Permission.SETTINGS,
    },
    {
        label: "Logout",
        icon: FiLogOut,
        action: "logout",
    },
];

export const SCHOOLADMIN_TAB_TITLES: Record<string, string> = {
    dashboard: "Dashboard",
    students: "Students",
    teachers: "Teachers",
    classes: "Classes",
    "teacher-leaves": "Teacher Leaves",
    "tc-approvals": "TC Approvals",
    payments: "Payments",
    workshops: "Workshops",
    newsfeed: "Newsfeed",
    exams: "Exams",
    analysis: "Analysis",
    "student-details": "Student Details",
    "add-user": "Add User",
    "teacher-audit": "Teacher Audit",
    circulars: "Circulars",
    certificates: "Certificate Requests",
    fees: "Fees",
    settings: "Settings",
};



export const SUPERADMIN_SIDEBAR_ITEMS: SidebarItem[] = [
    {
        label: "Dashboard",
        href: "/frontend/pages/superadmin",
        tab: "dashboard",
        icon: FiHome,
        permission: Permission.DASHBOARD,
    },
    {
        label: "Add School",
        href: "/frontend/pages/superadmin?tab=addschool",
        tab: "addschool",
        icon: FiPlusCircle,
        permission: Permission.ADD_SCHOOL,
    },
    {
        label: "Schools",
        href: "/frontend/pages/superadmin?tab=schools",
        tab: "schools",
        icon: FiUsers,
        permission: Permission.SCHOOLS,
    },
    {
        label: "Fees Transactions",
        href: "/frontend/pages/superadmin?tab=transactions",
        tab: "transactions",
        icon: FiCreditCard,
        permission: Permission.FEES_TRANSACTIONS,
    },
    {
        label: "Sign Out",
        action: "logout",
        icon: FiLogOut,
        href: "#",
    },
];
