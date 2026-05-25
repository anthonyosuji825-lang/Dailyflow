'use client';

import { useState, useEffect } from 'react';
import { useTheme } from '@/lib/theme';
import { loadData, saveData } from '@/lib/store';

type Priority = 'high' | 'medium' | 'low';
type Status = 'active' | 'completed' | 'paused';
type Category = 'study' | 'health' | 'career' | 'personal' | 'finance' | 'other';

interface Goal {
  id: string;
  title: string;
  description: string;
  priority: Priority;
  status: Status;
  category: Category;
  targetDate: string;
  progress: number;
  createdAt: string;
}

const priorityConfig = {
  high: { label: 'High', color: '#ef4444', bg: '#fef2f2' },
  medium: { label: 'Medium', color: '#f59e0b', bg: '#fffbeb' },
  low: { label: 'Low', color: '#10b981', bg: '#ecfdf5' },
};

const categoryConfig = {
  study: { label: 'Study', color: '#6366f1' },
  health: { label: 'Health', color: '#10b981' },
  career: { label: 'Career', color: '#f59e0b' },
  personal: { label: 'Personal', color: '#8b5cf6' },
  finance: { label: 'Finance', color: '#3b82f6' },
  other: { label: 'Other', color: '#6b7280' },
};

const statusConfig = {
  active: { label: 'Active', color: '#6366f1', bg: '#eef2ff' },
  completed: { label: 'Completed', color: '#10b981', bg: '#ecfdf5' },
  paused: { label: 'Paused', color: '#f59e0b', bg: '#fffbeb' },
};

const emptyGoal = {
  title: '',
  description: '',
  priority: 'medium' as Priority,
  status: 'active' as Status,
  category: 'personal' as Category,
  targetDate: '',
  progress: 0,
};

export default function GoalsPage() {
  const { isDark } = useTheme();
  const [goals, setGoals] = useState<Goal[]>(() => loadData().goals);
  const [showModal, setShowModal] = useState(false);
  useEffect(() => {
  saveData({ goals });
}, [goals]);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [form, setForm] = useState(emptyGoal);
  const [filter, setFilter] = useState<'all' | Status>('all');
  const [search, setSearch] = useState('');

  const filteredGoals = goals.filter(g => {
    const matchesFilter = filter === 'all' || g.status === filter;
    const matchesSearch = g.title.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const openAddModal = () => {
    setEditingGoal(null);
    setForm(emptyGoal);
    setShowModal(true);
  };

  const openEditModal = (goal: Goal) => {
    setEditingGoal(goal);
    setForm({
      title: goal.title,
      description: goal.description,
      priority: goal.priority,
      status: goal.status,
      category: goal.category,
      targetDate: goal.targetDate,
      progress: goal.progress,
    });
    setShowModal(true);
  };

  const handleSave = () => {
    if (!form.title.trim()) return;
    if (editingGoal) {
      setGoals(prev => prev.map(g =>
        g.id === editingGoal.id ? { ...g, ...form } : g
      ));
    } else {
      const newGoal: Goal = {
        id: Date.now().toString(),
        ...form,
        createdAt: new Date().toISOString(),
      };
      setGoals(prev => [...prev, newGoal]);
    }
    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    setGoals(prev => prev.filter(g => g.id !== id));
  };

  const handleProgressChange = (id: string, progress: number) => {
    setGoals(prev => prev.map(g => g.id === id ? {
      ...g,
      progress,
      status: progress === 100 ? 'completed' : g.status,
    } : g));
  };

  const stats = {
    total: goals.length,
    active: goals.filter(g => g.status === 'active').length,
    completed: goals.filter(g => g.status === 'completed').length,
    avgProgress: goals.length
      ? Math.round(goals.reduce((a, g) => a + g.progress, 0) / goals.length)
      : 0,
  };

  const inputStyle = {
    width: '100%',
    padding: '10px 14px',
    borderRadius: 10,
    border: '1px solid #e5e7eb',
    fontSize: 14,
    color: isDark ? '#f1f5f9' : '#111827',
    background: '#f9fafb',
    outline: 'none',
    boxSizing: 'border-box' as const,
  };

  const labelStyle = {
    display: 'block',
    fontSize: 13,
    fontWeight: 600,
    color: '#374151',
    marginBottom: 6,
  };

  return (
    <div style={{ maxWidth: 1200 }}>

      {/* Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: 16, marginBottom: 24,
      }}>
        {[
          { label: 'Total Goals', value: stats.total, color: '#6366f1' },
          { label: 'Active', value: stats.active, color: '#f59e0b' },
          { label: 'Completed', value: stats.completed, color: '#10b981' },
          { label: 'Avg Progress', value: `${stats.avgProgress}%`, color: '#8b5cf6' },
        ].map(s => (
          <div key={s.label} style={{
            background: isDark ? '#1e293b' : 'white', borderRadius: 12, padding: '16px 20px',
            border: `1px solid ${isDark ? '#334155' : '#f3f4f6'}`,
          }}>
            <p style={{ fontSize: 12, color: '#9ca3af', margin: '0 0 6px', fontWeight: 500 }}>
              {s.label}
            </p>
            <p style={{
              fontSize: 26, fontWeight: 700, color: isDark ? '#f1f5f9' : '#111827',
              margin: 0, letterSpacing: '-0.5px',
            }}>
              {s.value}
            </p>
          </div>
        ))}
      </div>

      {/* Toolbar */}
      <div style={{
        background: isDark ? '#1e293b' : 'white', borderRadius: 12, padding: '16px 20px',
        border: `1px solid ${isDark ? '#334155' : '#f3f4f6'}`, marginBottom: 16,
        display: 'flex', alignItems: 'center',
        justifyContent: 'space-between', gap: 12, flexWrap: 'wrap',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          {/* Search */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '8px 12px', borderRadius: 8,
            background: '#f9fafb', border: `1px solid ${isDark ? '#334155' : '#f3f4f6'}`,
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
              stroke="#9ca3af" strokeWidth="2" strokeLinecap="round">
              <circle cx="11" cy="11" r="8"/>
              <line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              type="text" placeholder="Search goals..."
              value={search} onChange={e => setSearch(e.target.value)}
              style={{
                border: 'none', background: 'none', outline: 'none',
                fontSize: 13, color: isDark ? '#f1f5f9' : '#111827', width: 160,
              }}
            />
          </div>

          {/* Filters */}
          {(['all', 'active', 'completed', 'paused'] as const).map(f => (
            <button key={f} onClick={() => setFilter(f)}
              style={{
                padding: '7px 14px', borderRadius: 8, fontSize: 13,
                fontWeight: 500, cursor: 'pointer', border: 'none',
                background: filter === f ? '#6366f1' : '#f9fafb',
                color: filter === f ? 'white' : '#6b7280',
                transition: 'all 0.15s',
                textTransform: 'capitalize',
              }}>
              {f === 'all' ? 'All' : statusConfig[f].label}
            </button>
          ))}
        </div>

        {/* Add button */}
        <button onClick={openAddModal}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '8px 16px', borderRadius: 8,
            background: '#6366f1', color: 'white',
            border: 'none', cursor: 'pointer',
            fontSize: 13, fontWeight: 600,
            boxShadow: '0 2px 8px rgba(99,102,241,0.3)',
          }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19"/>
            <line x1="5" y1="12" x2="19" y2="12"/>
          </svg>
          Add Goal
        </button>
      </div>

      {/* Goals list */}
      {filteredGoals.length === 0 ? (
        <div style={{
          background: isDark ? '#1e293b' : 'white', borderRadius: 12, padding: '60px 20px',
          border: `1px solid ${isDark ? '#334155' : '#f3f4f6'}`, textAlign: 'center',
        }}>
          <div style={{
            width: 48, height: 48, borderRadius: 12,
            background: '#f9fafb', border: `1px solid ${isDark ? '#334155' : '#f3f4f6'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 12px',
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
              stroke="#d1d5db" strokeWidth="2" strokeLinecap="round">
              <circle cx="12" cy="12" r="10"/>
              <circle cx="12" cy="12" r="6"/>
              <circle cx="12" cy="12" r="2"/>
            </svg>
          </div>
          <p style={{ fontSize: 15, fontWeight: 600, color: '#6b7280', margin: '0 0 4px' }}>
            {search ? 'No goals found' : 'No goals yet'}
          </p>
          <p style={{ fontSize: 13, color: '#d1d5db', margin: '0 0 20px' }}>
            {search ? 'Try a different search' : 'Add your first goal to get started'}
          </p>
          {!search && (
            <button onClick={openAddModal}
              style={{
                padding: '8px 20px', borderRadius: 8,
                background: '#6366f1', color: 'white',
                border: 'none', cursor: 'pointer',
                fontSize: 13, fontWeight: 600,
              }}>
              Add Your First Goal
            </button>
          )}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {filteredGoals.map(goal => (
            <div key={goal.id} style={{
              background: isDark ? '#1e293b' : 'white', borderRadius: 12, padding: '20px',
              border: `1px solid ${isDark ? '#334155' : '#f3f4f6'}`, transition: 'box-shadow 0.15s',
            }}
              onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 16px rgba(0,0,0,0.06)'}
              onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.boxShadow = 'none'}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  {/* Title row */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                    <h3 style={{
                      fontSize: 15, fontWeight: 600, color: isDark ? '#f1f5f9' : '#111827',
                      margin: 0, letterSpacing: '-0.2px',
                    }}>
                      {goal.title}
                    </h3>
                    {/* Status badge */}
                    <span style={{
                      fontSize: 11, fontWeight: 600, padding: '2px 8px',
                      borderRadius: 999,
                      background: statusConfig[goal.status].bg,
                      color: statusConfig[goal.status].color,
                    }}>
                      {statusConfig[goal.status].label}
                    </span>
                    {/* Priority badge */}
                    <span style={{
                      fontSize: 11, fontWeight: 600, padding: '2px 8px',
                      borderRadius: 999,
                      background: priorityConfig[goal.priority].bg,
                      color: priorityConfig[goal.priority].color,
                    }}>
                      {priorityConfig[goal.priority].label}
                    </span>
                    {/* Category badge */}
                    <span style={{
                      fontSize: 11, fontWeight: 500, padding: '2px 8px',
                      borderRadius: 999,
                      background: '#f3f4f6',
                      color: categoryConfig[goal.category].color,
                    }}>
                      {categoryConfig[goal.category].label}
                    </span>
                  </div>

                  {/* Description */}
                  {goal.description && (
                    <p style={{ fontSize: 13, color: '#6b7280', margin: '0 0 12px', lineHeight: 1.5 }}>
                      {goal.description}
                    </p>
                  )}

                  {/* Progress */}
                  <div style={{ marginBottom: 10 }}>
                    <div style={{
                      display: 'flex', justifyContent: 'space-between',
                      alignItems: 'center', marginBottom: 6,
                    }}>
                      <span style={{ fontSize: 12, color: '#9ca3af', fontWeight: 500 }}>
                        Progress
                      </span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: '#6366f1' }}>
                        {goal.progress}%
                      </span>
                    </div>
                    <div style={{
                      height: 6, borderRadius: 999,
                      background: '#f3f4f6', overflow: 'hidden',
                    }}>
                      <div style={{
                        height: '100%', borderRadius: 999,
                        width: `${goal.progress}%`,
                        background: goal.progress === 100
                          ? '#10b981'
                          : 'linear-gradient(90deg, #6366f1, #a855f7)',
                        transition: 'width 0.3s ease',
                      }} />
                    </div>
                    {/* Progress slider */}
                    <input
                      type="range" min={0} max={100} value={goal.progress}
                      onChange={e => handleProgressChange(goal.id, Number(e.target.value))}
                      style={{ width: '100%', marginTop: 6, accentColor: '#6366f1', cursor: 'pointer' }}
                    />
                  </div>

                  {/* Target date */}
                  {goal.targetDate && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none"
                        stroke="#9ca3af" strokeWidth="2" strokeLinecap="round">
                        <rect x="3" y="4" width="18" height="18" rx="2"/>
                        <line x1="16" y1="2" x2="16" y2="6"/>
                        <line x1="8" y1="2" x2="8" y2="6"/>
                        <line x1="3" y1="10" x2="21" y2="10"/>
                      </svg>
                      <span style={{ fontSize: 12, color: '#9ca3af' }}>
                        Due {new Date(goal.targetDate).toLocaleDateString('en-US', {
                          month: 'short', day: 'numeric', year: 'numeric'
                        })}
                      </span>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                  <button onClick={() => openEditModal(goal)}
                    style={{
                      width: 32, height: 32, borderRadius: 8,
                      border: `1px solid ${isDark ? '#334155' : '#f3f4f6'}`, background: isDark ? '#1e293b' : 'white',
                      cursor: 'pointer', display: 'flex',
                      alignItems: 'center', justifyContent: 'center',
                      color: '#6b7280', transition: 'all 0.15s',
                    }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                    </svg>
                  </button>
                  <button onClick={() => handleDelete(goal.id)}
                    style={{
                      width: 32, height: 32, borderRadius: 8,
                      border: '1px solid #fecaca', background: '#fef2f2',
                      cursor: 'pointer', display: 'flex',
                      alignItems: 'center', justifyContent: 'center',
                      color: '#ef4444', transition: 'all 0.15s',
                    }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <polyline points="3 6 5 6 21 6"/>
                      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/>
                      <path d="M10 11v6M14 11v6"/>
                      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                    </svg>
                  </button>
                </div>
              </div>
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
            background: isDark ? '#1e293b' : 'white', borderRadius: 16, padding: 28,
            width: '100%', maxWidth: 520,
            boxShadow: '0 24px 64px rgba(0,0,0,0.15)',
            maxHeight: '90vh', overflowY: 'auto',
          }}>
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              alignItems: 'center', marginBottom: 24,
            }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, color: isDark ? '#f1f5f9' : '#111827', margin: 0 }}>
                {editingGoal ? 'Edit Goal' : 'Add New Goal'}
              </h2>
              <button onClick={() => setShowModal(false)}
                style={{
                  width: 32, height: 32, borderRadius: 8,
                  border: `1px solid ${isDark ? '#334155' : '#f3f4f6'}`, background: isDark ? '#1e293b' : 'white',
                  cursor: 'pointer', display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  color: '#9ca3af',
                }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Title */}
              <div>
                <label style={labelStyle}>Title <span style={{ color: '#ef4444' }}>*</span></label>
                <input type="text" value={form.title}
                  onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                  placeholder="Enter goal title"
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
                  placeholder="Describe your goal..."
                  rows={3}
                  style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }}
                  onFocus={e => e.target.style.borderColor = '#6366f1'}
                  onBlur={e => e.target.style.borderColor = '#e5e7eb'}
                />
              </div>

              {/* Category & Priority */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={labelStyle}>Category</label>
                  <select value={form.category}
                    onChange={e => setForm(p => ({ ...p, category: e.target.value as Category }))}
                    style={{ ...inputStyle, cursor: 'pointer' }}>
                    {Object.entries(categoryConfig).map(([k, v]) => (
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

              {/* Status & Target Date */}
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
                  <label style={labelStyle}>Target Date</label>
                  <input type="date" value={form.targetDate}
                    onChange={e => setForm(p => ({ ...p, targetDate: e.target.value }))}
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
              <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
                <button onClick={() => setShowModal(false)}
                  style={{
                    flex: 1, padding: '11px', borderRadius: 10,
                    border: '1px solid #e5e7eb', background: isDark ? '#1e293b' : 'white',
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
                  {editingGoal ? 'Save Changes' : 'Add Goal'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}