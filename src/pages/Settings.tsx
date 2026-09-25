import React from 'react';
import { SettingsPage } from '../components/settings/SettingsPage';

interface SettingsProps {
  onSettingsSaved: () => void;
}

export const Settings: React.FC<SettingsProps> = ({ onSettingsSaved }) => {
  return <SettingsPage onSettingsSaved={onSettingsSaved} />;
};

export default Settings;
