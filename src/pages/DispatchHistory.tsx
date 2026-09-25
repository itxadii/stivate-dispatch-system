import React from 'react';
import { DispatchHistoryPage, type DispatchHistoryProps } from '../components/dispatch-history/DispatchHistoryPage';

export const DispatchHistory: React.FC<DispatchHistoryProps> = (props) => {
  return <DispatchHistoryPage {...props} />;
};

export default DispatchHistory;
