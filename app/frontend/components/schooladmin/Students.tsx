"use client";

import { useEffect, useMemo, useState } from "react";
import DataTable from "../common/TableLayout";
import PageHeader from "../common/PageHeader";
import StudentFilters from "./students/StudentFilters";
import UploadCsvPanel from "./students/UploadCsvPanel";
import AddStudentForm from "./students/AddStudentForm";
import StudentDetailsModal from "./students/StudentDetailsModal";
import StudentEditPanel from "./students/StudentEditPanel";
import DeleteConfirmation from "../common/DeleteConfirmation";
import { buildStudentColumns } from "./students/studentColumns";
import useStudentPage from "./students/useStudentPage";
import { getAge } from "./students/utils";
import { ClassItem } from "./students/types";
import SuccessPopups from "../common/SuccessPopUps";

type Props = {
  classes?: ClassItem[];
  reload?: () => void;
};

export default function StudentsManagementPage({ classes = [], reload }: Props) {
  const page = useStudentPage({ classes, reload });
  const [tablePage, setTablePage] = useState(1);
  const pageSize = 5;
  const totalPages = Math.max(
    1,
    Math.ceil(page.filteredStudents.length / pageSize)
  );
  const safePage = Math.min(tablePage, totalPages);
  const pagedStudents = useMemo(
    () =>
      page.filteredStudents.slice(
        (safePage - 1) * pageSize,
        safePage * pageSize
      ),
    [page.filteredStudents, safePage]
  );

  useEffect(() => {
    setTablePage(1);
  }, [page.searchQuery, page.selectedClass, page.selectedSection]);

  const columns = buildStudentColumns({
    onView: page.openView,
    onEdit: page.openEdit,
    onDelete: page.openDelete,
  });

  return (
    <>
      <PageHeader
        title="Students Management"
        subtitle="Manage all student records"
        className="bg-white/5 backdrop-blur-xl rounded-2xl p-4 md:p-6 shadow-lg border border-white/10"
      />
      <div className="mx-auto w-full max-w-none xl:max-w-7xl space-y-4 md:space-y-6 text-gray-200 pb-12">
        <StudentFilters
          classOptions={page.filterClassOptions}
          sectionOptions={page.filterSectionOptions}
          selectedClass={page.selectedClass}
          onClassChange={page.setSelectedClass}
          selectedSection={page.selectedSection}
          onSectionChange={page.setSelectedSection}
          searchQuery={page.searchQuery}
          onSearchChange={page.setSearchQuery}
          showAddForm={page.showAddForm}
          onToggleAddForm={() => page.setShowAddForm((prev) => !prev)}
          onToggleUpload={() => page.setShowUploadPanel((prev) => !prev)}
          onDownloadReport={page.handleDownloadReport}
        />

        {page.showUploadPanel && (
          <UploadCsvPanel
            uploadFile={page.uploadFile}
            onFileChange={page.setUploadFile}
            uploading={page.uploading}
            onCancel={() => page.setShowUploadPanel(false)}
            onUpload={page.handleUpload}
          />
        )}

        {page.editStudent && (
          <StudentEditPanel
            form={page.editForm}
            classOptions={page.formClassOptions}
            sectionOptions={page.formSectionOptions}
            saving={page.editSaving}
            studentName={
              page.editStudent.user?.name || page.editStudent.name || "Student"
            }
            onFieldChange={page.handleEditChange}
            onClose={page.closeEdit}
            onSave={page.handleEditSave}
          />
        )}

        {page.showAddForm && (
          <AddStudentForm
            form={page.form}
            errors={page.errors}
            classOptions={page.formClassOptions}
            sectionOptions={page.formSectionOptions}
            classesLoading={page.classesLoading}
            ageLabel={getAge(page.form.dob)}
            saving={page.saving}
            onFieldChange={page.handleFormChange}
            onCancel={() => page.setShowAddForm(false)}
            onReset={page.handleResetForm}
            onSave={page.handleSaveStudent}
          />
        )}

        <DataTable
          columns={columns}
          data={pagedStudents}
          loading={page.tableLoading}
          emptyText="No students found"
          tableTitle={`All Students (${page.filteredStudents.length})`}
          tableSubtitle={
            page.selectedClass
              ? `Class ${page.selectedClass}${page.selectedSection ? ` ${page.selectedSection}` : ""}`
              : undefined
          }
          showMobile={false}
          forceTableOnMobile
          pagination={{
            page: safePage,
            totalPages,
            onChange: setTablePage,
          }}
        />
      </div>

      {page.viewStudent && (
        <StudentDetailsModal
          student={page.viewStudent}
          onClose={page.closeView}
          onEdit={() => {
            if (!page.viewStudent) return;
            page.openEdit(page.viewStudent);
            page.closeView();
          }}
        />
      )}

      <DeleteConfirmation
        isOpen={!!page.deleteStudent}
        userName={
          page.deleteStudent?.user?.name ||
          page.deleteStudent?.name ||
          "this student"
        }
        onCancel={page.closeDelete}
        onConfirm={async () => {
          await page.handleDelete();
        }}
      />

      <SuccessPopups
        open={page.showSuccess}
        title="Student Added Successfully"
        description="The student has been added and assigned to the class."
        onClose={() => page.setShowSuccess(false)}
      />

    </>
  );
}
