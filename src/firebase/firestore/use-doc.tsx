'use client';
import { useState, useEffect } from 'react';
import { DocumentReference, onSnapshot } from 'firebase/firestore';
import { errorEmitter } from '../error-emitter';
import { FirestorePermissionError } from '../errors';

export function useDoc<T = any>(ref: DocumentReference | null) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!ref) {
      setLoading(false);
      return;
    }

    return onSnapshot(
      ref,
      (doc) => {
        setData(doc.exists() ? (doc.data() as T) : null);
        setLoading(false);
      },
      async (err) => {
        const permissionError = new FirestorePermissionError({
          path: ref.path,
          operation: 'get',
        });
        errorEmitter.emit('permission-error', permissionError);
        setLoading(false);
      }
    );
  }, [ref]);

  return { data, loading };
}