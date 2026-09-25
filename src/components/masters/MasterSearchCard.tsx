import React from 'react';
import { SearchBox } from '../SearchBox';
import type { PullListMaster } from '../../types';

interface MasterSearchCardProps {
  searchQuery: string;
  onSearch: (query: string) => void;
  searching: boolean;
  pullLists: PullListMaster[];
}

export const MasterSearchCard: React.FC<MasterSearchCardProps> = ({
  searchQuery,
  onSearch,
  searching,
  pullLists,
}) => {
  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
      <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider">Search Pull List Master</h4>
      
      <div className="flex items-center gap-4">
        <SearchBox
          value={searchQuery}
          onChange={onSearch}
          placeholder="Type exact Pull List Number..."
        />
        {searching && <span className="text-xs text-slate-400 animate-pulse">Searching...</span>}
      </div>

      {searchQuery && (
        <div className="overflow-x-auto rounded-lg border border-slate-200 mt-4">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Pull List Number</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">ID Number</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Kit Type</th>
                <th className="px-4 py-3 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">Workcell</th>
                <th className="px-4 py-3 text-right text-xs font-bold text-slate-500 uppercase tracking-wider w-24">Parts</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {pullLists.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-sm text-slate-400 font-medium">
                    No matching master Pull List found.
                  </td>
                </tr>
              ) : (
                pullLists.map((p) => (
                  <tr key={p.pull_list_no} className="hover:bg-slate-50/50">
                    <td className="px-4 py-3 text-sm font-mono text-slate-800 font-bold">{p.pull_list_no}</td>
                    <td className="px-4 py-3 text-sm text-slate-600 font-medium">{p.id_number}</td>
                    <td className="px-4 py-3 text-sm text-slate-600 font-medium">
                      <span className="inline-flex px-2 py-0.5 rounded text-xs font-semibold bg-emerald-50 text-emerald-700">
                        {p.kit_type}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600 font-medium">{p.workcell}</td>
                    <td className="px-4 py-3 text-sm font-mono text-slate-800 text-right font-bold">{p.parts}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
