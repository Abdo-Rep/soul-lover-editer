export function rowToContent(row, memories = [], galleryItems = [], wishlistItems = []) {
  if (!row) return null
  return {
    siteName: row.site_name,
    password: row.visitor_password,
    adminPassword: row.admin_password,
    appearance: {
      primaryColor: row.primary_color,
      backgroundHeartColor: row.background_heart_color,
      heartOpacity: Number(row.heart_opacity || 0.65),
      backgroundHeart: row.background_heart_char,
      pushHeart: row.push_heart_char,
    },
    dates: {
      relationshipStart: row.date_relationship_start || '',
      firstMeeting: row.date_first_meeting || '',
      loveConfession: row.date_love_confession || '',
    },
    music: {
      fileName: row.music_file_name || 'romantic.mp3',
      title: row.music_title || 'أغنيتنا',
      src: row.music_src || '',
      volume: Number(row.music_volume || 0.35),
    },
    login: {
      eyebrow: row.login_eyebrow || 'هدية من قلبي',
      title: row.login_title || 'أهلاً يا حبيبتي',
      subtitle: row.login_subtitle || 'خلف هذا الباب عالم صغير صنعته لكِ وحدك — ذكرياتنا، قصتنا، وكل نبضة حب في قلبي.',
      placeholder: row.login_placeholder || 'كلمة المرور السرية',
      passwordLabel: row.login_password_label || 'كلمة المرور',
      button: row.login_button || 'افتحي قلبي',
      error: row.login_error || 'كلمة المرور غير صحيحة، حاولي مرة أخرى يا جميلتي.',
      footer: row.login_footer || 'صُنع بحب، لكِ وحدك',
    },
    welcome: {
      eyebrow: row.welcome_eyebrow || 'وصلتِ إليه أخيراً',
      title: row.welcome_title || 'مرحباً يا أجمل حب في حياتي',
      subtitle: row.welcome_subtitle || 'كل ما ينتظركِ هنا كُتب وأُعدّ بكِ في بالي — رحلة ناعمة عبر قصتنا، وقتنا، والحب الذي نعيشه معاً.',
    },
    story: {
      eyebrow: row.story_eyebrow || 'A Love Story',
      title: row.story_title || 'Our Story',
      firstMeeting: {
        label: row.story_first_meeting_label || 'أول يوم التقينا فيه',
        description: row.story_first_meeting_description || 'لم أكن أعلم بعد، لكن قلبي كان قد بدأ بالفعل يجد طريقه إليكِ.',
      },
      loveConfession: {
        label: row.story_love_confession_label || 'اليوم الذي قلت فيه "أحبك"',
        message: row.story_love_confession_message || 'ثلاث كلمات صغيرة — وفجأة أصبح العالم أدفأ، وأنعم، وأجمل بلا حدود.',
      },
    },
    gallery: {
      eyebrow: row.gallery_eyebrow || 'Our Album',
      title: row.gallery_title || 'Memories',
    },
    final: {
      eyebrow: row.final_eyebrow || 'رسالة أخيرة',
      title: row.final_title || 'للأبد ودائماً',
      text: row.final_text || 'أينما ذهب بنا الحياة، سيجد قلبي دائماً طريقه العائد إليكِ. أنتِ حلمي الذي أريد أن أعيشه كل يوم، ونبضتي التي أشتاق إليها في كل لحظة. شكراً لأنكِ أنتِ.',
    },
    memories: memories.map((m) => ({
      id: m.id,
      image: m.image,
      date: m.date,
      text: m.text,
    })),
    galleryItems: galleryItems.map((g) => ({
      id: g.id,
      url: g.url,
      date: g.date,
      description: g.description,
    })),
    wishlist: wishlistItems.map((w) => ({
      id: w.id,
      text: w.text,
      completed: Boolean(w.completed),
    })),
  }
}

export async function fetchCompleteSite(pool, slug) {
  const siteRes = await pool.query('SELECT * FROM sites WHERE slug = $1;', [slug])
  if (siteRes.rows.length === 0) return null

  const row = siteRes.rows[0]
  const siteId = row.id

  const memoriesRes = await pool.query('SELECT * FROM memories WHERE site_id = $1 ORDER BY created_at ASC;', [siteId])
  const galleryRes = await pool.query('SELECT * FROM gallery_items WHERE site_id = $1 ORDER BY created_at ASC;', [siteId])
  const wishlistRes = await pool.query('SELECT * FROM wishlist_items WHERE site_id = $1 ORDER BY created_at ASC;', [siteId])

  return {
    row,
    content: rowToContent(row, memoriesRes.rows, galleryRes.rows, wishlistRes.rows)
  }
}

export async function saveRelationalContent(pool, slug, content) {
  // 1. Get site metadata
  const siteRes = await pool.query('SELECT id, visitor_password, admin_password FROM sites WHERE slug = $1;', [slug])
  if (siteRes.rows.length === 0) {
    throw new Error('site_not_found')
  }
  const siteId = siteRes.rows[0].id

  // 2. Perform updates to sites table
  const updates = []
  const values = []
  let paramIdx = 1

  function addField(colName, value) {
    if (value !== undefined) {
      updates.push(`${colName} = $${paramIdx}`)
      values.push(value)
      paramIdx++
    }
  }

  if (content.siteName !== undefined) addField('site_name', content.siteName)
  if (content.password !== undefined) addField('visitor_password', content.password)
  if (content.adminPassword !== undefined) addField('admin_password', content.adminPassword)

  if (content.appearance) {
    addField('primary_color', content.appearance.primaryColor)
    addField('background_heart_color', content.appearance.backgroundHeartColor)
    addField('heart_opacity', content.appearance.heartOpacity)
    addField('background_heart_char', content.appearance.backgroundHeart)
    addField('push_heart_char', content.appearance.pushHeart)
  }

  if (content.dates) {
    addField('date_relationship_start', content.dates.relationshipStart)
    addField('date_first_meeting', content.dates.firstMeeting)
    addField('date_love_confession', content.dates.loveConfession)
  }

  if (content.music) {
    addField('music_file_name', content.music.fileName)
    addField('music_title', content.music.title)
    addField('music_src', content.music.src)
    addField('music_volume', content.music.volume)
  }

  if (content.login) {
    addField('login_eyebrow', content.login.eyebrow)
    addField('login_title', content.login.title)
    addField('login_subtitle', content.login.subtitle)
    addField('login_placeholder', content.login.placeholder)
    addField('login_password_label', content.login.passwordLabel)
    addField('login_button', content.login.button)
    addField('login_error', content.login.error)
    addField('login_footer', content.login.footer)
  }

  if (content.welcome) {
    addField('welcome_eyebrow', content.welcome.eyebrow)
    addField('welcome_title', content.welcome.title)
    addField('welcome_subtitle', content.welcome.subtitle)
  }

  if (content.story) {
    addField('story_eyebrow', content.story.eyebrow)
    addField('story_title', content.story.title)
    if (content.story.firstMeeting) {
      addField('story_first_meeting_label', content.story.firstMeeting.label)
      addField('story_first_meeting_description', content.story.firstMeeting.description)
    }
    if (content.story.loveConfession) {
      addField('story_love_confession_label', content.story.loveConfession.label)
      addField('story_love_confession_message', content.story.loveConfession.message)
    }
  }

  if (content.gallery) {
    addField('gallery_eyebrow', content.gallery.eyebrow)
    addField('gallery_title', content.gallery.title)
  }

  if (content.final) {
    addField('final_eyebrow', content.final.eyebrow)
    addField('final_title', content.final.title)
    addField('final_text', content.final.text)
  }

  if (updates.length > 0) {
    values.push(siteId)
    await pool.query(
      `UPDATE sites SET ${updates.join(', ')}, updated_at = NOW() WHERE id = $${paramIdx};`,
      values
    )
  }

  // 3. Synchronize memories
  if (content.memories && Array.isArray(content.memories)) {
    // Delete existing memories for this site
    await pool.query('DELETE FROM memories WHERE site_id = $1;', [siteId])
    for (const mem of content.memories) {
      await pool.query(
        'INSERT INTO memories (site_id, tenant_slug, image, date, text) VALUES ($1, $2, $3, $4, $5);',
        [siteId, slug, mem.image || '', mem.date || '', mem.text || '']
      )
    }
  }

  // 4. Synchronize gallery items
  if (content.galleryItems && Array.isArray(content.galleryItems)) {
    // Delete existing gallery items
    await pool.query('DELETE FROM gallery_items WHERE site_id = $1;', [siteId])
    for (const item of content.galleryItems) {
      await pool.query(
        'INSERT INTO gallery_items (site_id, tenant_slug, url, date, description) VALUES ($1, $2, $3, $4, $5);',
        [siteId, slug, item.url || '', item.date || '', item.description || '']
      )
    }
  }

  // 5. Synchronize wishlist items
  if (content.wishlist && Array.isArray(content.wishlist)) {
    // Delete existing wishlist items
    await pool.query('DELETE FROM wishlist_items WHERE site_id = $1;', [siteId])
    for (const item of content.wishlist) {
      await pool.query(
        'INSERT INTO wishlist_items (site_id, tenant_slug, text, completed) VALUES ($1, $2, $3, $4);',
        [siteId, slug, item.text || '', Boolean(item.completed)]
      )
    }
  }

  return await fetchCompleteSite(pool, slug)
}
