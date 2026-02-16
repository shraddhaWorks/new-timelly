import { api } from "./api.service";
import type { IStudent } from "../interfaces/student";
import type { IUpdateStudentPayload } from "../constants/student";

export const getStudents = (classId?: string) =>
  api(`/api/students${classId ? `?classId=${classId}` : ""}`);

export const addStudent = (payload: any) =>
  api("/api/student/create", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

export const uploadStudentsCSV = (file: File, classId: string) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("classId", classId);

  return fetch("/api/students/upload", {
    method: "POST",
    body: formData,
  }).then(res => res.json());
};

export const assignStudentsToClass = (studentId: string, classId: string) =>
  api("/api/student/assign-class", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ studentId, classId }),
  });


function buildUrl(path: string, params: Record<string, string | undefined>): string {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => { if (v != null && v !== "") search.set(k, v); });
  const q = search.toString();
  return q ? `${path}?${q}` : path;
}

export const studentApi = {
  getByAdmissionNo: (admissionNo: string, academicYear?: string) =>
    fetch(buildUrl("/api/school/student/by-admissionNo", { admissionNo, academicYear }))
      .then((res) => res.json()),

  updateByAdmissionNo: (admissionNo: string, updates: IUpdateStudentPayload) =>
    fetch("/api/school/student/by-admissionNo", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ admissionNo, updates }),
    }).then((res) => res.json() as Promise<{ student: IStudent }>),
};




