'use client';

import { useState, useEffect } from 'react';
import { loadData, saveData } from '@/lib/store';

type Status = 'planning' | 'inprogress' | 'completed' | 'paused';
type Priority = 'high' | 'medium' | 'low';

interface Project {
  id: string;
  name: string;
  description: string;
  category: string;
  tech: string;
  status: Status;
  priority: Priority;
  progress: number;
  startDate: string;
  deadline: string;
  createdAt: string;
}

const statusConfig = {
  planning: { label: 'Planning', color: '#6366f1', bg: '#eef2ff' },
  inprogress: { label: 'In Progress', color: '#f59e0b', bg: '#fffbeb' },
  completed: { label: 'Completed', color: '#10b981', bg: '#ecfdf5' },
  paused: { label: 'Paused', color: '#9ca3af', bg: '#f9fafb' },
};

const priorityConfig = {
  high: { label: 'High', color: '#ef4444', bg: '#fef2f2' },
  medium: { label: 'Medium', color: '#f59e0b', bg: '#fffbeb' },
  low: { label: 'Low', color: '#10b981', bg: '#ecfdf5' },
};

const emptyForm = {
  name: '',
  description: '',
  category: '',
  tech: '',
  status: 'planning' as Status,
  priority: 'medium' as Priority,
  progress: 0,
  startDate: '',
  deadline: '',
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>(() => loadData().projects);
  const [showModal, setShowModal] = useState(false);
  useEffect(() => {
  saveData({ projects });
}, [projects]);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [filter, setFilter] = useState<'all' | Status>('all');
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  const filtered = projects.filter(p =>
    filter === 'all' || p.status === filter
  );

  const stats = {
    total: projects.length,
    inprogress: projects.filter(p => p.status === 'inprogress').length,
    completed: projects.filter(p => p.status === 'completed').length,
    avgProgress: projects.length
      ? Math.round(projects.reduce((a, p) => a + p.progress, 0) / projects.length)
      : 0,
  };

  const openAdd = () => {
    setEditingProject(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (p: Project) => {
    setEditingProject(p);
    setForm({
      name: p.name, description: p.description,
      category: p.category, tech: p.tech,
      status: p.status, priority: p.priority,
      progress: p.progress, startDate: p.startDate,
      deadline: p.deadline,
    });
    setShowModal(true);
  };

  const handleSave = () => {
    if (!form.name.trim()) return;
    if (editingProject) {
      setProjects(prev => prev.map(p =>
        p.id === editingProject.id ? { ...p, ...form } : p
      ));
    } else {
      setProjects(prev => [...prev, {
        id: Date.now().toString(),
        ...form,
        createdAt: new Date().toISOString(),
      }]);
    }
    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    setProjects(prev => prev.filter(p => p.id !== id));
  };

  const inputStyle = {
    width: '100%', padding: '10px 14px',
    borderRadius: 10, border: '1px solid #e5e7eb',
    fontSize: 14, color: '#111827', background: '#f9fafb',
    outline: 'none', boxSizing: 'border-box' as const,
    fontFamily: 'inherit',
  };

  const labelStyle = {
    display: 'block', fontSize: 13,
    fontWeight: 600 as const, color: '#374151', marginBottom: 6,
  };

  return (
    <div style={{ maxWidth: 1200 }}>

      {/* Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)',
        gap: isMobile ? 10 : 16,
        marginBottom: isMobile ? 16 : 24,
      }}>
        {[
          { label: 'Total Projects', value: stats.total, color: '#6366f1' },
          { label: 'In Progress', value: stats.inprogress, color: '#f59e0b' },
          { label: 'Completed', value: stats.completed, color: '#10b981' },
          { label: 'Avg Progress', value: `${stats.avgProgress}%`, color: '#8b5cf6' },
        ].map(s => (
          <div key={s.label} style={{
            background: 'white', borderRadius: 12,
            padding: isMobile ? '14px' : '16px 20px',
            border: '1px solid #f3f4f6',
          }}>
            <p style={{ fontSize: 12, color: '#9ca3af', margin: '0 0 6px', fontWeight: 500 }}>
              {s.label}
            </p>
            <p style={{
              fontSize: isMobile ? 22 : 26, fontWeight: 700,
              color: '#111827', margin: 0, letterSpacing: '-0.5px',
            }}>
              {s.value}
            </p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div style={{
        background: 'white', borderRadius: 12,
        padding: isMobile ? '12px' : '16px 20px',
        border: '1px solid #f3f4f6', marginBottom: 16,
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', gap: 10,
        flexWrap: 'wrap',
      }}>
        <div style={{
          display: 'flex', gap: 6, flexWrap: 'wrap', flex: 1,
        }}>
          {(['all', 'planning', 'inprogress', 'completed', 'paused'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              style={{
                padding: isMobile ? '6px 10px' : '7px 14px',
                borderRadius: 8, fontSize: isMobile ? 12 : 13,
                fontWeight: 500, cursor: 'pointer', border: 'none',
                background: filter === f ? '#6366f1' : '#f9fafb',
                color: filter === f ? 'white' : '#6b7280',
                transition: 'all 0.15s', whiteSpace: 'nowrap',
              }}>
              {f === 'all' ? 'All' : statusConfig[f].label}
            </button>
          ))}
        </div>
        <button onClick={openAdd}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: isMobile ? '8px 12px' : '8px 16px',
            borderRadius: 8, background: '#6366f1',
            color: 'white', border: 'none', cursor: 'pointer',
            fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap',
            boxShadow: '0 2px 8px rgba(99,102,241,0.3)',
          }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          {isMobile ? 'Add' : 'Add Project'}
        </button>
      </div>

      {/* Projects */}
      {filtered.length === 0 ? (
        <div style={{
          background: 'white', borderRadius: 12,
          padding: '60px 20px', border: '1px solid #f3f4f6',
          textAlign: 'center',
        }}>
          <div style={{
            width: 48, height: 48, borderRadius: 12,
            background: '#f9fafb', border: '1px solid #f3f4f6',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 12px',
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
              stroke="#d1d5db" strokeWidth="2" strokeLinecap="round">
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/>
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
            </svg>
          </div>
          <p style={{ fontSize: 15, fontWeight: 600, color: '#6b7280', margin: '0 0 4px' }}>
            No projects yet
          </p>
          <p style={{ fontSize: 13, color: '#d1d5db', margin: '0 0 20px' }}>
            Start tracking your first project
          </p>
          <button onClick={openAdd}
            style={{
              padding: '8px 20px', borderRadius: 8,
              background: '#6366f1', color: 'white',
              border: 'none', cursor: 'pointer',
              fontSize: 13, fontWeight: 600,
            }}>
            Add Your First Project
          </button>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(2, 1fr)',
          gap: isMobile ? 10 : 16,
        }}>
          {filtered.map(project => (
            <div key={project.id} style={{
              background: 'white', borderRadius: 12, padding: '20px',
              border: '1px solid #f3f4f6', transition: 'box-shadow 0.15s',
            }}
              onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 16px rgba(0,0,0,0.06)'}
              onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.boxShadow = 'none'}
            >
              {/* Header */}
              <div style={{
                display: 'flex', justifyContent: 'space-between',
                alignItems: 'flex-start', marginBottom: 12,
              }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h3 style={{
                    fontSize: 15, fontWeight: 700, color: '#111827',
                    margin: '0 0 6px', letterSpacing: '-0.2px',
                  }}>
                    {project.name}
                  </h3>
                  <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                    <span style={{
                      fontSize: 11, fontWeight: 600, padding: '2px 8px',
                      borderRadius: 999,
                      background: statusConfig[project.status].bg,
                      color: statusConfig[project.status].color,
                    }}>
                      {statusConfig[project.status].label}
                    </span>
                    <span style={{
                      fontSize: 11, fontWeight: 600, padding: '2px 8px',
                      borderRadius: 999,
                      background: priorityConfig[project.priority].bg,
                      color: priorityConfig[project.priority].color,
                    }}>
                      {priorityConfig[project.priority].label}
                    </span>
                    {project.category && (
                      <span style={{
                        fontSize: 11, padding: '2px 8px',
                        borderRadius: 999, background: '#f3f4f6',
                        color: '#6b7280',
                      }}>
                        {project.category}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 6, marginLeft: 8 }}>
                  <button onClick={() => openEdit(project)}
                    style={{
                      width: 30, height: 30, borderRadius: 8,
                      border: '1px solid #f3f4f6', background: 'white',
                      cursor: 'pointer', display: 'flex',
                      alignItems: 'center', justifyContent: 'center',
                      color: '#6b7280',
                    }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                  </button>
                  <button onClick={() => handleDelete(project.id)}
                    style={{
                      width: 30, height: 30, borderRadius: 8,
                      border: '1px solid #fecaca', background: '#fef2f2',
                      cursor: 'pointer', display: 'flex',
                      alignItems: 'center', justifyContent: 'center',
                      color: '#ef4444',
                    }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <polyline points="3 6 5 6 21 6"/>
                      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                      <path d="M10 11v6M14 11v6"/>
                    </svg>
                  </button>
                </div>
              </div>

              {/* Description */}
              {project.description && (
                <p style={{
                  fontSize: 13, color: '#6b7280',
                  margin: '0 0 12px', lineHeight: 1.5,
                }}>
                  {project.description}
                </p>
              )}

              {/* Tech stack */}
              {project.tech && (
                <div style={{ marginBottom: 12 }}>
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    {project.tech.split(',').map((t, i) => (
                      <span key={i} style={{
                        fontSize: 11, padding: '2px 8px', borderRadius: 6,
                        background: '#eef2ff', color: '#6366f1', fontWeight: 500,
                      }}>
                        {t.trim()}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Progress */}
              <div style={{ marginBottom: 12 }}>
                <div style={{
                  display: 'flex', justifyContent: 'space-between',
                  marginBottom: 6,
                }}>
                  <span style={{ fontSize: 12, color: '#9ca3af', fontWeight: 500 }}>
                    Progress
                  </span>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#6366f1' }}>
                    {project.progress}%
                  </span>
                </div>
                <div style={{
                  height: 6, borderRadius: 999,
                  background: '#f3f4f6', overflow: 'hidden',
                }}>
                  <div style={{
                    height: '100%', borderRadius: 999,
                    width: `${project.progress}%`,
                    background: project.progress === 100
                      ? '#10b981'
                      : 'linear-gradient(90deg, #6366f1, #a855f7)',
                    transition: 'width 0.3s',
                  }} />
                </div>
              </div>

              {/* Dates */}
              {(project.startDate || project.deadline) && (
                <div style={{
                  display: 'flex', gap: 16,
                  paddingTop: 12, borderTop: '1px solid #f9fafb',
                }}>
                  {project.startDate && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
                        stroke="#9ca3af" strokeWidth="2" strokeLinecap="round">
                        <rect x="3" y="4" width="18" height="18" rx="2"/>
                        <line x1="3" y1="10" x2="21" y2="10"/>
                      </svg>
                      <span style={{ fontSize: 11, color: '#9ca3af' }}>
                        Started {new Date(project.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </span>
                    </div>
                  )}
                  {project.deadline && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none"
                        stroke="#ef4444" strokeWidth="2" strokeLinecap="round">
                        <circle cx="12" cy="12" r="10"/>
                        <polyline points="12 6 12 12 16 14"/>
                      </svg>
                      <span style={{ fontSize: 11, color: '#ef4444' }}>
                        Due {new Date(project.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 200,
          background: 'rgba(0,0,0,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: 16,
        }}
          onClick={e => { if (e.target === e.currentTarget) setShowModal(false); }}
        >
          <div style={{
            background: 'white', borderRadius: 16,
            padding: isMobile ? 20 : 28,
            width: '100%', maxWidth: 520,
            boxShadow: '0 24px 64px rgba(0,0,0,0.15)',
            maxHeight: '90vh', overflowY: 'auto',
          }}>
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              alignItems: 'center', marginBottom: 20,
            }}>
              <h2 style={{ fontSize: 17, fontWeight: 700, color: '#111827', margin: 0 }}>
                {editingProject ? 'Edit Project' : 'Add New Project'}
              </h2>
              <button onClick={() => setShowModal(false)}
                style={{
                  width: 30, height: 30, borderRadius: 8,
                  border: '1px solid #f3f4f6', background: 'white',
                  cursor: 'pointer', display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  color: '#9ca3af',
                }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {/* Name */}
              <div>
                <label style={labelStyle}>Project Name <span style={{ color: '#ef4444' }}>*</span></label>
                <input type="text" value={form.name}
                  onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                  placeholder="e.g. DailyFlow App"
                  style={inputStyle}
                  onFocus={e => e.target.style.borderColor = '#6366f1'}
                  onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                />
              </div>

              {/* Description */}
              <div>
                <label style={labelStyle}>Description</label>
                <textarea value={form.description}
                  onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                  placeholder="What is this project about?"
                  rows={2}
                  style={{ ...inputStyle, resize: 'vertical' }}
                  onFocus={e => e.target.style.borderColor = '#6366f1'}
                  onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                />
              </div>

              {/* Category & Tech */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={labelStyle}>Category</label>
                  <input type="text" value={form.category}
                    onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
                    placeholder="e.g. Web Dev"
                    style={inputStyle}
                    onFocus={e => e.target.style.borderColor = '#6366f1'}
                    onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Tech Stack</label>
                  <input type="text" value={form.tech}
                    onChange={e => setForm(p => ({ ...p, tech: e.target.value }))}
                    placeholder="e.g. React, Node"
                    style={inputStyle}
                    onFocus={e => e.target.style.borderColor = '#6366f1'}
                    onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                  />
                </div>
              </div>

              {/* Status & Priority */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={labelStyle}>Status</label>
                  <select value={form.status}
                    onChange={e => setForm(p => ({ ...p, status: e.target.value as Status }))}
                    style={{ ...inputStyle, cursor: 'pointer' }}>
                    {Object.entries(statusConfig).map(([k, v]) => (
                      <option key={k} value={k}>{v.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Priority</label>
                  <select value={form.priority}
                    onChange={e => setForm(p => ({ ...p, priority: e.target.value as Priority }))}
                    style={{ ...inputStyle, cursor: 'pointer' }}>
                    {Object.entries(priorityConfig).map(([k, v]) => (
                      <option key={k} value={k}>{v.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Dates */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={labelStyle}>Start Date</label>
                  <input type="date" value={form.startDate}
                    onChange={e => setForm(p => ({ ...p, startDate: e.target.value }))}
                    style={{ ...inputStyle, cursor: 'pointer' }}
                    onFocus={e => e.target.style.borderColor = '#6366f1'}
                    onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Deadline</label>
                  <input type="date" value={form.deadline}
                    onChange={e => setForm(p => ({ ...p, deadline: e.target.value }))}
                    style={{ ...inputStyle, cursor: 'pointer' }}
                    onFocus={e => e.target.style.borderColor = '#6366f1'}
                    onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                  />
                </div>
              </div>

              {/* Progress */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                  <label style={{ ...labelStyle, margin: 0 }}>Progress</label>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#6366f1' }}>
                    {form.progress}%
                  </span>
                </div>
                <input type="range" min={0} max={100} value={form.progress}
                  onChange={e => setForm(p => ({ ...p, progress: Number(e.target.value) }))}
                  style={{ width: '100%', accentColor: '#6366f1', cursor: 'pointer' }}
                />
              </div>

              {/* Buttons */}
              <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
                <button onClick={() => setShowModal(false)}
                  style={{
                    flex: 1, padding: '11px', borderRadius: 10,
                    border: '1px solid #e5e7eb', background: 'white',
                    color: '#374151', fontWeight: 600, fontSize: 14,
                    cursor: 'pointer',
                  }}>
                  Cancel
                </button>
                <button onClick={handleSave}
                  style={{
                    flex: 1, padding: '11px', borderRadius: 10,
                    border: 'none', background: '#6366f1',
                    color: 'white', fontWeight: 600, fontSize: 14,
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(99,102,241,0.3)',
                  }}>
                  {editingProject ? 'Save Changes' : 'Add Project'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}