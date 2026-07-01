import { useState, useEffect } from 'react';
import Head from 'next/head';
import { supabase } from '../lib/supabaseClient';

const CHAPTER_NAMES = {
  1: 'الفصل الأول', 2: 'الفصل الثاني', 3: 'الفصل الثالث', 4: 'الفصل الرابع',
  5: 'الفصل الخامس', 6: 'الفصل السادس', 7: 'الفصل السابع', 8: 'الفصل الثامن',
};

const TYPE_LABELS = {
  suggestion: '💡 اقتراح', correction: '✏️ تصحيح', addition: '➕ إضافة',
  question: '❓ سؤال', other: '💬 أخرى',
};

const STATUS_LABELS = {
  new: 'جديد', reviewed: 'تمت المراجعة', applied: 'تم التطبيق', dismissed: 'مرفوض',
};

export default function AdminPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [authError, setAuthError] = useState('');

  const [feedbackList, setFeedbackList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [filterScope, setFilterScope] = useState('all');
  const [filterChapter, setFilterChapter] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');

  function handleLogin(e) {
    e.preventDefault();
    const correctPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD;
    if (passwordInput === correctPassword) {
      setAuthenticated(true);
      setAuthError('');
      sessionStorage.setItem('admin_authed', '1');
    } else {
      setAuthError('كلمة المرور غير صحيحة');
    }
  }

  useEffect(() => {
    if (sessionStorage.getItem('admin_authed') === '1') {
      setAuthenticated(true);
    }
  }, []);

  useEffect(() => {
    if (authenticated) fetchFeedback();
  }, [authenticated]);

  async function fetchFeedback() {
    setLoading(true);
    const { data, error } = await supabase
      .from('feedback')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setFeedbackList(data);
    }
    setLoading(false);
  }

  async function updateStatus(id, newStatus) {
    setFeedbackList((prev) =>
      prev.map((f) => (f.id === id ? { ...f, status: newStatus } : f))
    );
    await supabase.from('feedback').update({ status: newStatus }).eq('id', id);
  }

  const filtered = feedbackList.filter((f) => {
    if (filterScope !== 'all' && f.scope !== filterScope) return false;
    if (filterChapter !== 'all' && String(f.chapter_number) !== filterChapter) return false;
    if (filterStatus !== 'all' && f.status !== filterStatus) return false;
    if (filterType !== 'all' && f.feedback_type !== filterType) return false;
    return true;
  });

  const stats = {
    total: feedbackList.length,
    new: feedbackList.filter((f) => f.status === 'new').length,
    general: feedbackList.filter((f) => f.scope === 'general').length,
    chapter: feedbackList.filter((f) => f.scope === 'chapter').length,
  };

  function formatDate(iso) {
    const d = new Date(iso);
    return d.toLocaleDateString('ar-EG', { year: 'numeric', month: 'short', day: 'numeric' }) +
      ' — ' + d.toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' });
  }

  if (!authenticated) {
    return (
      <>
        <Head>
          <title>لوحة المراجعة — تسجيل الدخول</title>
        </Head>
        <div className="site-header">
          <div className="eyebrow">الذكاء الاصطناعي في الممارسة الطبية</div>
          <h1>🔐 لوحة مراجعة المقترحات</h1>
        </div>
        <div className="container">
          <div className="card admin-login-card">
            <form onSubmit={handleLogin}>
              <label>كلمة المرور</label>
              <input
                type="password"
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                placeholder="••••••••"
                autoFocus
              />
              {authError && <div className="error-box">{authError}</div>}
              <button className="btn btn-primary" type="submit">
                دخول
              </button>
            </form>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Head>
        <title>لوحة مراجعة المقترحات</title>
      </Head>

      <div className="site-header">
        <div className="eyebrow">الذكاء الاصطناعي في الممارسة الطبية</div>
        <h1>🔐 لوحة مراجعة المقترحات والمراجعات</h1>
      </div>

      <div className="container" style={{ maxWidth: 900 }}>
        <div className="admin-stats">
          <div className="admin-stat-pill">📊 الإجمالي: {stats.total}</div>
          <div className="admin-stat-pill muted">🆕 جديد: {stats.new}</div>
          <div className="admin-stat-pill muted">📖 عام: {stats.general}</div>
          <div className="admin-stat-pill muted">📑 فصول: {stats.chapter}</div>
        </div>

        <div className="admin-toolbar">
          <select className="admin-filter-select" value={filterScope} onChange={(e) => setFilterScope(e.target.value)}>
            <option value="all">كل الأنواع (عام/فصل)</option>
            <option value="general">عام فقط</option>
            <option value="chapter">مرتبط بفصل فقط</option>
          </select>

          <select className="admin-filter-select" value={filterChapter} onChange={(e) => setFilterChapter(e.target.value)}>
            <option value="all">كل الفصول</option>
            {Object.entries(CHAPTER_NAMES).map(([num, name]) => (
              <option key={num} value={num}>{name}</option>
            ))}
          </select>

          <select className="admin-filter-select" value={filterType} onChange={(e) => setFilterType(e.target.value)}>
            <option value="all">كل أنواع الملاحظات</option>
            {Object.entries(TYPE_LABELS).map(([val, label]) => (
              <option key={val} value={val}>{label}</option>
            ))}
          </select>

          <select className="admin-filter-select" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="all">كل الحالات</option>
            {Object.entries(STATUS_LABELS).map(([val, label]) => (
              <option key={val} value={val}>{label}</option>
            ))}
          </select>

          <button className="btn btn-secondary" style={{ width: 'auto', padding: '8px 16px' }} onClick={fetchFeedback}>
            🔄 تحديث
          </button>
        </div>

        {loading ? (
          <div className="empty-state">
            <div className="icon">⏳</div>
            جارٍ التحميل...
          </div>
        ) : filtered.length === 0 ? (
          <div className="empty-state">
            <div className="icon">📭</div>
            لا توجد مقترحات تطابق هذه الفلاتر
          </div>
        ) : (
          filtered.map((f) => (
            <div className="feedback-card" key={f.id}>
              <div className="feedback-card-top">
                <div className="feedback-tags">
                  <span className={'fb-tag scope-' + f.scope}>
                    {f.scope === 'general' ? '📖 عام' : '📑 ' + (CHAPTER_NAMES[f.chapter_number] || 'فصل')}
                  </span>
                  <span className={'fb-tag type-' + f.feedback_type}>
                    {TYPE_LABELS[f.feedback_type]}
                  </span>
                </div>
                <div className="fb-date">{formatDate(f.created_at)}</div>
              </div>

              <div className="fb-message">{f.message}</div>

              {(f.sender_name || f.sender_role || f.sender_email) && (
                <div className="fb-meta">
                  {f.sender_name && <>👤 {f.sender_name} </>}
                  {f.sender_role && <>— {f.sender_role} </>}
                  {f.sender_email && <>— 📧 {f.sender_email}</>}
                </div>
              )}

              <div className="fb-actions">
                <select
                  className={'fb-status-select status-' + f.status}
                  value={f.status}
                  onChange={(e) => updateStatus(f.id, e.target.value)}
                >
                  {Object.entries(STATUS_LABELS).map(([val, label]) => (
                    <option key={val} value={val}>{label}</option>
                  ))}
                </select>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="footer-note">لوحة إدارة خاصة — الذكاء الاصطناعي في الممارسة الطبية</div>
    </>
  );
}
