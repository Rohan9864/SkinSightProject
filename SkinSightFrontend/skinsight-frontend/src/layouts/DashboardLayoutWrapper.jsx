import { Outlet } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';

export default function DashboardLayoutWrapper({ title = 'Dashboard' }) {
  return (
    <DashboardLayout title={title}>
      <Outlet />
    </DashboardLayout>
  );
}
