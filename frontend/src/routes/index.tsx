import { createBrowserRouter } from 'react-router'

import { AdminLayout } from '@/apps/admin/AdminLayout'
import { MenuManagerPage } from '@/apps/admin/pages/MenuManagerPage'
import { OverviewPage } from '@/apps/admin/pages/OverviewPage'
import { CustomerLayout } from '@/apps/customer/CustomerLayout'
import { LandingPage } from '@/apps/customer/pages/LandingPage'
import { QueueTicketPage } from '@/apps/customer/pages/QueueTicketPage'
import { VisitPage } from '@/apps/customer/pages/VisitPage'
import { StaffLayout } from '@/apps/staff/StaffLayout'
import { DashboardPage } from '@/apps/staff/pages/DashboardPage'
import { KitchenPage } from '@/apps/staff/pages/KitchenPage'
import { QueuePage } from '@/apps/staff/pages/QueuePage'
import { TablesPage } from '@/apps/staff/pages/TablesPage'
import { NotFoundPage } from '@/pages/NotFoundPage'

export const router = createBrowserRouter([
  {
    // Customer Web — ลูกค้าไม่ต้อง login, เข้าถึงผ่าน QR ประจำโต๊ะ
    path: '/',
    element: <CustomerLayout />,
    children: [
      { index: true, element: <LandingPage /> },
      { path: 'q/:token', element: <QueueTicketPage /> },
      { path: 't/:token', element: <VisitPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
  {
    // Staff Web — ต้อง login และมี role ระดับพนักงานขึ้นไป
    path: '/staff',
    element: <StaffLayout />,
    children: [
      { index: true, element: <DashboardPage /> },
      { path: 'queue', element: <QueuePage /> },
      { path: 'tables', element: <TablesPage /> },
      { path: 'kitchen', element: <KitchenPage /> },
    ],
  },
  {
    // Admin / Manager — เฉพาะ manager และ owner
    path: '/admin',
    element: <AdminLayout />,
    children: [
      { index: true, element: <OverviewPage /> },
      { path: 'menu', element: <MenuManagerPage /> },
    ],
  },
])
