import React from 'react';

export const CardSkeleton = () => (
  <div className="space-y-3">
    <div className="skeleton aspect-[2/3] w-full" />
    <div className="skeleton h-4 w-3/4" />
    <div className="skeleton h-3 w-1/2" />
  </div>
);

export const GridSkeleton = ({ count = 12 }) => (
  <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:gap-6 lg:grid-cols-4 xl:grid-cols-6">
    {Array.from({ length: count }).map((_, i) => (
      <CardSkeleton key={i} />
    ))}
  </div>
);
