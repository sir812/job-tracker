import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useJobs } from "../context/JobContext";
import { useToasts } from "../context/ToastContext";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Modal } from "../components/ui/Modal";
import { Input } from "../components/ui/Input";
import { Select } from "../components/ui/Select";
import { Textarea } from "../components/ui/Textarea";
import {
  BriefcaseBusiness,
  Search,
  Plus,
  Trash2,
  Edit2,
  ExternalLink,
  Info,
} from "lucide-react";
import { Job } from "../data/mockData";

// Validation schema for Adding & Editing Job entries
const jobSchema = z.object({
  company: z.string().min(2, "Company name is required"),
  role: z.string().min(2, "Job role is required"),
  status: z.enum(["Saved", "Applied", "Interview", "Offer", "Rejected"]),
  salary: z.string().optional(),
  location: z.string().min(2, "Location is required"),
  notes: z.string().optional(),
  priority: z.enum(["Low", "Medium", "High"]),
  dateApplied: z.string().optional(),
  jobLink: z.string().url("Please enter a valid URL").or(z.literal("")),
});

type JobFormValues = z.infer<typeof jobSchema>;

export const Jobs: React.FC = () => {
  const { jobs, createJob, updateJob, deleteJob } = useJobs();
  const { success, error } = useToasts();

  // Dialog and panel views
  const [addOpen, setAddOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);

  const [activeJob, setActiveJob] = useState<Job | null>(null);

  // Filter States
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [priorityFilter, setPriorityFilter] = useState("All");

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<JobFormValues>({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      status: "Applied",
      priority: "Medium",
    },
  });

  // Filtering logic
  const filteredJobs = jobs.filter((job) => {
    const matchesSearch =
      job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "All" || job.status === statusFilter;
    const matchesPriority = priorityFilter === "All" || job.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  const handleOpenAdd = () => {
    reset({
      company: "",
      role: "",
      status: "Applied",
      salary: "",
      location: "",
      notes: "",
      priority: "Medium",
      dateApplied: new Date().toISOString().split("T")[0],
      jobLink: "",
    });
    setAddOpen(true);
  };

  const handleOpenEdit = (job: Job) => {
    setActiveJob(job);
    reset({
      company: job.company,
      role: job.role,
      status: job.status,
      salary: job.salary,
      location: job.location,
      notes: job.notes,
      priority: job.priority,
      dateApplied: job.dateApplied,
      jobLink: job.jobLink,
    });
    setEditOpen(true);
  };

  const handleOpenDelete = (job: Job) => {
    setActiveJob(job);
    setDeleteOpen(true);
  };

  const handleOpenDetail = (job: Job) => {
    setActiveJob(job);
    setDetailOpen(true);
  };

  const onAddSubmit = async (data: JobFormValues) => {
    try {
      await createJob({
        ...data,
        tags: ["React", "Remote"], // Mock tags
        salary: data.salary || "",
        dateApplied: data.dateApplied || "",
        jobLink: data.jobLink || "",
        notes: data.notes || "",
      });
      success("Job opportunity added!", "Success");
      setAddOpen(false);
    } catch (e) {
      error("Failed to add job entry", "Error");
    }
  };

  const onEditSubmit = async (data: JobFormValues) => {
    if (!activeJob) return;
    try {
      await updateJob(activeJob.id, {
        ...data,
        salary: data.salary || "",
        dateApplied: data.dateApplied || "",
        jobLink: data.jobLink || "",
        notes: data.notes || "",
      });
      success("Job details updated!", "Success");
      setEditOpen(false);
    } catch (e) {
      error("Failed to update job details", "Error");
    }
  };

  const onDeleteConfirm = async () => {
    if (!activeJob) return;
    try {
      await deleteJob(activeJob.id);
      success("Job entry removed!", "Success");
      setDeleteOpen(false);
    } catch (e) {
      error("Failed to delete job entry", "Error");
    }
  };

  return (
    <div className="flex flex-col gap-6 select-none">
      {/* Header */}
      <div className="flex items-center justify-between select-none">
        <div>
          <h2 className="text-2xl font-bold text-black dark:text-white tracking-tight">Job Applications</h2>
          <p className="text-xs text-black dark:text-white mt-1">Track and manage your applications details</p>
        </div>
        <Button onClick={handleOpenAdd} icon={<Plus className="w-4 h-4" />}>
          Add Job
        </Button>
      </div>

      {/* Filter and Search Panel */}
      <Card className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4.5 bg-slate-50 dark:bg-black/60">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-black absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none dark:text-white" />
          <input
            type="text"
            placeholder="Search company, role, or location..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-white dark:bg-black border border-slate-200 dark:border-neutral-800 focus:border-cyan-500/40 rounded-full pl-10 pr-4 py-2.5 text-xs text-black dark:text-white placeholder-slate-400 dark:placeholder-neutral-500 focus:outline-none focus:ring-4 focus:ring-cyan-500/5 transition-all"
          />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold text-black dark:text-white">Status</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              aria-label="Filter by status"
              title="Filter by status"
              className="bg-white dark:bg-black border border-slate-200 dark:border-neutral-800 rounded-xl px-3 py-1.5 text-xs font-semibold text-black dark:text-white focus:outline-none"
            >
              <option value="All">All</option>
              <option value="Saved">Saved</option>
              <option value="Applied">Applied</option>
              <option value="Interview">Interview</option>
              <option value="Offer">Offer</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold text-black dark:text-white">Priority</span>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              aria-label="Filter by priority"
              title="Filter by priority"
              className="bg-white dark:bg-black border border-slate-200 dark:border-neutral-800 rounded-xl px-3 py-1.5 text-xs font-semibold text-black dark:text-white focus:outline-none"
            >
              <option value="All">All</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Jobs Table Grid */}
      <Card className="p-0 overflow-hidden">
        {filteredJobs.length === 0 ? (
          <div className="py-16 text-center flex flex-col items-center gap-3">
            <BriefcaseBusiness className="w-10 h-10 text-black animate-pulse" />
            <h4 className="font-semibold text-black dark:text-white">No applications matching filters</h4>
            <p className="text-xs text-black dark:text-white">Try modifying search term or filters to reveal listings</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-100 dark:bg-black/70 border-b border-slate-200 dark:border-neutral-800 text-black dark:text-black font-bold text-xs uppercase tracking-wider">
                <tr>
                  <th className="px-6 py-3.5">Company</th>
                  <th className="px-6 py-3.5">Role</th>
                  <th className="px-6 py-3.5">Location</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5">Priority</th>
                  <th className="px-6.5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-neutral-800">
                {filteredJobs.map((job) => (
                  <tr key={job.id} className="hover:bg-slate-50 dark:hover:bg-black/60 transition-colors group">
                    <td className="px-6 py-4.5 font-bold text-black dark:text-white">{job.company}</td>
                    <td className="px-6 py-4.5 text-slate-350 dark:text-white">{job.role}</td>
                    <td className="px-6 py-4.5 text-black dark:text-white text-xs font-medium">{job.location}</td>
                    <td className="px-6 py-4.5">
                      <Badge variant="status">{job.status}</Badge>
                    </td>
                    <td className="px-6 py-4.5">
                      <Badge variant="priority">{job.priority}</Badge>
                    </td>
                    <td className="px-6 py-4.5 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenDetail(job)}
                          className="text-black hover:text-cyan-400 p-1.5 hover:bg-neutral-900 rounded-lg transition-colors cursor-pointer"
                          title="View Info"
                        >
                          <Info className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenEdit(job)}
                          className="text-black hover:text-black dark:hover:text-white p-1.5 hover:bg-slate-100 dark:hover:bg-neutral-900 rounded-lg transition-colors cursor-pointer"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenDelete(job)}
                          className="text-black hover:text-rose-400 p-1.5 hover:bg-neutral-900 rounded-lg transition-colors cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Add Job Modal */}
      <Modal isOpen={addOpen} onClose={() => setAddOpen(false)} title="Add Application Entry" size="md">
        <form onSubmit={handleSubmit(onAddSubmit)} className="flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input {...register("company")} label="Company Name" placeholder="Google" error={errors.company?.message} required />
            <Input {...register("role")} label="Job Role" placeholder="Software Engineer" error={errors.role?.message} required />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Select
              {...register("status")}
              label="Application Status"
              options={[
                { label: "Saved", value: "Saved" },
                { label: "Applied", value: "Applied" },
                { label: "Interview", value: "Interview" },
                { label: "Offer", value: "Offer" },
                { label: "Rejected", value: "Rejected" },
              ]}
              error={errors.status?.message}
            />
            <Select
              {...register("priority")}
              label="Priority"
              options={[
                { label: "Low", value: "Low" },
                { label: "Medium", value: "Medium" },
                { label: "High", value: "High" },
              ]}
              error={errors.priority?.message}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Input {...register("location")} label="Location" placeholder="Mountain View, CA" error={errors.location?.message} required />
            <Input {...register("salary")} label="Salary Estimate" placeholder="$150,000 - $180,000" error={errors.salary?.message} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Input {...register("dateApplied")} label="Date Applied" type="date" error={errors.dateApplied?.message} />
            <Input {...register("jobLink")} label="Job Listing URL" placeholder="https://careers.google.com/..." error={errors.jobLink?.message} />
          </div>

          <Textarea {...register("notes")} label="Notes / Checklist" placeholder="Reference interview dates, salary breakdown..." error={errors.notes?.message} />

          <div className="flex justify-end gap-3 border-t border-slate-850 pt-4 mt-2">
            <Button variant="ghost" size="sm" type="button" onClick={() => setAddOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Create Entry
            </Button>
          </div>
        </form>
      </Modal>

      {/* Edit Job Modal */}
      <Modal isOpen={editOpen} onClose={() => setEditOpen(false)} title="Edit Job Details" size="md">
        <form onSubmit={handleSubmit(onEditSubmit)} className="flex flex-col gap-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input {...register("company")} label="Company Name" placeholder="Google" error={errors.company?.message} required />
            <Input {...register("role")} label="Job Role" placeholder="Software Engineer" error={errors.role?.message} required />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Select
              {...register("status")}
              label="Application Status"
              options={[
                { label: "Saved", value: "Saved" },
                { label: "Applied", value: "Applied" },
                { label: "Interview", value: "Interview" },
                { label: "Offer", value: "Offer" },
                { label: "Rejected", value: "Rejected" },
              ]}
              error={errors.status?.message}
            />
            <Select
              {...register("priority")}
              label="Priority"
              options={[
                { label: "Low", value: "Low" },
                { label: "Medium", value: "Medium" },
                { label: "High", value: "High" },
              ]}
              error={errors.priority?.message}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Input {...register("location")} label="Location" placeholder="Mountain View, CA" error={errors.location?.message} required />
            <Input {...register("salary")} label="Salary Estimate" placeholder="$150,000 - $180,000" error={errors.salary?.message} />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Input {...register("dateApplied")} label="Date Applied" type="date" error={errors.dateApplied?.message} />
            <Input {...register("jobLink")} label="Job Listing URL" placeholder="https://careers.google.com/..." error={errors.jobLink?.message} />
          </div>

          <Textarea {...register("notes")} label="Notes / Checklist" placeholder="Reference interview dates, salary breakdown..." error={errors.notes?.message} />

          <div className="flex justify-end gap-3 border-t border-slate-850 pt-4 mt-2">
            <Button variant="ghost" size="sm" type="button" onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" type="submit">
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal isOpen={deleteOpen} onClose={() => setDeleteOpen(false)} title="Confirm Deletion" size="sm">
        <div className="flex flex-col gap-4 select-none">
          <p className="text-sm text-black leading-relaxed">
            Are you sure you want to remove the job entry for <strong className="text-slate-100">{activeJob?.role}</strong> at <strong className="text-slate-100">{activeJob?.company}</strong>? This will also remove any related interview schedule items.
          </p>
          <div className="flex justify-end gap-3 border-t border-slate-850 pt-4">
            <Button variant="ghost" size="sm" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button variant="danger" size="sm" onClick={onDeleteConfirm}>
              Remove
            </Button>
          </div>
        </div>
      </Modal>

      {/* Job Details Drawer (implemented as modal for portability) */}
      <Modal isOpen={detailOpen} onClose={() => setDetailOpen(false)} title="Job Opportunity Information" size="sm">
        {activeJob && (
          <div className="flex flex-col gap-5 select-none">
            <div>
              <span className="text-xs uppercase font-bold text-black tracking-wider">
                {activeJob.company}
              </span>
              <h4 className="text-lg font-bold text-slate-100 mt-1">{activeJob.role}</h4>
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge variant="status">{activeJob.status}</Badge>
              <Badge variant="priority">{activeJob.priority}</Badge>
            </div>

            <div className="space-y-3.5 border-t border-slate-850 pt-4 text-xs font-semibold text-black">
              <p>📍 Location: <span className="text-black">{activeJob.location}</span></p>
              {activeJob.salary && <p>💰 Salary: <span className="text-black">{activeJob.salary}</span></p>}
              {activeJob.dateApplied && <p>📅 Date Applied: <span className="text-black">{activeJob.dateApplied}</span></p>}
              {activeJob.jobLink && (
                <div className="flex items-center gap-2 pt-1.5">
                  <ExternalLink className="w-4 h-4 text-cyan-400 shrink-0" />
                  <a href={activeJob.jobLink} target="_blank" rel="noreferrer" className="text-cyan-400 hover:text-cyan-300 hover:underline truncate">
                    Listing Link
                  </a>
                </div>
              )}
            </div>

            {activeJob.notes && (
              <div className="border-t border-slate-850 pt-4 mt-1 flex flex-col gap-2">
                <h5 className="text-[10px] uppercase font-bold text-black">Notes Log</h5>
                <p className="text-xs text-slate-350 leading-relaxed bg-slate-900 p-3.5 rounded-xl border border-slate-850 italic">
                  "{activeJob.notes}"
                </p>
              </div>
            )}

            <div className="flex justify-end border-t border-slate-850 pt-4 mt-2">
              <Button size="sm" onClick={() => setDetailOpen(false)}>
                Close Info
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
export default Jobs;
