import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router/dom'

import { AuthProvider } from '@/context/AuthContext'
import { router } from '@/routes'
import '@/styles/index.css'

const rootElement = document.getElementById('root')
if (!rootElement) throw new Error('ไม่พบ element #root ใน index.html')

createRoot(rootElement).render(
  <StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </StrictMode>,
)
