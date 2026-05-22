'use client';

import { useState, useEffect } from 'react';

type Tab = 'overview' | 'habits' | 'goals' | 'projects';

const weeklyData = [
  { day: 'Mon', hours: 6 },
  { day: 'Tue', hours: 8 },
  { day: 'Wed', hours: 5 },
  { day: 'Thu', hours: 9 },
  { day: 'Fri', hours: 7 },
  { day: 'Sat', hours: 4 },
  { day: 'Sun', hours: 3 },
];

const maxHours = Math.max(...weeklyData.map(d => d.hours));

const monthlyStats = [
  { label: 'Study Hours', value: 0, unit: 'hrs', color: '#6366f1', max: 100 },
  { label: 'Tasks Done', value: 0, unit: '', color: '#10b981', max: 50 },
  { label: 'Habits Kept', value: 0, unit: '%', color: '#f59e0b', max: 100 },
  { label: 'Goals Done', value: 0, unit: '%', color: '#8b5cf6', max: 100 },
];

const streakItems = [
  { label: 'Current Streak', value: '0 days', icon: '🔥' },
  { label: 'Longest Streak', value: '0 days', icon: '⚡' },
  { label: 'Total Active Days', value: '0 days', icon: '📅' },
  { label: 'Habits Completed', value: '0 total', icon: '✓' },
];

const tabs: { key: Tab; label: string }[] = [
  { key: 'overview', label: 'Overview' },
  { key: 'habits', label: 'Habits' },
  { key: 'goals', label: 'Goals' },
  { key: 'projects', label: 'Projects' },
];

export default function StatsPage() {
  const [isMobile, setIsMobile] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const todayIndex = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1;

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  return (
    <div style={{ maxWidth: 1200 }}>

      {/* Tabs */}
      <div style={{
        display: 'flex', gap: 4, marginBottom: isMobile ? 16 : 24,
        background: 'white', borderRadius: 12, padding: 6,
        border: '1px solid #f3f4f6', overflowX: 'auto',
      }}>
        {tabs.map(tab => (
          <button key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              flex: isMobile ? 'none' : 1,
              padding: isMobile ? '8px 14px' : '9px 16px',
              borderRadius: 8, border: 'none', cursor: 'pointer',
              fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap',
              background: activeTab === tab.key ? '#6366f1' : 'transparent',
              color: activeTab === tab.key ? 'white' : '#6b7280',
              transition: 'all 0.15s',
            }}>
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div>
          {/* Monthly stats cards */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)',
            gap: isMobile ? 10 : 16,
            marginBottom: isMobile ? 16 : 24,
          }}>
            {monthlyStats.map(s => (
              <div key={s.label} style={{
                background: 'white', borderRadius: 12,
                padding: isMobile ? '14px' : '20px',
                border: '1px solid #f3f4f6',
              }}>
                <p style={{
                  fontSize: 12, color: '#9ca3af',
                  margin: '0 0 8px', fontWeight: 500,
                }}>
                  {s.label}
                </p>
                <p style={{
                  fontSize: isMobile ? 24 : 28, fontWeight: 700,
                  color: '#111827', margin: '0 0 12px',
                  letterSpacing: '-0.5px',
                }}>
                  {s.value}{s.unit}
                </p>
                <div style={{
                  height: 4, borderRadius: 999,
                  background: '#f3f4f6', overflow: 'hidden',
                }}>
                  <div style={{
                    height: '100%', borderRadius: 999,
                    width: `${(s.value / s.max) * 100}%`,
                    background: s.color,
                  }} />
                </div>
              </div>
            ))}
          </div>

          {/* Weekly chart */}
          <div style={{
            background: 'white', borderRadius: 12,
            padding: isMobile ? '16px' : '24px',
            border: '1px solid #f3f4f6',
            marginBottom: isMobile ? 16 : 24,
          }}>
            <div style={{
              display: 'flex', justifyContent: 'space-between',
              alignItems: 'center', marginBottom: 20,
            }}>
              <h3 style={{ fontSize: 14, fontWeight: 600, color: '#111827', margin: 0 }}>
                Weekly Activity
              </h3>
              <span style={{ fontSize: 12, color: '#9ca3af' }}>This week</span>
            </div>

            <div style={{
              display: 'flex', alignItems: 'flex-end',
              gap: isMobile ? 8 : 16, height: 120,
              paddingBottom: 28, position: 'relative',
            }}>
              {[0, 33, 66, 100].map(p => (
                <div key={p} style={{
                  position: 'absolute', left: 0, right: 0,
                  bottom: `calc(${p}% + 24px)`,
                  borderTop: '1px dashed #f3f4f6', zIndex: 0,
                }} />
              ))}

              {weeklyData.map((d, i) => {
                const isToday = i === todayIndex;
                return (
                  <div key={d.day} style={{
                    flex: 1, display: 'flex',
                    flexDirection: 'column', alignItems: 'center',
                    gap: 6, position: 'relative', zIndex: 1,
                  }}>
                    <div style={{
                      width: '100%', borderRadius: '4px 4px 0 0',
                      height: `${(d.hours / maxHours) * 96}px`,
                      background: isToday
                        ? 'linear-gradient(180deg, #6366f1, #a855f7)'
                        : '#e0e7ff',
                      minHeight: 4,
                    }} />
                    <span style={{
                      fontSize: 11,
                      fontWeight: isToday ? 700 : 400,
                      color: isToday ? '#6366f1' : '#9ca3af',
                    }}>
                      {d.day}
                    </span>
                  </div>
                );
              })}
            </div>

            <div style={{ display: 'flex', gap: 16, marginTop: 4 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{
                  width: 10, height: 10, borderRadius: 3,
                  background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                }} />
                <span style={{ fontSize: 12, color: '#9ca3af' }}>Today</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <div style={{
                  width: 10, height: 10, borderRadius: 3,
                  background: '#e0e7ff',
                }} />
                <span style={{ fontSize: 12, color: '#9ca3af' }}>Other days</span>
              </div>
            </div>
          </div>

          {/* Bottom grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
            gap: isMobile ? 12 : 16,
          }}>
            {/* Productivity score */}
            <div style={{
              background: 'white', borderRadius: 12,
              padding: isMobile ? '16px' : '24px',
              border: '1px solid #f3f4f6',
            }}>
              <h3 style={{
                fontSize: 14, fontWeight: 600,
                color: '#111827', margin: '0 0 16px',
              }}>
                Productivity Score
              </h3>
              <div style={{
                display: 'flex', alignItems: 'center',
                justifyContent: 'center', padding: '16px 0',
              }}>
                <div style={{ position: 'relative' }}>
                  <svg width="120" height="120" style={{ transform: 'rotate(-90deg)' }}>
                    <circle cx="60" cy="60" r="50"
                      fill="none" stroke="#f3f4f6" strokeWidth="10" />
                    <circle cx="60" cy="60" r="50"
                      fill="none" stroke="#6366f1" strokeWidth="10"
                      strokeDasharray="0 314"
                      strokeLinecap="round" />
                  </svg>
                  <div style={{
                    position: 'absolute', top: '50%', left: '50%',
                    transform: 'translate(-50%, -50%)',
                    textAlign: 'center',
                  }}>
                    <div style={{
                      fontSize: 24, fontWeight: 700,
                      color: '#111827', letterSpacing: '-0.5px',
                    }}>
                      0
                    </div>
                    <div style={{ fontSize: 11, color: '#9ca3af' }}>/ 100</div>
                  </div>
                </div>
              </div>
              <p style={{
                textAlign: 'center', fontSize: 13,
                color: '#9ca3af', margin: 0,
              }}>
                Start logging to build your score
              </p>
            </div>

            {/* Streak summary */}
            <div style={{
              background: 'white', borderRadius: 12,
              padding: isMobile ? '16px' : '24px',
              border: '1px solid #f3f4f6',
            }}>
              <h3 style={{
                fontSize: 14, fontWeight: 600,
                color: '#111827', margin: '0 0 16px',
              }}>
                Streak Summary
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {streakItems.map(item => (
                  <div key={item.label} style={{
                    display: 'flex', alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 14px', borderRadius: 10,
                    background: '#f9fafb', border: '1px solid #f3f4f6',
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 16 }}>{item.icon}</span>
                      <span style={{ fontSize: 13, color: '#6b7280', fontWeight: 500 }}>
                        {item.label}
                      </span>
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#111827' }}>
                      {item.value}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab !== 'overview' && (
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
              <line x1="18" y1="20" x2="18" y2="10"/>
              <line x1="12" y1="20" x2="12" y2="4"/>
              <line x1="6" y1="20" x2="6" y2="14"/>
            </svg>
          </div>
          <p style={{ fontSize: 15, fontWeight: 600, color: '#6b7280', margin: '0 0 4px' }}>
            {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Statistics
          </p>
          <p style={{ fontSize: 13, color: '#d1d5db', margin: 0 }}>
            Add some {activeTab} to see your statistics here
          </p>
        </div>
      )}
    </div>
  );
}