import React from 'react';
import { DashboardPage } from '../components/dashboard/DashboardPage';

interface DashboardProps {
  setActiveTab: (tab: string) => void;
  onEditDispatch: (id: number) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ setActiveTab, onEditDispatch }) => {
  return <DashboardPage setActiveTab={setActiveTab} onEditDispatch={onEditDispatch} />;
};

export default Dashboard;
