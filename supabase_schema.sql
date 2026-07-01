-- ════════════════════════════════════════════════════════════
-- جدول مقترحات ومراجعات الكتاب
-- نفّذ هذا الكود في: Supabase Dashboard → SQL Editor → New Query
-- ════════════════════════════════════════════════════════════

create table feedback (
  id uuid primary key default gen_random_uuid(),
  created_at timestamp with time zone default now(),

  -- نوع المقترح
  scope text not null check (scope in ('general', 'chapter')),  -- عام أو مرتبط بفصل
  chapter_number int,                                            -- رقم الفصل (1-8) إن كان scope = 'chapter'

  -- نوع الملاحظة
  feedback_type text not null check (feedback_type in ('suggestion', 'correction', 'addition', 'question', 'other')),

  -- بيانات المُرسِل (اختيارية)
  sender_name text,
  sender_email text,
  sender_role text,  -- طبيب / مقيم / طالب / إداري / أخرى

  -- المحتوى
  message text not null,

  -- حالة المراجعة (يُستخدمها المؤلف فقط من لوحة الإدارة)
  status text not null default 'new' check (status in ('new', 'reviewed', 'applied', 'dismissed')),
  admin_notes text
);

-- فهرسة لتسريع الاستعلامات الشائعة
create index idx_feedback_status on feedback(status);
create index idx_feedback_scope on feedback(scope);
create index idx_feedback_chapter on feedback(chapter_number);
create index idx_feedback_created on feedback(created_at desc);

-- ════════════════════════════════════════════════════════════
-- سياسات الأمان (Row Level Security)
-- نسمح للجميع بالإضافة (إرسال مقترح)، لكن القراءة محمية بكلمة مرور
-- على مستوى التطبيق (راجع pages/admin.js)
-- ════════════════════════════════════════════════════════════

alter table feedback enable row level security;

-- السماح لأي شخص (حتى غير المسجلين) بإضافة مقترح جديد
create policy "anyone_can_insert_feedback"
  on feedback for insert
  to anon
  with check (true);

-- السماح بالقراءة من خلال الـ anon key (الحماية الفعلية تتم في صفحة الإدارة بكلمة مرور)
-- إذا أردت حماية أقوى لاحقاً، استبدل هذه السياسة بمصادقة Supabase Auth حقيقية
create policy "anon_can_select_feedback"
  on feedback for select
  to anon
  using (true);

-- السماح بالتحديث (لتغيير الحالة من لوحة الإدارة)
create policy "anon_can_update_feedback"
  on feedback for update
  to anon
  using (true);

-- ════════════════════════════════════════════════════════════
-- ملاحظة مهمة:
-- السياسات أعلاه تسمح بالقراءة والتحديث للجميع تقنياً عبر الـ anon key
-- (لأن الحماية الحقيقية بكلمة المرور تتم داخل كود صفحة /admin فقط).
-- هذا مقبول لمشروع شخصي بسيط، لكن إذا أردت حماية أقوى على مستوى
-- قاعدة البيانات نفسها لاحقاً، أخبرني وسأبني نظام مصادقة حقيقي
-- باستخدام Supabase Auth بدلاً من كلمة مرور ثابتة في الكود.
-- ════════════════════════════════════════════════════════════
