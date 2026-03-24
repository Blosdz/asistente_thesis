import React from 'react';
import MyAdvisors from './MyAdvisors';

const Services = () => {
  return (
    <div className="w-full flex justify-center items-start animate-fade-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="w-full h-[calc(100vh-100px)] overflow-y-auto pt-8 custom-scrollbar">
        <MyAdvisors />
      </div>
    </div>
  );
};

export default Services;
