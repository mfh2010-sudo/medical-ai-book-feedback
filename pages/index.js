import { useState } from 'react';
import Head from 'next/head';
import { supabase } from '../lib/supabaseClient';

const CHAPTERS = [
  { num: 1, title: 'الفصل الأول — مدخل إلى الذكاء الاصطناعي' },
  { num: 2, title: 'الفصل الثاني — إتقان أدوات الذكاء الاصطناعي' },
  { num: 3, title: 'الفصل الثالث — الممارسة السريرية اليومية' },
  { num: 4, title: 'الفصل الرابع — البحث العلمي والتعليم الطبي' },
  { num: 5, title: 'الفصل الخامس — إدارة العيادات والمستشفيات' },
  { num: 6, title: 'الفصل السادس — إنشاء مساعدين ووكلاء ذكاء اصطناعي' },
  { num: 7, title: 'الفصل السابع — الاستخدام المسؤول والأخلاقي' },
  { num: 8, title: 'الفصل الثامن — بناء بيئة عمل طبية ذكية' },
];

const FEEDBACK_TYPES = [
  { value: 'suggestion', label: '💡 اقتراح تحسين' },
  { value: 'correction', label: '✏️ تصحيح خطأ' },
  { value: 'addition', label: '➕ إضافة محتوى' },
  { value: 'question', label: '❓ سؤال' },
  { value: 'other', label: '💬 أخرى' },
];

const ROLES = ['طبيب', 'مقيم', 'طالب طب', 'صيدلي', 'تمريض', 'إداري صحي', 'أخرى'];

export default function FeedbackPage() {
  const [scope, setScope] = useState('general');
  const [chapterNumber, setChapterNumber] = useState('');
  const [feedbackType, setFeedbackType] = useState('suggestion');
  const [senderName, setSenderName] = useState('');
  const [senderEmail, setSenderEmail] = useState('');
  const [senderRole, setSenderRole] = useState('');
  const [message, setMessage] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!message.trim()) {
      setError('يرجى كتابة ملاحظتك أو مقترحك قبل الإرسال');
      return;
    }
    if (scope === 'chapter' && !chapterNumber) {
      setError('يرجى تحديد الفصل المرتبط بملاحظتك');
      return;
    }

    setSubmitting(true);

    const { error: insertError } = await supabase.from('feedback').insert([
      {
        scope,
        chapter_number: scope === 'chapter' ? parseInt(chapterNumber) : null,
        feedback_type: feedbackType,
        sender_name: senderName.trim() || null,
        sender_email: senderEmail.trim() || null,
        sender_role: senderRole || null,
        message: message.trim(),
      },
    ]);

    setSubmitting(false);

    if (insertError) {
      setError('حدث خطأ أثناء الإرسال. يرجى المحاولة مرة أخرى.');
      console.error(insertError);
      return;
    }

    setSubmitted(true);
  }

  function resetForm() {
    setScope('general');
    setChapterNumber('');
    setFeedbackType('suggestion');
    setSenderName('');
    setSenderEmail('');
    setSenderRole('');
    setMessage('');
    setSubmitted(false);
    setError('');
  }

  return (
    <>
      <Head>
        <title>مقترحاتك ومراجعاتك — الذكاء الاصطناعي في الممارسة الطبية</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>

      <div className="site-header">
        <div className="eyebrow">الذكاء الاصطناعي في الممارسة الطبية</div>
        <h1>💬 شاركنا مقترحاتك ومراجعاتك</h1>
        <p>رأيك يساعد على تطوير الكتاب في إصداراته القادمة</p>
      </div>

      <div className="container">
        <div className="card">
          {submitted ? (
            <div className="success-box">
              <div className="icon">✅</div>
              <h3>شكراً لمساهمتك</h3>
              <p>
                وصلتنا ملاحظتك بنجاح. كل مقترح يُراجَع شخصياً ويُؤخذ بعين الاعتبار
                في التحديثات القادمة للكتاب.
              </p>
              <div style={{ height: 16 }} />
              <button className="btn btn-secondary" onClick={resetForm}>
                إرسال ملاحظة أخرى
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {error && <div className="error-box">{error}</div>}

              <label>هل ملاحظتك عامة على الكتاب أم مرتبطة بفصل محدد؟</label>
              <div className="scope-toggle">
                <button
                  type="button"
                  className={'scope-btn' + (scope === 'general' ? ' active' : '')}
                  onClick={() => setScope('general')}
                >
                  📖 عامة على الكتاب
                </button>
                <button
                  type="button"
                  className={'scope-btn' + (scope === 'chapter' ? ' active' : '')}
                  onClick={() => setScope('chapter')}
                >
                  📑 مرتبطة بفصل محدد
                </button>
              </div>

              {scope === 'chapter' && (
                <>
                  <label>اختر الفصل</label>
                  <select
                    value={chapterNumber}
                    onChange={(e) => setChapterNumber(e.target.value)}
                  >
                    <option value="">— اختر الفصل —</option>
                    {CHAPTERS.map((ch) => (
                      <option key={ch.num} value={ch.num}>
                        {ch.title}
                      </option>
                    ))}
                  </select>
                </>
              )}

              <label>نوع الملاحظة</label>
              <div className="type-options">
                {FEEDBACK_TYPES.map((t) => (
                  <button
                    key={t.value}
                    type="button"
                    className={'type-option' + (feedbackType === t.value ? ' active' : '')}
                    onClick={() => setFeedbackType(t.value)}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              <label>ملاحظتك أو مقترحك</label>
              <textarea
                placeholder="اكتب هنا بالتفصيل... كلما كانت الملاحظة محددة، كان تطبيقها أسهل."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />

              <label>
                اسمك <span className="optional-tag">(اختياري)</span>
              </label>
              <div className="form-row">
                <input
                  type="text"
                  placeholder="مثال: د. أحمد محمد"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                />
                <select value={senderRole} onChange={(e) => setSenderRole(e.target.value)}>
                  <option value="">صفتك المهنية (اختياري)</option>
                  {ROLES.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              <label>
                بريدك الإلكتروني <span className="optional-tag">(اختياري — للتواصل إن لزم)</span>
              </label>
              <input
                type="email"
                placeholder="example@email.com"
                value={senderEmail}
                onChange={(e) => setSenderEmail(e.target.value)}
              />

              <button className="btn btn-primary" type="submit" disabled={submitting}>
                {submitting ? 'جارٍ الإرسال...' : '📨 إرسال الملاحظة'}
              </button>
            </form>
          )}
        </div>
      </div>

      <div className="footer-note">
        الذكاء الاصطناعي في الممارسة الطبية — محمد فتحي حسن
      </div>
    </>
  );
}
