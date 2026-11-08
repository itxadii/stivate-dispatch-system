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
    <div className="card p-5 space-y-4">
      <div>
        <h4 className="card-title">Look up a pull list</h4>
        <p className="card-subtitle">Search the imported SAP master by exact pull list number</p>
      </div>
      
      <div className="flex items-center gap-4">
        <SearchBox
          value={searchQuery}
          onChange={onSearch}
          placeholder="Pull list number"
        />
        {searching && <span className="text-xs text-slate-500 animate-pulse">Searching…</span>}
      </div>

      {searchQuery && (
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="table">
            <thead>
              <tr>
                <th>Pull list number</th>
                <th>ID number</th>
                <th>Kit type</th>
                <th>Workcell</th>
                <th className="text-right w-24">Parts</th>
              </tr>
            </thead>
            <tbody>
              {pullLists.length === 0 ? (
                <tr>
                  <td colSpan={5} className="empty-state">
                    No pull list with that number in the master.
                  </td>
                </tr>
              ) : (
                pullLists.map((p) => (
                  <tr key={p.pull_list_no}>
                    <td className="font-mono font-bold text-slate-900">{p.pull_list_no}</td>
                    <td className="text-slate-600">{p.id_number}</td>
                    <td className="text-slate-600">
                      <span className="tag font-sans">
                        {p.kit_type}
                      </span>
                    </td>
                    <td className="text-slate-600">{p.workcell}</td>
                    <td className="font-mono font-bold text-slate-900 text-right tabular-nums">{p.parts}</td>
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
