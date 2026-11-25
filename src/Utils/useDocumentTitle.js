import { useEffect } from 'react';

// Sets the tab title for the current page. Restores the default on leave.
const DEFAULT = 'AniNewz - Discover anime, track what you watch';

export default function useDocumentTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} | AniNewz` : DEFAULT;
    return () => {
      document.title = DEFAULT;
    };
  }, [title]);
}
