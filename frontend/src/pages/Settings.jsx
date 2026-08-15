import { useState, useEffect } from 'react';
import axios from '../api/axios';
import { useQuery } from '@tanstack/react-query';
import { Save, Loader2, Plus, Trash2 } from 'lucide-react';

const fetchSettings = async () => {
  const { data } = await axios.get('/settings');
  return data;
};

const Settings = () => {
  const { data: initialSettings, isLoading, refetch } = useQuery({
    queryKey: ['settings'],
    queryFn: fetchSettings,
  });

  const [settings, setSettings] = useState({
    sources: [],
    categories: [],
    defaultPrompt: '',
    minImportanceScore: 5,
    digestFrequency: 'Manual',
    smtpUser: '',
    smtpPass: '',
    receiverEmails: []
  });
  
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState(null); // 'success' | 'error'
  const [newSourceUrl, setNewSourceUrl] = useState('');
  const [newSourceName, setNewSourceName] = useState('');

  // Sync settings from server once loaded
  useEffect(() => {
    if (initialSettings) {
      setSettings(initialSettings);
    }
  }, [initialSettings]);

  const handleSave = async () => {
    setSaving(true);
    setSaveStatus(null);
    try {
      await axios.put('/settings', settings);
      setSaveStatus('success');
      setTimeout(() => setSaveStatus(null), 3000);
    } catch (error) {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus(null), 4000);
    } finally {
      setSaving(false);
    }
  };

  const addSource = async () => {
    if (!newSourceUrl || !newSourceName) return;
    try {
      await axios.post('/settings/rss-feeds', { name: newSourceName, url: newSourceUrl });
      setNewSourceName('');
      setNewSourceUrl('');
      refetch();
    } catch (error) {
      alert(error.response?.data?.message || 'Error adding RSS feed');
    }
  };

  const toggleSource = async (index) => {
    const feed = settings.sources[index];
    if (!feed?._id) return;
    try {
      await axios.put(`/settings/rss-feeds/${feed._id}/toggle`);
      refetch();
    } catch (error) {
      alert('Error toggling RSS feed');
    }
  };

  const [newKeyword, setNewKeyword] = useState('');

  const addKeyword = async () => {
    if (!newKeyword) return;
    try {
      await axios.post('/settings/filter-keywords', { keyword: newKeyword });
      setNewKeyword('');
      refetch();
    } catch (error) {
      alert(error.response?.data?.message || 'Error adding keyword');
    }
  };

  const deleteKeyword = async (id) => {
    try {
      await axios.delete(`/settings/filter-keywords/${id}`);
      refetch();
    } catch (error) {
      alert(error.response?.data?.message || 'Error deleting keyword');
    }
  };





  const [newReceiverEmail, setNewReceiverEmail] = useState('');

  const addReceiverEmail = () => {
    if (!newReceiverEmail) return;
    setSettings(prev => ({
        ...prev,
        receiverEmails: [...(prev.receiverEmails || []), newReceiverEmail]
    }));
    setNewReceiverEmail('');
  };

  const removeReceiverEmail = (idx) => {
    setSettings(prev => ({
        ...prev,
        receiverEmails: (prev.receiverEmails || []).filter((_, i) => i !== idx)
    }));
  };

  if (isLoading) return <div className="p-8 text-center">Loading settings...</div>;

  return (
    <>
    <div className="max-w-4xl mx-auto space-y-8 pb-24">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">System Settings</h2>
          <p className="text-gray-500 mt-1">Configure sources, AI prompts, and scheduling.</p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gray-50/50">
          <h3 className="text-lg font-semibold text-gray-800">RSS Feed Management</h3>
          <p className="text-sm text-gray-500 mt-1">Manage RSS feeds to scrape for news.</p>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            {settings.sources?.map((source, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                <div className="font-medium text-gray-900">{source.name}</div>
                <div className="flex items-center gap-4">
                  <span className={`text-sm font-medium ${source.enabled ? 'text-green-600' : 'text-gray-500'}`}>
                    {source.enabled ? 'Enabled' : 'Disabled'}
                  </span>
                  <button onClick={() => toggleSource(idx)} className={`text-sm px-3 py-1 rounded transition-colors ${source.enabled ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}>
                    {source.enabled ? 'Disable' : 'Enable'}
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-6 flex gap-4 items-end bg-gray-50 p-4 rounded-lg border border-gray-200 border-dashed">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Publisher Name</label>
              <input 
                type="text" 
                value={newSourceName} 
                onChange={e => setNewSourceName(e.target.value)}
                placeholder="e.g. TechCrunch" 
                className="w-full px-4 py-2 rounded border border-gray-300 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">RSS URL</label>
              <input 
                type="url" 
                value={newSourceUrl} 
                onChange={e => setNewSourceUrl(e.target.value)}
                placeholder="https://..." 
                className="w-full px-4 py-2 rounded border border-gray-300 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              />
            </div>
            <button onClick={addSource} className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-900 flex items-center gap-2 h-[42px]">
              <Plus size={18} /> Add
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gray-50/50">
          <h3 className="text-lg font-semibold text-gray-800">Gemini AI Configuration</h3>
          <p className="text-sm text-gray-500 mt-1">Configure how Gemini summarizes articles.</p>
        </div>
        <div className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Default Prompt</label>
            <textarea 
              rows={6}
              value={settings.defaultPrompt || ''}
              onChange={e => setSettings({...settings, defaultPrompt: e.target.value})}
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-primary focus:ring-1 focus:ring-primary outline-none font-mono text-sm leading-relaxed"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Minimum Importance Score Threshold (1-10)
            </label>
            <div className="flex items-center gap-4">
              <input 
                type="range" 
                min="1" max="10" 
                value={settings.minImportanceScore || 5}
                onChange={e => setSettings({...settings, minImportanceScore: parseInt(e.target.value)})}
                className="w-64"
              />
              <span className="font-bold text-lg text-primary">{settings.minImportanceScore}</span>
            </div>
            <p className="text-xs text-gray-500 mt-1">Articles scoring below this will be ignored.</p>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gray-50/50">
          <h3 className="text-lg font-semibold text-gray-800">AI Filter Keywords</h3>
          <p className="text-sm text-gray-500 mt-1">Manage keywords used to filter AI-related articles.</p>
        </div>
        <div className="p-6">
          <div className="flex flex-wrap gap-3">
            {settings.filterKeywords?.map((kw, idx) => (
              <div key={idx} className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full border border-blue-200 shadow-sm">
                <span className="font-medium text-sm">{kw.keyword}</span>
                <button onClick={() => deleteKeyword(kw._id)} className="text-blue-400 hover:text-red-500 transition-colors ml-1">
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
          
          <div className="mt-6 flex gap-4 items-end bg-gray-50 p-4 rounded-lg border border-gray-200 border-dashed">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">New Keyword</label>
              <input 
                type="text" 
                value={newKeyword} 
                onChange={e => setNewKeyword(e.target.value)}
                placeholder="e.g. Machine Learning" 
                className="w-full px-4 py-2 rounded border border-gray-300 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              />
            </div>
            <button onClick={addKeyword} className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-900 flex items-center gap-2 h-[42px]">
              <Plus size={18} /> Add
            </button>
          </div>
        </div>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 bg-gray-50/50">
          <h3 className="text-lg font-semibold text-gray-800">Email Configuration</h3>
          <p className="text-sm text-gray-500 mt-1">Configure default receiver emails for the digest.</p>
        </div>
        <div className="p-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">Receiver Emails</label>
          <div className="flex flex-wrap gap-3 mb-4">
            {(settings.receiverEmails || []).map((email, idx) => (
              <div key={idx} className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full border border-blue-200 shadow-sm">
                <span className="font-medium text-sm">{email}</span>
                <button onClick={() => removeReceiverEmail(idx)} className="text-blue-400 hover:text-red-500 transition-colors">
                  &times;
                </button>
              </div>
            ))}
          </div>
          <div className="flex gap-4 items-end bg-gray-50 p-4 rounded-lg border border-gray-200 border-dashed">
            <div className="flex-1">
              <input 
                type="email" 
                value={newReceiverEmail} 
                onChange={e => setNewReceiverEmail(e.target.value)}
                placeholder="receiver@example.com" 
                className="w-full px-4 py-2 rounded border border-gray-300 focus:border-primary focus:ring-1 focus:ring-primary outline-none"
              />
            </div>
            <button onClick={addReceiverEmail} className="bg-gray-800 text-white px-4 py-2 rounded hover:bg-gray-900 flex items-center gap-2 h-[42px]">
              <Plus size={18} /> Add Receiver
            </button>
          </div>
        </div>
      </div>
    </div>

      {/* Sticky bottom save bar — always visible */}
      <div className="sticky bottom-0 -mx-8 -mb-8 mt-8 z-50 bg-white border-t border-gray-200 shadow-[0_-10px_15px_-3px_rgba(0,0,0,0.05)]">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <p className="text-sm text-gray-500">Remember to save your changes after editing any section.</p>
          <div className="flex items-center gap-3">
            {saveStatus === 'success' && (
              <span className="text-green-600 text-sm font-medium bg-green-50 px-3 py-1 rounded-full border border-green-200">✓ Saved successfully</span>
            )}
            {saveStatus === 'error' && (
              <span className="text-red-600 text-sm font-medium bg-red-50 px-3 py-1 rounded-full border border-red-200">✗ Error saving</span>
            )}
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 bg-primary text-white px-6 py-2 rounded-lg font-medium hover:bg-primary-hover transition-colors disabled:opacity-50 shadow-sm"
            >
              {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              Save All Changes
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Settings;
