'use client';
import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { settingsApi } from '@/lib/api';
import { Save, Globe, Search, Mail } from 'lucide-react';
import toast from 'react-hot-toast';

const settingGroups = [
  {
    title: 'General',
    icon: Globe,
    fields: [
      { key: 'site_name', label: 'Site Name', type: 'text' },
      { key: 'site_description', label: 'Site Description', type: 'text' },
      { key: 'contact_email', label: 'Contact Email', type: 'email' },
      { key: 'site_logo', label: 'Logo URL', type: 'text' },
    ],
  },
  {
    title: 'SEO',
    icon: Search,
    fields: [
      { key: 'meta_title', label: 'Default Meta Title', type: 'text' },
      { key: 'meta_description', label: 'Default Meta Description', type: 'textarea' },
      { key: 'meta_keywords', label: 'Default Keywords', type: 'text' },
      { key: 'google_analytics', label: 'Google Analytics ID', type: 'text' },
      { key: 'google_site_verification', label: 'Google Site Verification', type: 'text' },
    ],
  },
  {
    title: 'Social & Email',
    icon: Mail,
    fields: [
      { key: 'twitter_handle', label: 'Twitter Handle', type: 'text' },
      { key: 'facebook_url', label: 'Facebook URL', type: 'text' },
      { key: 'instagram_url', label: 'Instagram URL', type: 'text' },
      { key: 'smtp_host', label: 'SMTP Host', type: 'text' },
      { key: 'smtp_port', label: 'SMTP Port', type: 'text' },
      { key: 'smtp_user', label: 'SMTP User', type: 'text' },
    ],
  },
];

export default function AdminSettingsPage() {
  const [values, setValues] = useState<Record<string, string>>({});

  const { data: settings, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: () => settingsApi.get().then(r => r.data),
  });

  useEffect(() => {
    if (settings) setValues(settings);
  }, [settings]);

  const saveMutation = useMutation({
    mutationFn: () => settingsApi.update(values),
    onSuccess: () => toast.success('Settings saved!'),
    onError: () => toast.error('Failed to save'),
  });

  if (isLoading) return <div className="text-muted-foreground">Loading settings...</div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Site Settings</h1>
        <button
          onClick={() => saveMutation.mutate()}
          disabled={saveMutation.isPending}
          className="flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground font-semibold rounded-xl text-sm hover:bg-primary/90 disabled:opacity-50"
        >
          <Save className="h-4 w-4" />
          {saveMutation.isPending ? 'Saving...' : 'Save All Settings'}
        </button>
      </div>

      <div className="space-y-6">
        {settingGroups.map(group => (
          <div key={group.title} className="bg-card border border-border rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-5">
              <group.icon className="h-5 w-5 text-primary" />
              <h2 className="font-bold">{group.title}</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {group.fields.map(field => (
                <div key={field.key} className={field.type === 'textarea' ? 'md:col-span-2' : ''}>
                  <label className="text-sm font-medium block mb-1.5">{field.label}</label>
                  {field.type === 'textarea' ? (
                    <textarea
                      value={values[field.key] || ''}
                      onChange={e => setValues(p => ({ ...p, [field.key]: e.target.value }))}
                      rows={3}
                      className="w-full px-3 py-2 border border-input rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                    />
                  ) : (
                    <input
                      type={field.type}
                      value={values[field.key] || ''}
                      onChange={e => setValues(p => ({ ...p, [field.key]: e.target.value }))}
                      className="w-full px-3 py-2 border border-input rounded-lg bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
