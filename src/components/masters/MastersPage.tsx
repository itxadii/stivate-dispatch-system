import React, { useState, useEffect } from 'react';
import { databaseService } from '../../services/ipc';
import type { PullListMaster } from '../../types';
import { MasterStorageStats } from './MasterStorageStats';
import { MasterImportCard } from './MasterImportCard';
import { MasterSearchCard } from './MasterSearchCard';

export const MastersPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [pullLists, setPullLists] = useState<PullListMaster[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [searching, setSearching] = useState(false);

  const fetchMasterCount = async () => {
    try {
      const stats = await databaseService.getDashboardStats();
      setTotalCount(stats.totalPullLists);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setPullLists([]);
      setSearching(false);
      return;
    }

    setSearching(true);
    try {
      const res = await databaseService.searchPullList(query.trim());
      if (res) {
        setPullLists([res]);
      } else {
        setPullLists([]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSearching(false);
    }
  };

  useEffect(() => {
    fetchMasterCount();
  }, []);

  return (
    <div className="space-y-6">
      {/* Overview Block */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MasterStorageStats totalCount={totalCount} />
        <MasterImportCard onImportSuccess={fetchMasterCount} />
      </div>

      {/* Query Search Card */}
      <MasterSearchCard
        searchQuery={searchQuery}
        onSearch={handleSearch}
        searching={searching}
        pullLists={pullLists}
      />
    </div>
  );
};
