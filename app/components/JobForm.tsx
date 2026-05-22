'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { api } from '@/lib/api';

type Props = {
  initialData?: any | null;
  onSaved?: (job: any) => void;
  onCancel?: () => void;
};

export default function JobForm({ initialData = null, onSaved, onCancel }: Props) {
  const { register, handleSubmit, reset } = useForm({ defaultValues: initialData ?? {} });
  const [saving, setSaving] = useState(false);

  useEffect(() => reset(initialData ?? {}), [initialData, reset]);

  const onSubmit = async (values: any) => {
    try {
      setSaving(true);
      if (initialData?.id) {
        const { data } = await api.put(`/api/jobs/${initialData.id}`, values);
        onSaved?.(data.job ?? data);
      } else {
        const { data } = await api.post('/api/jobs', values);
        onSaved?.(data.job ?? data);
      }
    } catch (err) {
      console.error(err);
      alert('Error saving job');
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
      <div>
        <label className="block text-sm text-slate-200">Title</label>
        <input className="w-full rounded-md bg-slate-800 px-3 py-2 text-white" {...register('title', { required: true })} />
      </div>
      <div>
        <label className="block text-sm text-slate-200">Company</label>
        <input className="w-full rounded-md bg-slate-800 px-3 py-2 text-white" {...register('company')} />
      </div>
      <div>
        <label className="block text-sm text-slate-200">Location</label>
        <input className="w-full rounded-md bg-slate-800 px-3 py-2 text-white" {...register('location')} />
      </div>
      <div>
        <label className="block text-sm text-slate-200">Status</label>
        <select className="w-full rounded-md bg-slate-800 px-3 py-2 text-white" {...register('status')}>
          <option value="Applied">Applied</option>
          <option value="Interview">Interview</option>
          <option value="Offer">Offer</option>
          <option value="Rejected">Rejected</option>
          <option value="Saved">Saved</option>
        </select>
      </div>
      <div className="flex gap-2">
        <button type="submit" disabled={saving} className="rounded-md bg-white px-4 py-2 text-slate-900">{saving ? 'Saving...' : 'Save'}</button>
        {initialData ? (
          <button type="button" onClick={onCancel} className="rounded-md border border-white/10 px-4 py-2 text-slate-200">Cancel</button>
        ) : null}
      </div>
    </form>
  );
}
