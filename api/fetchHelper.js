/**
 * Resilient Fetch Helper for Soulove SaaS
 * Solves PostgREST 503 (PGRST002/PGRST000 schema cache reloads) and Vercel serverless timeouts.
 */

export async function fetchWithResilience(url, options = {}, maxRetries = 1, attemptTimeoutMs = 8000) {
  let lastError = null

  for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
    try {
      const response = await fetch(url, {
        ...options,
        signal: AbortSignal.timeout(attemptTimeoutMs),
      })

      // If PostgREST is reloading schema cache (503 PGRST002 or PGRST000), wait and retry
      if (response.status === 503 && attempt <= maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, 500))
        continue
      }

      return response
    } catch (err) {
      lastError = err

      if (attempt <= maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, 400))
        continue
      }

      throw lastError
    }
  }

  throw lastError || new Error('تعذّر إتمام الاتصال بخادم قاعدة البيانات')
}

export function sanitizeDatabaseError(errText, defaultMessage = 'تعذّر الاتصال بقاعدة البيانات حالياً') {
  if (!errText) return defaultMessage

  try {
    const parsed = typeof errText === 'string' ? JSON.parse(errText) : errText
    if (parsed.code === 'PGRST002' || parsed.code === 'PGRST000') {
      return 'خادم قاعدة البيانات في مرحلة استيقاظ وتحديث مؤقتة، يرجى المحاولة بعد لحظات.'
    }
    if (parsed.message) {
      if (parsed.message.includes('schema cache') || parsed.message.includes('Retrying the connection')) {
        return 'خادم قاعدة البيانات يقوم بتحديث الذاكرة المؤقتة، جاري إعادة الاتصال تلقائياً...'
      }
      return parsed.message
    }
  } catch {
    // If not JSON, check string content
    if (errText.includes('PGRST002') || errText.includes('PGRST000') || errText.includes('schema cache')) {
      return 'خادم قاعدة البيانات في مرحلة استيقاظ وتحديث مؤقتة، يرجى المحاولة بعد لحظات.'
    }
    if (errText.includes('timeout') || errText.includes('aborted')) {
      return 'استغرق خادم قاعدة البيانات وقتاً أطول من المتوقع للاستجابة. يرجى إعادة المحاولة.'
    }
  }

  return defaultMessage
}
