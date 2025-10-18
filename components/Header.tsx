
import React from 'react';
import { ActiveTab } from '../App';
import { BookOpenIcon } from './icons/BookOpenIcon';
import { UsersIcon } from './icons/UsersIcon';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
}

const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab }) => {
  const navItemClasses = "flex items-center gap-2 px-4 py-2 rounded-md transition-all duration-300 ease-in-out text-sm sm:text-base";
  const activeClasses = "bg-sky-600 text-white shadow-md";
  const inactiveClasses = "text-slate-600 hover:bg-sky-100";

  return (
    <header className="bg-white shadow-sm sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="bg-sky-600 p-2 rounded-lg">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v11.494m0-11.494c-3.464 0-6.387 2.873-6.387 6.413 0 3.54 2.923 6.413 6.387 6.413s6.387-2.873 6.387-6.413c0-3.54-2.923-6.413-6.387-6.413z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.613 11.887A9.75 9.75 0 0112 4.125a9.75 9.75 0 018.387 7.762M3.613 11.887a9.75 9.75 0 008.387 7.763 9.75 9.75 0 008.387-7.763M3.613 11.887L12 11.887" />
            </svg>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-800">UPSC Prep Hub</h1>
        </div>
        <nav className="flex items-center gap-2 sm:gap-4 p-1 bg-slate-200 rounded-lg">
          <button
            onClick={() => setActiveTab('mcq')}
            className={`${navItemClasses} ${activeTab === 'mcq' ? activeClasses : inactiveClasses}`}
          >
            <BookOpenIcon />
            <span>MCQ Practice</span>
          </button>
          <button
            onClick={() => setActiveTab('discussion')}
            className={`${navItemClasses} ${activeTab === 'discussion' ? activeClasses : inactiveClasses}`}
          >
            <UsersIcon />
            <span>Group Discussion</span>
          </button>
        </nav>
      </div>
    </header>
  );
};

export default Header;
