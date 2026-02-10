"use client";

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
import StudentMobileCard from "./students/StudentMobileCard";
import SuccessPopups from "../common/SuccessPopUps";

type Props = {
  classes?: ClassItem[];
  reload?: () => void;
};

export default function StudentsManagementPage({ classes = [], reload }: Props) {
  const page = useStudentPage({ classes, reload });
  const columns = buildStudentColumns({
    onView: page.openView,
    onEdit: page.openEdit,
    onDelete: page.openDelete,
  });

  return (
    <>
      <PageHeader
        title="Students"
        subtitle="Manage all student records"
        className="bg-white/5 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-white/10"
      />
      <div className="max-w-7xl mx-auto space-y-6 text-gray-200 pb-12">
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

        <div>
          <div className="md:hidden mb-4 bg-transparent backdrop-blur-lg">
            <div className="font-bold text-gray-100 text-lg ">
              All Students ({page.filteredStudents.length})
            </div>
            <div className="text-xs text-white/50">
              {page.selectedClass
                ? `Class ${page.selectedClass}${page.selectedSection ? ` ${page.selectedSection}` : ""}`
                : "All Classes"}
            </div>
          </div>

          <div className="md:hidden space-y-4">
            {page.filteredStudents.map((student, index) => (
              <StudentMobileCard
                key={student.id}
                student={student}
                index={index}
                onView={page.openView}
                onEdit={page.openEdit}
                onDelete={page.openDelete}
              />
            ))}
            {page.filteredStudents.length === 0 && !page.tableLoading && (
              <div className="text-center text-white/60 py-6">
                No students found
              </div>
            )}
          </div>

          <div className="hidden md:block">
            <DataTable
              columns={columns}
              data={page.filteredStudents}
              loading={page.tableLoading}
              emptyText="No students found"
              tableTitle={`All Students (${page.filteredStudents.length})`}
              tableSubtitle={
                page.selectedClass
                  ? `Class ${page.selectedClass}${page.selectedSection ? ` ${page.selectedSection}` : ""}`
                  : undefined
              }
            />
          </div>
        </div>
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
