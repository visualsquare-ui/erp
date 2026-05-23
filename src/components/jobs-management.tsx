"use client";

import { useState } from "react";

import {
  createJobAction,
  deleteJobAction,
  updateJobAction,
} from "@/app/actions";
import { JobTable } from "@/components/job-table";
import type { JobRow, ClientRow, ProjectRow } from "@/types/database";

type JobsManagementProps = {
  clients: ClientRow[];
  projects: ProjectRow[];
  jobs: JobRow[];
};

export function JobsManagement({ clients, projects, jobs }: JobsManagementProps) {
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [editingJob, setEditingJob] = useState<JobRow | null>(null);

  function resetForm() {
    setFormMode("create");
    setEditingJob(null);
  }

  async function submit(formData: FormData) {
    if (formMode === "edit") {
      await updateJobAction(formData);
    } else {
      await createJobAction(formData);
    }

    resetForm();
  }

  async function deleteJob(job: JobRow) {
    const confirmed = window.confirm(
      "이 Job을 삭제할까요? 연결된 인보이스 아이템은 Job 연결이 해제될 수 있습니다.",
    );

    if (!confirmed) {
      return;
    }

    const formData = new FormData();
    formData.set("job_id", job.id);
    await deleteJobAction(formData);

    if (editingJob?.id === job.id) {
      resetForm();
    }
  }

  return (
    <section className="grid gap-6 xl:grid-cols-[22rem_minmax(0,1fr)]">
      <JobForm
        key={editingJob?.id ?? "new-job"}
        mode={formMode}
        clients={clients}
        projects={projects}
        job={editingJob ?? undefined}
        onCancel={resetForm}
        action={submit}
      />
      <JobTable
        jobs={jobs}
        onEdit={(job) => {
          setEditingJob(job);
          setFormMode("edit");
        }}
        onDelete={(job) => void deleteJob(job)}
      />
    </section>
  );
}

function JobForm({
  mode,
  clients,
  projects,
  job,
  action,
  onCancel,
}: {
  mode: "create" | "edit";
  clients: ClientRow[];
  projects: ProjectRow[];
  job?: JobRow;
  action: (formData: FormData) => Promise<void>;
  onCancel: () => void;
}) {
  return (
    <form action={action} className="ui-panel space-y-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold">
          {mode === "edit" ? "Job 수정" : "Job 추가"}
        </h2>
        {mode === "edit" ? (
          <button
            type="button"
            className="text-sm font-semibold text-[var(--muted)] hover:text-[var(--foreground)]"
            onClick={onCancel}
          >
            취소
          </button>
        ) : null}
      </div>

      {job ? <input type="hidden" name="job_id" value={job.id} /> : null}
      <Field label="Client">
        <select
          className="ui-input"
          name="client_id"
          required
          defaultValue={job?.client_id ?? ""}
        >
          <option value="">Client</option>
          {clients.map((client) => (
            <option key={client.id} value={client.id}>
              {client.company_name ?? client.name}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Project Group">
        <select
          className="ui-input"
          name="project_id"
          defaultValue={job?.project_id ?? ""}
        >
          <option value="">No project group</option>
          {projects.map((project) => (
            <option key={project.id} value={project.id}>
              {project.name}
            </option>
          ))}
        </select>
      </Field>
      <Field label="Job Name">
        <input
          className="ui-input"
          name="name"
          placeholder="Window decal, menu board..."
          autoComplete="off"
          required
          defaultValue={job?.name ?? ""}
        />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Type">
          <select
            className="ui-input"
            name="type"
            defaultValue={job?.type ?? "print"}
          >
            <option value="print">print</option>
            <option value="web">web</option>
            <option value="app">app</option>
            <option value="logo">logo</option>
            <option value="branding">branding</option>
          </select>
        </Field>
        <Field label="Status">
          <select
            className="ui-input"
            name="status"
            defaultValue={job?.status ?? "quote"}
          >
            <option value="quote">quote</option>
            <option value="in_progress">in_progress</option>
            <option value="done">done</option>
            <option value="on_hold">on_hold</option>
            <option value="canceled">canceled</option>
          </select>
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Start">
          <input
            className="ui-input"
            name="start_date"
            type="date"
            autoComplete="off"
            defaultValue={job?.start_date ?? ""}
          />
        </Field>
        <Field label="Due">
          <input
            className="ui-input"
            name="due_date"
            type="date"
            autoComplete="off"
            defaultValue={job?.due_date ?? ""}
          />
        </Field>
      </div>
      <Field label="Quote">
        <input
          className="ui-input"
          name="quote_amount"
          type="number"
          step="0.01"
          placeholder="850.00..."
          inputMode="decimal"
          defaultValue={job?.quote_amount ?? ""}
        />
      </Field>
      <Field label="Description">
        <textarea
          className="ui-input min-h-20"
          name="description"
          placeholder="Scope and delivery notes..."
          autoComplete="off"
          defaultValue={job?.description ?? ""}
        />
      </Field>
      <div className={mode === "edit" ? "grid gap-2 sm:grid-cols-2" : ""}>
        {mode === "edit" ? (
          <button
            type="button"
            className="ui-button ui-button-secondary"
            onClick={onCancel}
          >
            취소
          </button>
        ) : null}
        <button className="ui-button w-full">
          {mode === "edit" ? "저장" : "저장"}
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="ui-label">{label}</span>
      {children}
    </label>
  );
}
