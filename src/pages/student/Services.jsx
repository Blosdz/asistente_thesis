import React from 'react';
import AdvisorCatalog from './AdvisorCatalog';
import ScheduleSession from './ScheduleSession';

const Services = () => {
  return (
    <div className="w-full flex justify-center items-start animate-fade-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="w-full h-[calc(100vh-100px)] overflow-y-auto px-4 py-8 custom-scrollbar">
        <AdvisorCatalog isComponent={true} />

        <div className="my-16 border-t border-slate-200/50"></div>
      </div>
    </div>
  );
};

export default Services;
