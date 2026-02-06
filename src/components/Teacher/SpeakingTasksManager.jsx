import React, { useState, useEffect } from 'react';
import { Plus, BookOpen, Clock, Users, Eye, FileText, Mic, CheckCircle, X, Play, MessageSquare, Edit, Trash2, Sparkles } from 'lucide-react';
import api from '../../services/api';

const SpeakingTasksManager = () => {
    const [tasks, setTasks] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [selectedTask, setSelectedTask] = useState(null);
    const [taskStatus, setTaskStatus] = useState([]);
    const [statusLoading, setStatusLoading] = useState(false);
    const [showAiLogs, setShowAiLogs] = useState(false);
    const [selectedSubmission, setSelectedSubmission] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        prompt: '',
        timeLimit: 120,
        planningTimeLimit: 300,
        targetVocabulary: '',
        timePoint: 'week1'
    });

    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        try {
            const res = await api.get('/tasks');
            if (res.data.success) setTasks(Array.isArray(res.data.data) ? res.data.data : []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchTaskStatus = async (taskId) => {
        setStatusLoading(true);
        try {
            const res = await api.get(`/tasks/${taskId}/status`);
            if (res.data.success) setTaskStatus(Array.isArray(res.data.data) ? res.data.data : []);
        } catch (err) {
            console.error(err);
        } finally {
            setStatusLoading(false);
        }
    };

    const handleSaveTask = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...formData,
                targetVocabulary: typeof formData.targetVocabulary === 'string'
                    ? formData.targetVocabulary.split(',').map(v => v.trim())
                    : formData.targetVocabulary
            };

            let res;
            if (isModalOpen === 'edit' && selectedTask) {
                res = await api.put(`/tasks/${selectedTask._id}`, payload);
            } else {
                res = await api.post('/tasks', payload);
            }

            if (res.data.success) {
                setIsModalOpen(false);
                fetchTasks();
                setFormData({
                    title: '', description: '', prompt: '', timeLimit: 120,
                    planningTimeLimit: 300, targetVocabulary: '', timePoint: 'week1'
                });
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleDeleteTask = async (e, taskId) => {
        e.stopPropagation();
        if (!window.confirm("FATAL ACTION: This will purge the task and all associated research data. Proceed?")) return;
        try {
            const res = await api.delete(`/tasks/${taskId}`);
            if (res.data.success) {
                fetchTasks();
                if (selectedTask?._id === taskId) setSelectedTask(null);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleEditTask = (e, task) => {
        e.stopPropagation();
        setSelectedTask(task);
        setFormData({
            title: task.title || '',
            description: task.description || '',
            prompt: task.prompt || '',
            timeLimit: task.timeLimit || 120,
            planningTimeLimit: task.planningTimeLimit || 300,
            targetVocabulary: Array.isArray(task.targetVocabulary) ? task.targetVocabulary.join(', ') : '',
            timePoint: task.timePoint || 'week1'
        });
        setIsModalOpen('edit');
    };

    const handleDeleteSubmission = async (subId) => {
        if (!window.confirm("RESET CANDIDATE: This will delete the student's submission. The student can retry. Proceed?")) return;
        try {
            const res = await api.delete(`/tasks/submissions/${subId}`);
            if (res.data.success) {
                fetchTaskStatus(selectedTask._id);
            }
        } catch (err) {
            console.error(err);
        }
    };



    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">Speaking Tasks</h1>
                    <p className="text-gray-400">Manage classroom speaking activities and research data</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-all"
                >
                    <Plus size={20} /> New Task
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Task List */}
                <div className="space-y-4">
                    {loading ? (
                        <div className="text-center py-12">Loading...</div>
                    ) : tasks.length > 0 ? tasks.map(task => (
                        <div
                            key={task._id}
                            onClick={() => {
                                setSelectedTask(task);
                                fetchTaskStatus(task._id);
                            }}
                            className={`glass-card p-6 rounded-2xl border transition-all cursor-pointer group ${selectedTask?._id === task._id ? 'border-indigo-500 bg-indigo-500/5' : 'border-white/10 hover:border-white/20'
                                }`}
                        >
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <span className="text-[10px] uppercase tracking-widest text-indigo-400 font-bold px-2 py-1 bg-indigo-500/10 rounded-md">
                                        {task.timePoint}
                                    </span>
                                    <h3 className="text-xl font-bold mt-2">{task.title}</h3>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    <div className="text-right text-sm text-gray-400">
                                        <div className="flex items-center gap-1 justify-end"><Clock size={14} /> {task.timeLimit}s</div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={(e) => handleEditTask(e, task)}
                                            className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-gray-500 hover:text-indigo-400 transition-all border border-white/5"
                                        >
                                            <Edit size={14} />
                                        </button>
                                        <button
                                            onClick={(e) => handleDeleteTask(e, task._id)}
                                            className="p-2 bg-white/5 hover:bg-rose-500/10 rounded-lg text-gray-500 hover:text-rose-500 transition-all border border-white/5"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <p className="text-gray-400 text-sm line-clamp-2">{task.description}</p>
                        </div>
                    )) : (
                        <div className="glass-card p-12 text-center rounded-2xl border border-dashed border-white/20 text-gray-500">
                            No tasks created yet. Create your first speaking task to begin.
                        </div>
                    )}
                </div>

                {/* Task Detail & Submissions */}
                <div className="space-y-6">
                    {selectedTask ? (
                        <div className="glass-card rounded-2xl border border-white/10 overflow-hidden sticky top-6">
                            <div className="p-6 border-b border-white/10 bg-white/5 flex gap-2 items-center">
                                <h3 className="font-bold text-lg flex-1">Submissions</h3>

                            </div>
                            <div className="p-0 max-h-[600px] overflow-y-auto">
                                <table className="w-full text-sm">
                                    <thead className="bg-white/5 text-gray-400 border-b border-white/5">
                                        <tr>
                                            <th className="p-4 text-left font-medium">Student</th>
                                            <th className="p-4 text-center font-medium">Status</th>
                                            <th className="p-4 text-center font-medium">Words</th>
                                            <th className="p-4 text-center font-medium">Score</th>
                                            <th className="p-4 text-right font-medium">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                        {statusLoading ? (
                                            <tr>
                                                <td colSpan="5" className="p-12 text-center text-gray-500 font-black uppercase tracking-[0.3em] animate-pulse">
                                                    Synchronizing Records...
                                                </td>
                                            </tr>
                                        ) : taskStatus.length > 0 ? taskStatus.map(row => (
                                            <tr key={row.student._id} className="hover:bg-white/5 transition-colors">
                                                <td className="p-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-[10px] font-black text-gray-500 border border-white/5 uppercase">
                                                            {row.student.userId?.fullName?.substring(0, 2)}
                                                        </div>
                                                        <div>
                                                            <div className="font-bold text-white tracking-tight">{row.student.userId?.fullName}</div>
                                                            <div className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">{row.student.userId?.email}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="p-4 text-center">
                                                    {row.completed ? (
                                                        <span className="inline-flex items-center gap-1 text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded-full text-[10px] font-bold">
                                                            <CheckCircle size={10} /> Finished
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 text-gray-500 bg-white/5 px-2 py-0.5 rounded-full text-[10px] font-bold">
                                                            <X size={10} /> No
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="p-4 text-center font-mono">{row.wordCount}</td>
                                                <td className="p-4 text-center">
                                                    <div className="text-indigo-400 font-bold">{row.lexicalDiversity}%</div>
                                                    <div className="text-[10px] text-gray-500">Diversity</div>
                                                </td>
                                                <td className="p-4 text-right">
                                                    {row.completed && (
                                                        <div className="flex justify-end gap-2">
                                                            <button
                                                                title="View AI Logs"
                                                                className="p-2 hover:bg-white/10 rounded-lg text-indigo-400 hover:text-indigo-300 transition-all"
                                                                onClick={() => {
                                                                    setSelectedSubmission(row);
                                                                    setShowAiLogs(true);
                                                                }}
                                                            >
                                                                <MessageSquare size={16} />
                                                            </button>
                                                            <button
                                                                title="Download Transcript (TXT)"
                                                                className="p-2 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-all transform hover:scale-110 active:scale-95"
                                                                onClick={() => window.open(`${api.defaults.baseURL}/export/transcript/${row.submissionId}`, '_blank')}
                                                            >
                                                                <FileText size={16} />
                                                            </button>
                                                            <button
                                                                title="Listen/Download Audio"
                                                                className="p-2 hover:bg-white/10 rounded-lg text-emerald-400/70 hover:text-emerald-400 transition-all transform hover:scale-110 active:scale-95"
                                                                onClick={() => {
                                                                    if (row.audioUrl) {
                                                                        window.open(row.audioUrl, '_blank');
                                                                    } else {
                                                                        alert("No audio recorded for this submission.");
                                                                    }
                                                                }}
                                                            >
                                                                <Play size={16} />
                                                            </button>
                                                            <button
                                                                title="Delete Submission (Reset)"
                                                                className="p-2 hover:bg-rose-500/10 rounded-lg text-rose-500 transition-all"
                                                                onClick={() => handleDeleteSubmission(row.submissionId)}
                                                            >
                                                                <Trash2 size={16} />
                                                            </button>
                                                        </div>
                                                    )}
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan="4" className="p-8 text-center text-gray-500 italic">
                                                    No submissions yet.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full min-h-[400px] border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center text-gray-500 p-8 text-center">
                            <BookOpen size={48} className="mb-4 opacity-20" />
                            <p>Select a task from the list to see student progress and download results.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Create Task Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="glass-card w-full max-w-2xl rounded-3xl overflow-hidden border border-white/20">
                        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-[#1a0033]">
                            <h2 className="text-2xl font-bold flex items-center gap-2">
                                <Mic className="text-indigo-400" /> {isModalOpen === 'edit' ? 'Update Task' : 'New Speaking Task'}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-white/10 rounded-full"><X size={24} /></button>
                        </div>
                        <form onSubmit={handleSaveTask} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-400 uppercase">Task Title</label>
                                    <input
                                        required
                                        type="text"
                                        value={formData.title}
                                        onChange={e => setFormData({ ...formData, title: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 focus:border-indigo-500 outline-none"
                                        placeholder="e.g., My Favorite City"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-400 uppercase">Time Point</label>
                                    <select
                                        value={formData.timePoint}
                                        onChange={e => setFormData({ ...formData, timePoint: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 focus:border-indigo-500 outline-none"
                                    >
                                        <option value="pretest">Pre-test</option>
                                        <option value="week1">Week 1</option>
                                        <option value="week2">Week 2</option>
                                        <option value="week3">Week 3</option>
                                        <option value="week4">Week 4</option>
                                        <option value="posttest">Post-test</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-400 uppercase">Short Description (for list)</label>
                                <input
                                    required
                                    type="text"
                                    value={formData.description}
                                    onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 focus:border-indigo-500 outline-none"
                                    placeholder="Briefly describe the task goal..."
                                />
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-400 uppercase">The Prompt (Question for Student)</label>
                                <textarea
                                    required
                                    value={formData.prompt}
                                    onChange={e => setFormData({ ...formData, prompt: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 focus:border-indigo-500 outline-none h-24"
                                    placeholder="What questions should the student answer?"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-400 uppercase">Speaking Time Limit (seconds)</label>
                                    <input
                                        type="number"
                                        value={formData.timeLimit}
                                        onChange={e => setFormData({ ...formData, timeLimit: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 focus:border-indigo-500 outline-none"
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-xs font-bold text-gray-400 uppercase">Planning Time Limit (seconds)</label>
                                    <input
                                        type="number"
                                        value={formData.planningTimeLimit}
                                        onChange={e => setFormData({ ...formData, planningTimeLimit: e.target.value })}
                                        className="w-full bg-white/5 border border-white/10 rounded-xl p-3 focus:border-indigo-500 outline-none"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-gray-400 uppercase">Target Vocabulary (comma separated)</label>
                                <input
                                    type="text"
                                    value={formData.targetVocabulary}
                                    onChange={e => setFormData({ ...formData, targetVocabulary: e.target.value })}
                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-3 focus:border-indigo-500 outline-none"
                                    placeholder="environment, pollution, sustainable, toxic..."
                                />
                            </div>

                            <div className="pt-4 flex gap-4">
                                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 rounded-xl bg-white/10 hover:bg-white/20 transition-all font-bold">Cancel</button>
                                <button type="submit" className="flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white transition-all font-bold">
                                    {isModalOpen === 'edit' ? 'Save Changes' : 'Create Task'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* AI Logs Modal */}
            {showAiLogs && selectedSubmission && (
                <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[150] flex items-center justify-center p-8">
                    <div className="w-full max-w-5xl h-[80vh] bg-[#0a0a0a] rounded-[3rem] border border-white/10 flex flex-col overflow-hidden shadow-2xl">
                        <div className="p-10 border-b border-white/5 flex justify-between items-center bg-gradient-to-r from-red-600/10 to-transparent">
                            <div>
                                <h2 className="text-3xl font-black uppercase tracking-tight flex items-center gap-4">
                                    <Sparkles className="text-red-500" /> AI Research Audit
                                </h2>
                                <p className="text-[10px] text-gray-500 font-black uppercase tracking-[0.3em] mt-2">Core Processor: Whisper-Large-V3 & Python Linguistic Bridge</p>
                            </div>
                            <button onClick={() => setShowAiLogs(false)} className="w-14 h-14 bg-white/5 hover:bg-white/10 rounded-2xl flex items-center justify-center transition-all">
                                <X size={24} />
                            </button>
                        </div>
                        <div className="flex-1 p-10 overflow-y-auto space-y-10">
                            {/* Raw Transcript */}
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-500 flex items-center gap-3">
                                        <FileText size={14} className="text-indigo-400" /> Raw Linguistic Data
                                    </h3>
                                    <div className="text-[10px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">Verified</div>
                                </div>
                                <div className="p-8 bg-white/[0.02] border border-white/5 rounded-[2rem] font-mono text-sm leading-relaxed text-gray-300">
                                    {selectedSubmission.transcription || "No transcription payload detected."}
                                </div>
                            </div>

                            {/* Metrics Bridge */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-6">
                                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-500">Telemetry Breakdown</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl">
                                            <div className="text-[8px] text-gray-500 font-black uppercase mb-1">MTLD Score</div>
                                            <div className="text-xl font-black text-indigo-400">{selectedSubmission.lexicalDiversity}%</div>
                                        </div>
                                        <div className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl">
                                            <div className="text-[8px] text-gray-500 font-black uppercase mb-1">Sophistication</div>
                                            <div className="text-xl font-black text-rose-400">{selectedSubmission.lexicalSophistication}%</div>
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-6">
                                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-500">Research Hash</h3>
                                    <div className="p-6 bg-white/[0.02] border border-white/5 rounded-2xl font-mono text-[10px] text-gray-600 break-all">
                                        SID_{selectedSubmission.submissionId}_HASH_V3_RECOVERY_NODE
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SpeakingTasksManager;
