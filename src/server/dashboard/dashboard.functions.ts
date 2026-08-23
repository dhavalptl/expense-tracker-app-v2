import { createServerFn } from '@tanstack/react-start'
import { getCookie } from '@tanstack/react-start/server'

import { requireSessionUser, SESSION_COOKIE } from '../auth/session.ts'
import { getDb } from '../db/index.ts'
import { getDashboardSummary } from './dashboard.ts'

export const getMyDashboardSummary = createServerFn({ method: 'GET' }).handler(
  async () => {
    const user = requireSessionUser(getDb(), getCookie(SESSION_COOKIE))
    return getDashboardSummary(getDb(), user.id)
  },
)
