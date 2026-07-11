-- ═══════════════════════════════════════════════════════════════════
-- romantic (النسخة الأساسية / romantic-liard.vercel.app) — Supabase Schema الكامل
-- شغّل هذا الملف من: SQL Editor في مشروع Supabase الخاص بـ romantic
-- ═══════════════════════════════════════════════════════════════════

-- ─── 1. الجدول الرئيسي (صف واحد فقط) ───────────────────────────
CREATE TABLE IF NOT EXISTS public.site_content (
  id         INTEGER      PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  data       JSONB        NOT NULL DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ  NOT NULL DEFAULT now()
);

-- الصف الأول (فارغ — سيُملأ من الداشبورد)
INSERT INTO public.site_content (id, data)
VALUES (1, '{}'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- تحديث لتهيئة وإضافة قيم القلوب الافتراضية لقاعدة البيانات الحالية
UPDATE public.site_content
SET data = jsonb_set(
  data,
  '{appearance}',
  COALESCE(data->'appearance', '{}'::jsonb) 
    || jsonb_build_object('backgroundHeart', '♥', 'pushHeart', '♥')
)
WHERE id = 1;

ALTER TABLE public.site_content ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "site_content_public_read" ON public.site_content;
CREATE POLICY "site_content_public_read"
  ON public.site_content FOR SELECT
  TO anon, authenticated USING (true);

-- ─── 2. دوال قراءة وحفظ المحتوى ────────────────────────────────

-- قراءة المحتوى
CREATE OR REPLACE FUNCTION public.get_site_content()
RETURNS JSONB LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT COALESCE((SELECT data FROM site_content WHERE id = 1), '{}'::jsonb);
$$;

-- حفظ المحتوى (محمي بكلمة مرور الداشبورد)
CREATE OR REPLACE FUNCTION public.save_site_content(p_password TEXT, p_content JSONB)
RETURNS JSONB LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  current_password TEXT;
BEGIN
  -- يتحقق من adminPassword أولاً، ثم password كـ fallback (مع تحويل النص الفارغ إلى NULL)
  SELECT COALESCE(NULLIF(data->>'adminPassword', ''), data->>'password')
    INTO current_password
    FROM site_content WHERE id = 1;

  IF current_password IS NOT NULL AND p_password IS DISTINCT FROM current_password THEN
    RAISE EXCEPTION 'invalid_password';
  END IF;

  UPDATE site_content SET data = p_content, updated_at = now() WHERE id = 1;
  RETURN p_content;
END;
$$;

-- التحقق من كلمة المرور
CREATE OR REPLACE FUNCTION public.verify_site_password(p_password TEXT)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT COALESCE(
    (SELECT (data->>'password') IS NOT DISTINCT FROM p_password
     FROM site_content WHERE id = 1),
    false
  );
$$;

GRANT EXECUTE ON FUNCTION public.get_site_content()              TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.save_site_content(TEXT, JSONB)  TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.verify_site_password(TEXT)       TO anon, authenticated;

-- ─── 3. Storage Bucket للصور والموسيقى ──────────────────────────
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'romantic-assets', 'romantic-assets', true, 52428800,
  ARRAY[
    'image/jpeg','image/png','image/webp','image/gif',
    'audio/mpeg','audio/mp3','audio/ogg','audio/wav',
    'audio/mp4','audio/aac','audio/flac','audio/webm',
    'audio/opus','application/octet-stream'
  ]
)
ON CONFLICT (id) DO UPDATE SET
  public             = EXCLUDED.public,
  file_size_limit    = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "romantic_assets_public_read"   ON storage.objects;
DROP POLICY IF EXISTS "romantic_assets_public_insert" ON storage.objects;
DROP POLICY IF EXISTS "romantic_assets_public_update" ON storage.objects;
DROP POLICY IF EXISTS "romantic_assets_public_delete" ON storage.objects;

CREATE POLICY "romantic_assets_public_read"
  ON storage.objects FOR SELECT TO anon, authenticated
  USING (bucket_id = 'romantic-assets');

CREATE POLICY "romantic_assets_public_insert"
  ON storage.objects FOR INSERT TO anon, authenticated
  WITH CHECK (bucket_id = 'romantic-assets');

CREATE POLICY "romantic_assets_public_update"
  ON storage.objects FOR UPDATE TO anon, authenticated
  USING (bucket_id = 'romantic-assets');

CREATE POLICY "romantic_assets_public_delete"
  ON storage.objects FOR DELETE TO anon, authenticated
  USING (bucket_id = 'romantic-assets');

-- ─── 4. هيكل البيانات الكامل (JSON) لعمود data ──────────────────
--
-- الحقول المُخزَّنة داخل data (JSONB):
--
-- {
--   "siteName":      "",              ← اسم الموقع (يظهر في التاب والداشبورد)
--   "password":      "ThisIsLove",    ← كلمة مرور الزائر
--   "adminPassword": "",              ← كلمة مرور الداشبورد (مستقلة)
--
--   "appearance": {
--     "primaryColor":        "#fb7185",   ← اللون الرئيسي للموقع
--     "backgroundHeartColor":"#be123c",   ← لون قلوب الخلفية (غير مستخدم)
--     "heartOpacity":        0.65         ← شفافية القلوب الطائرة (0.1 → 1)
--   },
--
--   "login": {
--     "eyebrow":       "",    ← العنوان الصغير فوق العنوان الرئيسي
--     "title":         "",    ← العنوان الرئيسي لصفحة الدخول
--     "subtitle":      "",    ← نص الوصف
--     "passwordLabel": "",    ← تسمية حقل كلمة المرور
--     "placeholder":   "",    ← النص الرمادي داخل حقل كلمة المرور
--     "button":        "",    ← نص زر الدخول
--     "error":         "",    ← رسالة الخطأ عند كلمة مرور خاطئة
--     "footer":        ""     ← نص التذييل أسفل الصفحة
--   },
--
--   "welcome": {
--     "eyebrow":    "",    ← العنوان الصغير في صفحة الترحيب
--     "title":      "",    ← العنوان الرئيسي
--     "subtitle":   "",    ← نص الوصف
--     "nextButton": ""     ← نص زر التالي → قصتنا
--   },
--
--   "story": {
--     "eyebrow": "",              ← العنوان الصغير للقصة
--     "title":   "",              ← عنوان القصة
--     "firstMeeting": {
--       "label":       "",        ← عنوان بطاقة أول لقاء
--       "description": ""         ← نص بطاقة أول لقاء
--     },
--     "loveConfession": {
--       "label":   "",            ← عنوان بطاقة الاعتراف
--       "message": ""             ← نص بطاقة الاعتراف
--     },
--     "memoriesButton": ""        ← نص زر الانتقال لذكريات القصة
--   },
--
--   "dates": {
--     "relationshipStart": "",    ← تاريخ بداية العلاقة (ISO string)
--     "firstMeeting":      "",    ← تاريخ أول لقاء (YYYY-MM-DD)
--     "loveConfession":    ""     ← تاريخ الاعتراف (YYYY-MM-DD)
--   },
--
--   "music": {
--     "tracks": [                 ← قائمة تشغيل (حتى 5 أغاني)
--       {
--         "id":       "track-uuid",   ← معرّف فريد للأغنية
--         "title":    "",             ← اسم/عنوان الأغنية (تكتبه أنت)
--         "fileName": "",             ← اسم الملف الصوتي المرفوع
--         "src":      ""              ← رابط Supabase Storage الكامل
--       },
--       ... (حتى 5 عناصر)
--     ]
--     -- ملاحظة: الحقول القديمة (src, fileName, title, volume) على المستوى
--     --         الجذري ما زالت مدعومة للتوافق مع البيانات القديمة
--   },
--
--   "gallery": {
--     "eyebrow":     "",    ← العنوان الصغير لصفحة المعرض
--     "title":       "",    ← عنوان المعرض
--     "finalButton": ""     ← نص زر الانتقال للصفحة الأخيرة
--   },
--
--   "final": {
--     "eyebrow": "",    ← العنوان الصغير للصفحة الأخيرة
--     "title":   "",    ← العنوان الرئيسي
--     "text":    ""     ← الرسالة الختامية
--   },
--
--   "memories": [              ← ذكريات القصة (تظهر في القصة والمعرض)
--     {
--       "id":    1,             ← رقم تسلسلي فريد
--       "image": "",            ← رابط الصورة (Supabase Storage)
--       "date":  "YYYY-MM-DD",  ← تاريخ الذكرى
--       "text":  ""             ← نص الذكرى
--     }
--   ],
--
--   "galleryItems": [          ← صور المعرض المنفصلة (اختياري)
--     {
--       "id":    1,
--       "image": "",
--       "date":  "YYYY-MM-DD",
--       "text":  ""
--     }
--   ]
-- }
--
-- ★ الفرق بين romantic و romantic-site:
--   • romantic     → nextButton, memoriesButton, finalButton مستخدمة للتنقل بين الصفحات
--   • romantic-site → لا توجد أزرار للتنقل، والتنقل يعتمد بالكامل على السكرول

-- ─── 5. مثال تهيئة البيانات الأولية (اختياري) ───────────────────
-- شغّل هذا لو أردت ملء البيانات من البداية مرة واحدة:
/*
UPDATE public.site_content
SET data = jsonb_build_object(
  'siteName',      '',
  'password',      'ThisIsLove',
  'adminPassword', '',
  'appearance', jsonb_build_object(
    'primaryColor',        '#fb7185',
    'backgroundHeartColor','#be123c',
    'heartOpacity',        0.65,
    'backgroundHeart',     '♥',
    'pushHeart',           '♥'
  ),
  'login', jsonb_build_object(
    'eyebrow', '', 'title', '', 'subtitle', '',
    'passwordLabel', '', 'placeholder', '',
    'button', '', 'error', '', 'footer', ''
  ),
  'welcome', jsonb_build_object(
    'eyebrow', '', 'title', '', 'subtitle', '', 'nextButton', ''
  ),
  'story', jsonb_build_object(
    'eyebrow', '', 'title', '',
    'firstMeeting',    jsonb_build_object('label', '', 'description', ''),
    'loveConfession',  jsonb_build_object('label', '', 'message', ''),
    'memoriesButton', ''
  ),
  'dates', jsonb_build_object(
    'relationshipStart', '', 'firstMeeting', '', 'loveConfession', ''
  ),
  'music', jsonb_build_object('tracks', '[]'::jsonb),
  'gallery', jsonb_build_object('eyebrow', '', 'title', '', 'finalButton', ''),
  'final',   jsonb_build_object('eyebrow', '', 'title', '', 'text', ''),
  'memories',    '[]'::jsonb,
  'galleryItems','[]'::jsonb
),
updated_at = now()
WHERE id = 1;
*/
