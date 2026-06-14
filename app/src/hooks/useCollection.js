import { useEffect, useState } from 'react';
import { dataSource } from '../data';

/** Live-updating collection, works identically in demo and live mode. */
export function useCollection(collectionName) {
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    return dataSource.subscribeCollection(collectionName, (next) => {
      setDocs(next);
      setLoading(false);
    });
  }, [collectionName]);

  return { docs, loading };
}
