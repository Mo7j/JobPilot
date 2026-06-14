import { useEffect, useState } from 'react';
import { dataSource } from '../data';

/** Live-updating single document, null until it exists. */
export function useDocument(collectionName, id) {
  const [docData, setDocData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) {
      setDocData(null);
      setLoading(false);
      return;
    }
    return dataSource.subscribeDoc(collectionName, id, (next) => {
      setDocData(next);
      setLoading(false);
    });
  }, [collectionName, id]);

  return { doc: docData, loading };
}
