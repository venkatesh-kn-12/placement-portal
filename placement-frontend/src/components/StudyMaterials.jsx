import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAlert } from './AlertContext';

export default function StudyMaterials() {
  const { showAlert } = useAlert();
  const alert = (msg) => showAlert(msg);
  const [materials, setMaterials] = useState([]);
  const [courses, setCourses] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [title, setTitle] = useState('');
  const [type, setType] = useState('link'); // 'link' | 'text'
  const [urlOrContent, setUrlOrContent] = useState('');
  const [targetType, setTargetType] = useState('course'); // 'course' | 'company' | 'general'
  const [targetId, setTargetId] = useState('');

  const [uploading, setUploading] = useState(false);
  const [filterType, setFilterType] = useState('all'); // 'all' | 'course' | 'company' | 'general'

  const fetchData = async () => {
    try {
      const matRes = await api.get('/faculty/materials');
      const coursesRes = await api.get('/courses');
      const compRes = await api.get('/companies');

      setMaterials(matRes.data);
      setCourses(coursesRes.data);
      setCompanies(compRes.data);
    } catch (err) {
      console.error("Error loading study materials data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddMaterial = async (e) => {
    e.preventDefault();
    if (!title.trim() || !urlOrContent.trim()) {
      alert('Please fill out all fields.');
      return;
    }

    setUploading(true);
    try {
      const payload = {
        title: title.trim(),
        type,
        url_or_content: urlOrContent.trim(),
        course_id: targetType === 'course' ? targetId : null,
        company_id: targetType === 'company' ? parseInt(targetId, 10) : null
      };

      await api.post('/faculty/materials', payload);
      alert('Syllabus material added successfully!');
      
      // Reset Form
      setTitle('');
      setUrlOrContent('');
      setTargetId('');
      
      // Reload Materials
      fetchData();
    } catch (err) {
      alert('Upload failed: ' + err.message);
    } finally {
      setUploading(false);
    }
  };

  const filteredMaterials = filterType === 'all'
    ? materials
    : materials.filter(m => {
        if (filterType === 'course') return m.course !== null;
        if (filterType === 'company') return m.company !== null;
        return m.course === null && m.company === null;
      });

  if (loading) {
    return (
      <div className="flex items-center justify-center p-24">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6 font-sans">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Syllabus & Study Guides</h1>
        <p className="text-xs text-slate-400 mt-1">Publish reference material, syllabus documentation, external resource links, and placement drive guides.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Publish Material Form - Left 1 Column */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg h-fit">
          <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-4">Publish Material</h3>
          
          <form onSubmit={handleAddMaterial} className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Material Title</label>
              <input
                type="text"
                placeholder="e.g. SQL Performance Tuning Basics"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2.5 text-xs text-slate-200 placeholder-slate-650 outline-none transition-colors"
                required
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Content Type</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setType('link')}
                  className={`py-2 text-xs font-semibold rounded-lg border transition-all ${
                    type === 'link'
                      ? 'bg-indigo-600/15 border-indigo-500 text-indigo-400'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-850'
                  }`}
                >
                  External Link / Drive
                </button>
                <button
                  type="button"
                  onClick={() => setType('text')}
                  className={`py-2 text-xs font-semibold rounded-lg border transition-all ${
                    type === 'text'
                      ? 'bg-indigo-600/15 border-indigo-500 text-indigo-400'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-850'
                  }`}
                >
                  Plain Text Content
                </button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => { setTargetType('course'); setTargetId(''); }}
                className={`py-1.5 text-[10px] font-bold uppercase rounded-lg border transition-all ${
                  targetType === 'course' ? 'bg-slate-800 border-indigo-500 text-indigo-400' : 'bg-slate-950 border-slate-850 text-slate-500'
                }`}
              >
                Course
              </button>
              <button
                type="button"
                onClick={() => { setTargetType('company'); setTargetId(''); }}
                className={`py-1.5 text-[10px] font-bold uppercase rounded-lg border transition-all ${
                  targetType === 'company' ? 'bg-slate-800 border-indigo-500 text-indigo-400' : 'bg-slate-950 border-slate-850 text-slate-500'
                }`}
              >
                Company
              </button>
              <button
                type="button"
                onClick={() => { setTargetType('general'); setTargetId(''); }}
                className={`py-1.5 text-[10px] font-bold uppercase rounded-lg border transition-all ${
                  targetType === 'general' ? 'bg-slate-800 border-indigo-500 text-indigo-400' : 'bg-slate-950 border-slate-850 text-slate-500'
                }`}
              >
                General
              </button>
            </div>

            {targetType === 'course' && (
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Target Academy Course</label>
                <select
                  value={targetId}
                  onChange={(e) => setTargetId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2.5 text-xs text-slate-200 outline-none"
                  required
                >
                  <option value="">Choose Course</option>
                  {courses.map(c => (
                    <option key={c.id} value={c.id}>{c.title}</option>
                  ))}
                </select>
              </div>
            )}

            {targetType === 'company' && (
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Target Company Opportunity</label>
                <select
                  value={targetId}
                  onChange={(e) => setTargetId(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2.5 text-xs text-slate-200 outline-none"
                  required
                >
                  <option value="">Choose Company Drive</option>
                  {companies.map(c => (
                    <option key={c.id} value={c.id}>{c.name} - {c.role}</option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">
                {type === 'link' ? 'Document Link URL' : 'Document Content Text'}
              </label>
              {type === 'link' ? (
                <input
                  type="url"
                  placeholder="https://drive.google.com/..."
                  value={urlOrContent}
                  onChange={(e) => setUrlOrContent(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2.5 text-xs text-slate-200 placeholder-slate-650 outline-none transition-colors"
                  required
                />
              ) : (
                <textarea
                  placeholder="Paste guide contents..."
                  value={urlOrContent}
                  onChange={(e) => setUrlOrContent(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-indigo-500 rounded-xl px-3 py-2 text-xs text-slate-200 placeholder-slate-650 outline-none h-28 resize-none transition-colors"
                  required
                />
              )}
            </div>

            <button
              type="submit"
              disabled={uploading}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white rounded-xl transition-colors flex items-center justify-center space-x-2 shadow-lg"
            >
              {uploading ? (
                <>
                  <div className="animate-spin rounded-full h-3.5 w-3.5 border-t-2 border-white"></div>
                  <span>Publishing...</span>
                </>
              ) : (
                <span>Publish Guide</span>
              )}
            </button>
          </form>
        </div>

        {/* Materials Directory - Right 2 Columns */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg">
            
            {/* Filter buttons */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider">Reference Guides</h3>
              
              <div className="flex bg-slate-950 border border-slate-800 rounded-lg p-0.5 text-[10px]">
                {['all', 'course', 'company', 'general'].map((t) => (
                  <button
                    key={t}
                    onClick={() => setFilterType(t)}
                    className={`px-3 py-1.5 rounded font-bold uppercase transition-all ${
                      filterType === t ? 'bg-slate-850 text-indigo-400' : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            {/* List */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filteredMaterials.length === 0 ? (
                <p className="text-slate-500 text-xs italic col-span-2 py-8 text-center">No reference guides matches this filter.</p>
              ) : null}
              {filteredMaterials.map((m) => {
                const targetText = m.course
                  ? `Course: ${m.course.title}`
                  : m.company
                  ? `Company: ${m.company.name}`
                  : 'General Guide';
                
                return (
                  <div key={m.id} className="p-4 bg-slate-950 rounded-xl border border-slate-850 hover:border-slate-850 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start">
                        <span className="px-2 py-0.5 bg-indigo-500/10 text-indigo-400 text-[8px] font-bold rounded uppercase tracking-wider">{m.type}</span>
                        <span className="text-[9px] text-slate-500 font-semibold">{targetText}</span>
                      </div>
                      <h4 className="font-bold text-slate-200 text-xs mt-3 leading-normal">{m.title}</h4>
                      <p className="text-[10px] text-slate-500 mt-1">Uploaded by faculty: {m.addedBy?.email?.split('@')[0] || 'System'}</p>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-900">
                      {m.type === 'link' ? (
                        <a
                          href={m.urlOrContent}
                          target="_blank"
                          rel="noreferrer"
                          className="w-full block text-center py-2 bg-slate-900 border border-slate-850 hover:border-slate-800 text-[10px] text-indigo-400 hover:text-indigo-300 font-bold rounded-lg transition-colors"
                        >
                          Access Guide Link
                        </a>
                      ) : (
                        <button
                          onClick={() => alert(m.urlOrContent)}
                          className="w-full py-2 bg-slate-900 border border-slate-850 hover:border-slate-800 text-[10px] text-slate-350 hover:text-slate-200 font-bold rounded-lg transition-colors"
                        >
                          Read Document Notes
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

          </div>
        </div>

      </div>

    </div>
  );
}
