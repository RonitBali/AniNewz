import React from 'react';
import { Loader } from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';

export const DefaultLoaderExample = () => {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader
        size="large"
        variation="spinner"
        color="cyan"
      />
    </div>
  );
};
