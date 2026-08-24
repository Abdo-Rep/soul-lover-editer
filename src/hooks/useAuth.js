import { useCallback, useEffect, useState } from 'react'
import { config } from '../data/config'
import {
  getAdminPasswordForSync,
  setAdminPasswordForSync,
} from '../utils/supabaseContent'

function getSlugFromPath() {
  if (typeof window === 'undefined') return ''
  const parts = window.location.pathname.split('/').filter(Boolean)
  if (parts.length === 0) return ''
  if (parts[0] === 'soulove-admin' || parts[0] === 'api' || parts[0] === 'dashboard') return ''
  return parts[0]
}

function getScopedAdminKey() {
  const slug = getSlugFromPath()
  return slug ? `${config.auth.adminStorageKey}-${slug}` : config.auth.adminStorageKey
}

function getScopedVisitorKey() {
  const slug = getSlugFromPath()
  return slug ? `${config.auth.storageKey}-${slug}` : config.auth.storageKey
}

function readKey(key) {
  if (typeof sessionStorage === 'undefined') return false
  return sessionStorage.getItem(key) === 'true'
}

function hasValidAdminSession() {
  const slug = getSlugFromPath()
  return readKey(getScopedAdminKey()) && Boolean(getAdminPasswordForSync(slug))
}

function clearAdminSession() {
  const slug = getSlugFromPath()
  setAdminPasswordForSync('', slug)
  if (typeof sessionStorage !== 'undefined') {
    sessionStorage.removeItem(getScopedAdminKey())
    // Also clear the JWT token so it can't be reused after logout
    if (slug) {
      sessionStorage.removeItem(`romantic-token-${slug}`)
    }
  }
}

export function useAdminAuth() {
  const slug = getSlugFromPath()
  const [adminPassword, setAdminPassword] = useState(() => getAdminPasswordForSync(slug))
  const [isAdmin, setIsAdmin] = useState(() => hasValidAdminSession())

  useEffect(() => {
    if (readKey(getScopedAdminKey()) && !getAdminPasswordForSync(slug)) {
      clearAdminSession()
      setAdminPassword('')
      setIsAdmin(false)
    }
  }, [slug])

  const adminLoginWithPassword = useCallback((password) => {
    const currentSlug = getSlugFromPath()
    setAdminPasswordForSync(password, currentSlug)
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem(getScopedAdminKey(), 'true')
    }
    setAdminPassword(password)
    setIsAdmin(true)
  }, [])

  const updateAdminPassword = useCallback((password) => {
    const currentSlug = getSlugFromPath()
    setAdminPasswordForSync(password, currentSlug)
    setAdminPassword(password)
  }, [])

  const adminLogout = useCallback(() => {
    clearAdminSession()
    setAdminPassword('')
    setIsAdmin(false)
  }, [])

  return {
    isAdmin,
    adminPassword,
    adminLoginWithPassword,
    updateAdminPassword,
    adminLogout,
  }
}

export function checkAdminAuth() {
  return hasValidAdminSession()
}

export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => readKey(getScopedVisitorKey()))
  const slug = getSlugFromPath()

  useEffect(() => {
    setIsAuthenticated(readKey(getScopedVisitorKey()))
  }, [slug])

  const login = useCallback(() => {
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.setItem(getScopedVisitorKey(), 'true')
    }
    setIsAuthenticated(true)
  }, [])

  const logout = useCallback(() => {
    if (typeof sessionStorage !== 'undefined') {
      sessionStorage.removeItem(getScopedVisitorKey())
    }
    setIsAuthenticated(false)
  }, [])

  return { isAuthenticated, login, logout }
}

export function checkAuth() {
  return readKey(getScopedVisitorKey())
}

export function grantVisitorPreviewAccess() {
  if (typeof sessionStorage !== 'undefined') {
    sessionStorage.setItem(getScopedVisitorKey(), 'true')
    sessionStorage.setItem(config.auth.skipIntroKey, 'true')
  }
}
