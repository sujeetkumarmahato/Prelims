
import React, { useState } from 'react';
import Header from './components/Header';
import MCQSection from './components/MCQSection';
import GroupDiscussionSection from './components/GroupDiscussionSection';

export type ActiveTab = 'mcq' | 'discussion';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('mcq');

  return (
    <div className="bg-slate-100 min-h-screen font-sans text-slate-800 flex flex-col">
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className="flex-grow p-4 sm:p-6 md:p-8 max-w-7xl mx-auto w-full">
        {activeTab === 'mcq' && <MCQSection />}
        {activeTab === 'discussion' && <GroupDiscussionSection />}
      </main>
      <footer className="text-center p-4 text-slate-500 text-sm mt-8">
        <p>&copy; {new Date().getFullYear()} UPSC Prep Hub. AI for Aspirants.</p>
      </footer>
    </div>
  );
};

export default App;
