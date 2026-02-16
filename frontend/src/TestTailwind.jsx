import React from 'react';

const TestTailwind = () => {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold text-primary-600 mb-4">Tailwind CSS Test</h1>
      <div className="bg-white rounded-lg shadow-md p-6">
        <p className="text-gray-700 mb-4">If you can see this text styled properly, Tailwind is working.</p>
        <div className="flex gap-4">
          <button className="btn-primary">Primary Button</button>
          <button className="btn-secondary">Secondary Button</button>
          <button className="btn-outline">Outline Button</button>
        </div>
        <div className="mt-4 p-4 bg-primary-50 rounded-lg">
          <p className="text-primary-700">This should have a light primary background</p>
        </div>
      </div>
    </div>
  );
};

export default TestTailwind;