"use client";

import { useEffect, useMemo, useState } from "react";
import { useStudents } from "../../../hooks/useStudents";
import { addStudent, assignStudentsToClass } from "../../../services/student.service";
import { toast } from "../../../services/toast.service";
import {
  ClassItem,
  SelectOption,
  StudentFormErrors,
  StudentFormState,
  StudentRow,
} from "./types";
import { toStudentForm } from "./utils";

type Props = {
  classes?: ClassItem[];
  reload?: () => void;
};

type ClassesListResponse = {
  classes: ClassItem[];
};

type StudentsListResponse = {
  students: StudentRow[];
};

let classesCache: ClassItem[] | null = null;
let classesPromise: Promise<ClassItem[] | null> | null = null;

const preloadClasses = () => {
  if (classesCache) return Promise.resolve(classesCache);
  if (classesPromise) return classesPromise;

  classesPromise = fetch("/api/class/list")
    .then(async (res) => {
      if (!res.ok) return null;
      const data: ClassesListResponse = await res.json();
      classesCache = data.classes || [];
      return classesCache;
    })
    .catch(() => null)
    .finally(() => {
      classesPromise = null;
    });

  return classesPromise;
};

void preloadClasses();

const DEFAULT_FORM: StudentFormState = {
  name: "",
  rollNo: "",
  gender: "",
  dob: "",
  previousSchool: "",
  classId: "",
  section: "",
  status: "Active",
  fatherName: "",
  phoneNo: "",
  aadhaarNo: "",
  totalFee: "",
  discountPercent: "",
  address: "",
};

const validateForm = (
  form: StudentFormState,
  options: { requireFees: boolean; requireAadhaar: boolean; requirePhone: boolean }
): StudentFormErrors => {
  const newErrors: StudentFormErrors = {};

  if (!form.name.trim() || form.name.length < 2) {
    newErrors.name = "Student name must be at least 2 characters";
  }

  if (!form.fatherName.trim() || form.fatherName.length < 2) {
    newErrors.fatherName = "Parent name must be at least 2 characters";
  }

  if (options.requireAadhaar && !/^\d{12}$/.test(form.aadhaarNo)) {
    newErrors.aadhaarNo = "Aadhaar number must be exactly 12 digits";
  }

  if (options.requirePhone && !/^\d{10}$/.test(form.phoneNo)) {
    newErrors.phoneNo = "Phone number must be exactly 10 digits";
  }

  if (!form.dob || new Date(form.dob) >= new Date()) {
    newErrors.dob = "Please enter a valid date of birth";
  }

  if (options.requireFees) {
    if (!form.totalFee || Number(form.totalFee) <= 0) {
      newErrors.totalFee = "Total fee must be a positive number";
    }

    if (
      form.discountPercent &&
      (Number(form.discountPercent) < 0 || Number(form.discountPercent) > 100)
    ) {
      newErrors.discountPercent = "Discount must be between 0 and 100";
    }
  }

  if (form.address && form.address.length < 5) {
    newErrors.address = "Address must be at least 5 characters";
  }

  return newErrors;
};

export default function useStudentPage({ classes = [], reload }: Props) {
  const [availableClasses, setAvailableClasses] = useState<ClassItem[]>(
    classes.length ? classes : classesCache ?? []
  );
  const [selectedClass, setSelectedClass] = useState("");
  const [selectedSection, setSelectedSection] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [showUploadPanel, setShowUploadPanel] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState<StudentFormState>(DEFAULT_FORM);
  const [errors, setErrors] = useState<StudentFormErrors>({});
  const [saving, setSaving] = useState(false);

  const { students, loading, refresh } = useStudents(selectedClass);
  const [allStudents, setAllStudents] = useState<StudentRow[]>([]);
  const [allLoading, setAllLoading] = useState(false);

  const [viewStudent, setViewStudent] = useState<StudentRow | null>(null);
  const [editStudent, setEditStudent] = useState<StudentRow | null>(null);
  const [deleteStudent, setDeleteStudent] = useState<StudentRow | null>(null);
  const [editForm, setEditForm] = useState<StudentFormState>(DEFAULT_FORM);
  const [editErrors, setEditErrors] = useState<StudentFormErrors>({});
  const [editSaving, setEditSaving] = useState(false);

  useEffect(() => {
    if (classes && classes.length) {
      setAvailableClasses(classes);
    }
  }, [classes]);

  useEffect(() => {
    if (classes && classes.length) return;

    if (classesCache?.length) {
      setAvailableClasses(classesCache);
    }

    let active = true;
    preloadClasses().then((data) => {
      if (!active || !data) return;
      setAvailableClasses(data);
    });

    return () => {
      active = false;
    };
  }, [classes]);

  useEffect(() => {
    if (!form.classId && selectedClass) {
      setForm((prev) => ({ ...prev, classId: selectedClass }));
    }
  }, [selectedClass, form.classId]);

  const fetchAllStudents = async () => {
    setAllLoading(true);
    try {
      const res = await fetch("/api/student/list");
      const data: StudentsListResponse = await res.json();
      if (!res.ok) return;
      setAllStudents(data.students || []);
    } catch {
      // ignore
    } finally {
      setAllLoading(false);
    }
  };

  useEffect(() => {
    if (!selectedClass) {
      fetchAllStudents();
    }
  }, [selectedClass]);

  const filterClassOptions = useMemo<SelectOption[]>(
    () => [
      { label: "All Classes", value: "" },
      ...availableClasses.map((item) => ({
        label: `${item.name}${item.section ? ` - ${item.section}` : ""}`,
        value: item.id,
      })),
    ],
    [availableClasses]
  );

  const filterSectionOptions = useMemo<SelectOption[]>(() => {
    const sections = Array.from(
      new Set(availableClasses.map((item) => item.section).filter(Boolean))
    ) as string[];
    return [
      { label: "All Sections", value: "" },
      ...sections.map((section) => ({ label: section, value: section })),
    ];
  }, [availableClasses]);

  const formClassOptions = useMemo<SelectOption[]>(
    () => [
      { label: "Select Class", value: "" },
      ...availableClasses.map((item) => ({
        label: `${item.name}${item.section ? ` - ${item.section}` : ""}`,
        value: item.id,
      })),
    ],
    [availableClasses]
  );

  const formSectionOptions = useMemo<SelectOption[]>(() => {
    const sections = Array.from(
      new Set(availableClasses.map((item) => item.section).filter(Boolean))
    ) as string[];
    return [
      { label: "Select Section", value: "" },
      ...sections.map((section) => ({ label: section, value: section })),
    ];
  }, [availableClasses]);

  const filteredStudents = useMemo<StudentRow[]>(() => {
    let list: StudentRow[] = selectedClass ? students : allStudents;
    if (selectedSection) {
      list = list.filter((student) => student.class?.section === selectedSection);
    }
    if (searchQuery.trim()) {
      const query = searchQuery.trim().toLowerCase();
      list = list.filter((student) => {
        const name = student.user?.name || student.name || "";
        const email = student.user?.email || student.email || "";
        const roll = student.rollNo || "";
        const phone = student.phoneNo || "";
        return (
          name.toLowerCase().includes(query) ||
          email.toLowerCase().includes(query) ||
          roll.toLowerCase().includes(query) ||
          phone.toLowerCase().includes(query)
        );
      });
    }
    return list;
  }, [allStudents, searchQuery, selectedClass, selectedSection, students]);

  const selectedClassObj = availableClasses.find((item) => item.id === selectedClass);

  const handleFormChange = (key: keyof StudentFormState, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const handleEditChange = (key: keyof StudentFormState, value: string) => {
    setEditForm((prev) => ({ ...prev, [key]: value }));
    setEditErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const handleSaveStudent = async () => {
    const nextErrors = validateForm(form, {
      requireFees: true,
      requireAadhaar: true,
      requirePhone: true,
    });
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    if (!form.classId) {
      toast.error("Please select a class for this student");
      return;
    }

    try {
      setSaving(true);
      const res: Response = await addStudent({
        name: form.name,
        fatherName: form.fatherName,
        aadhaarNo: form.aadhaarNo,
        phoneNo: form.phoneNo,
        dob: form.dob,
        classId: form.classId,
        address: form.address || undefined,
        totalFee: Number(form.totalFee),
        discountPercent: form.discountPercent
          ? Number(form.discountPercent)
          : 0,
        rollNo: form.rollNo || undefined,
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Failed to add student");
        return;
      }

      const assignRes: Response = await assignStudentsToClass(
        data.student.id,
        form.classId
      );
      const assignData = await assignRes.json();

      if (!assignRes.ok) {
        toast.error(assignData.message || "Failed to assign student to class");
        return;
      }

      toast.success("Student added successfully");
      setForm({ ...DEFAULT_FORM, classId: form.classId });
      setShowAddForm(false);
      refresh();
      if (!selectedClass) {
        fetchAllStudents();
      }
      reload?.();
    } catch {
      toast.error("Something went wrong while adding student");
    } finally {
      setSaving(false);
    }
  };

  const handleUpload = async () => {
    if (!selectedClass) {
      toast.error("Please select a class first");
      return;
    }

    if (!uploadFile) {
      toast.error("Please select a CSV file");
      return;
    }

    try {
      setUploading(true);

      const formData = new FormData();
      formData.append("file", uploadFile);

      const uploadRes = await fetch("/api/student/bulk-upload", {
        method: "POST",
        body: formData,
      });

      const uploadData = await uploadRes.json();

      if (!uploadRes.ok) {
        toast.error(uploadData.message || "Bulk upload failed");
        return;
      }

      const studentsRes = await fetch("/api/student/list");
      const studentsData: StudentsListResponse = await studentsRes.json();

      if (!studentsRes.ok || !Array.isArray(studentsData.students)) {
        toast.error("Failed to fetch students");
        return;
      }

      const unassignedStudents = studentsData.students.filter(
        (student) => !student.class
      );

      for (const student of unassignedStudents) {
        const assignRes = await assignStudentsToClass(
          student.id,
          selectedClass
        );
        const assignData = await assignRes.json();
        if (!assignRes.ok) {
          const name = student.user?.name || student.name || "";
          toast.error(assignData.message || `Failed to assign student ${name}`);
          return;
        }
      }

      toast.success(
        `${uploadData.createdCount} students added & assigned successfully`
      );
      setUploadFile(null);
      setShowUploadPanel(false);
      refresh();
      if (!selectedClass) {
        fetchAllStudents();
      }
      reload?.();
    } catch {
      toast.error("Something went wrong during bulk upload");
    } finally {
      setUploading(false);
    }
  };

  const openView = (student: StudentRow) => setViewStudent(student);

  const openEdit = (student: StudentRow) => {
    setShowAddForm(false);
    setShowUploadPanel(false);
    setEditStudent(student);
    setEditForm(toStudentForm(student));
    setEditErrors({});
  };

  const openDelete = (student: StudentRow) => setDeleteStudent(student);

  const closeView = () => setViewStudent(null);
  const closeEdit = () => setEditStudent(null);
  const closeDelete = () => setDeleteStudent(null);

  const handleEditSave = () => {
    const nextErrors = validateForm(editForm, {
      requireFees: false,
      requireAadhaar: false,
      requirePhone: false,
    });
    setEditErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    setEditSaving(true);
    setTimeout(() => {
      toast.success("Student updated (UI only)");
      setEditSaving(false);
      closeEdit();
    }, 300);
  };

  const handleDelete = () => {
    toast.success("Student deleted (UI only)");
    closeDelete();
  };

  return {
    filterClassOptions,
    filterSectionOptions,
    formClassOptions,
    formSectionOptions,
    selectedClass,
    setSelectedClass,
    selectedSection,
    setSelectedSection,
    searchQuery,
    setSearchQuery,
    showAddForm,
    setShowAddForm,
    showUploadPanel,
    setShowUploadPanel,
    uploadFile,
    setUploadFile,
    uploading,
    handleUpload,
    form,
    errors,
    saving,
    handleFormChange,
    handleSaveStudent,
    filteredStudents,
    tableLoading: selectedClass ? loading : allLoading,
    selectedClassObj,
    viewStudent,
    editStudent,
    deleteStudent,
    editForm,
    editErrors,
    editSaving,
    handleEditChange,
    openView,
    openEdit,
    openDelete,
    closeView,
    closeEdit,
    closeDelete,
    handleEditSave,
    handleDelete,
    handleDownloadReport: () => toast.info("Downloading report..."),
  };
}
