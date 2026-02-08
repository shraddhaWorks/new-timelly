"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Pencil, Search, Trash2, User } from "lucide-react";
import { useDebounce } from "@/app/frontend/hooks/useDebounce";
import PageHeader from "../common/PageHeader";
import DataTable from "../common/TableLayout";
import PageTabs from "../schooladmin/schooladmincomponents/PageHeaderTabs";
import FilterBar from "../schooladmin/schooladmincomponents/AddUserFilters";
import SearchInput from "../common/SearchInput";
import UserForm from "./schooladmincomponents/UserForm";
import BulkImportZone from "./schooladmincomponents/BulkImportZone";
import DeleteConfirmation from "../common/DeleteConfirmation";
import UserBadge from "./schooladmincomponents/UserBadge";
import RoleBadge from "./schooladmincomponents/RoleBadge";
import StatusBadge from "./schooladmincomponents/StatusBadge";
import { IUser } from "@/app/frontend/constants/addUserTable";

export default function AddUser() {
  const searchParams = useSearchParams();
  const router = useRouter();
  // Use "view" query param for internal tabs to avoid conflict with parent "tab" param
  const activeTab = searchParams.get("view") ?? "all";

  const [users, setUsers] = useState<IUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 300);
  const [filters, setFilters] = useState({
    role: "",
    status: "",
  });
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean;
    userId: string;
    userName: string;
  }>({
    isOpen: false,
    userId: "",
    userName: "",
  });

  const editingUserId = searchParams.get("userId");
  const editingUser = users.find((u) => u.id === editingUserId);

  // Fetch users for "all" tab
  useEffect(() => {
    if (activeTab !== "all") return;

    const params = new URLSearchParams();
    params.set("page", page.toString());
    params.set("pageSize", "5");
    if (debouncedSearch) params.set("search", debouncedSearch);
    if (filters.role) params.set("role", filters.role);

    setLoading(true);
    fetch(`/api/user/all?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        setUsers(data.users);
        const totalPages = Math.ceil((data.total || 0) / (data.pageSize || 5));
        setTotalPages(totalPages);
      })
      .catch((err) => console.error("Failed to fetch users:", err))
      .finally(() => setLoading(false));
  }, [page, debouncedSearch, filters, activeTab]);

  const handleEdit = (user: IUser) => {
    router.push(`?tab=add-user&view=add&userId=${user.id}`);
  };

  const handleDeleteClick = (user: IUser) => {
    setDeleteModal({
      isOpen: true,
      userId: user.id,
      userName: user.name,
    });
  };

  const handleDeleteConfirm = async () => {
    try {
      const res = await fetch(`/api/user/${deleteModal.userId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to delete user");
      }

      // Refresh user list
      setDeleteModal({ isOpen: false, userId: "", userName: "" });
      setUsers(users.filter((u) => u.id !== deleteModal.userId));
    } catch (error) {
      throw error;
    }
  };

  // Generate table columns configuration
  const tableColumns: any[] = [
    {
      header: "USER",
      render: (row: IUser) => (
        <UserBadge name={row.name} email={row.email} imageUrl={(row as any).photoUrl} />
      ),
    },
    {
      header: "ROLE",
      render: (row: IUser) => <RoleBadge role={row.role} />,
    },
    {
      header: "STATUS",
      render: () => <StatusBadge status="active" />,
    },
    {
      header: "LAST ACTIVE",
      render: (row: IUser) => (
        <span className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">
          {row.createdAt
            ? (() => {
              const date = new Date(row.createdAt);
              const now = new Date();
              const diffMs = now.getTime() - date.getTime();
              const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

              if (diffDays === 0) return "Today";
              if (diffDays === 1) return "1 day ago";
              if (diffDays < 7) return `${diffDays} days ago`;
              if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
              return date.toLocaleDateString();
            })()
            : "N/A"}
        </span>
      ),
    },
    {
      header: "ACTIONS",
      align: "center" as const,
      render: (row: IUser) => (
        <div className="flex justify-center gap-2">
          {row.role !== "SCHOOLADMIN" && (
            <motion.button
              whileHover={{ scale: row.role === "TEACHER" ? 1.1 : 1 }}
              whileTap={{ scale: row.role === "TEACHER" ? 0.95 : 1 }}
              disabled={row.role !== "TEACHER"}
              onClick={() => row.role === "TEACHER" && handleEdit(row)}
              className={`p-2 rounded-lg transition-colors ${
                row.role === "TEACHER"
                  ? "hover:bg-white/10 text-gray-400 hover:text-white"
                  : "bg-white/5 text-gray-500/70 cursor-not-allowed"
              }`}
              title={
                row.role === "TEACHER"
                  ? "Edit user"
                  : "Editing is currently available for teachers only"
              }
            >
              <Pencil size={18} />
            </motion.button>
          )}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleDeleteClick(row)}
            className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-red-400 transition-colors"
            title="Delete user"
          >
            <Trash2 size={18} />
          </motion.button>
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="User Management"
        subtitle="Create new users, manage access, and view user directory."
        rightSlot={
          <PageTabs
            tabs={[
              { label: "All Users", value: "all" },
              { label: "Add User", value: "add" },
              // { label: "Bulk Import", value: "bulk" },
            ]}
            queryKey="view"
          />
        }
      />

      {/* ALL USERS TAB */}
      {activeTab === "all" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          {/* SEARCH & FILTERS BAR */}
          <div
            className="
            bg-white/5 backdrop-blur-xl rounded-2xl p-4 border border-white/10
            "
          >
            <div className="flex flex-col md:flex-row gap-4 md:items-center">

              {/* SEARCH */}
              <div className="flex-1">
                <SearchInput
                  value={search}
                  onChange={setSearch}
                  placeholder="Search users by name or email..."
                  variant="glass"
                  icon={Search}
                />
              </div>

              {/* FILTER */}
              <div className="w-full md:w-[220px]">
                <FilterBar
                  filters={[
                    {
                      key: "role",
                      placeholder: "All Roles",
                      options: [
                        { label: "Admin", value: "SCHOOLADMIN" },
                        { label: "Teacher", value: "TEACHER" },
                        { label: "Student", value: "STUDENT" },
                      ],
                    },
                  ]}
                  filterValues={filters}
                  onFilterChange={(key, value) =>
                    setFilters((prev) => ({ ...prev, [key]: value }))
                  }
                />
              </div>
            </div>
          </div>


          {/* USER TABLE */}
          <DataTable
            columns={tableColumns}
            data={users}
            loading={loading}
            pagination={{
              page,
              totalPages,
              onChange: setPage,
            }}
          />
        </motion.div>
      )}

      {/* ADD USER TAB */}
      {activeTab === "add" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          
        >
          <UserForm
            mode={editingUser ? "edit" : "create"}
            initialData={
              editingUser
                ? {
                    name: editingUser.name,
                    email: editingUser.email,
                    role: editingUser.role as any,
                    designation:
                      (editingUser as any).designation ??
                      (editingUser as any).subject ??
                      "",
                    username: (editingUser as any).username ?? "",
                    password: "",
                    confirmPassword: "",
                    allowedFeatures:
                      (editingUser as any).allowedFeatures ?? [],
                  }
                : undefined
            }
          />
        </motion.div>
      )}

      {/* BULK IMPORT TAB */}
      {activeTab === "bulk" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8"
        >
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-white mb-2">
              Bulk Import Users
            </h2>
            <p className="text-white/60">
              Upload a CSV or Excel file to import multiple users at once.
            </p>
          </div>
          <BulkImportZone />
        </motion.div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      <DeleteConfirmation
        isOpen={deleteModal.isOpen}
        userName={deleteModal.userName}
        onConfirm={handleDeleteConfirm}
        onCancel={() =>
          setDeleteModal({ isOpen: false, userId: "", userName: "" })
        }
      />
    </>
  );
}
