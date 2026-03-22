/** School admin: open Student Details for a student and scroll to the fees block. */
export function schoolAdminStudentDetailsFeesUrl(studentId: string) {
  const p = new URLSearchParams({
    tab: "student-details",
    studentId,
    focus: "fees",
  });
  return `/frontend/pages/schooladmin?${p.toString()}`;
}
