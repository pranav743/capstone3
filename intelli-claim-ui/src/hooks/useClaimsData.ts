import { useState, useEffect } from 'react';
import axios from 'axios';
import { Claim } from '@/app/api/claims/route';

interface UseClaimsDataResult {
  data: ClaimsApiResponse | null;
  loading: boolean;
  error: string | null;
  page: number;
  setPage: React.Dispatch<React.SetStateAction<number>>;
  setStatus: React.Dispatch<React.SetStateAction<string>>;
  triggerRefetch: () => void;
}

interface ClaimsApiResponse {
  data: Claim[];
  totalRecords: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
}

const useClaimsData = (): UseClaimsDataResult => {
  const [data, setData] = useState<ClaimsApiResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<string>('all');
  const [refetchToggle, setRefetchToggle] = useState(false);

  const triggerRefetch = () => setRefetchToggle(!refetchToggle);

  useEffect(() => {
    const controller = new AbortController();

    const fetchClaimsData = async () => {
      try {
        setLoading(true);
        const response = await axios.get<ClaimsApiResponse>(`/api/claims?page=${page}&status=${status}`, {
          signal: controller.signal,
        });
        setData(response.data);
      } catch (err) {
        if (axios.isCancel(err)) {
          console.log('Request canceled:', err.message);
        } else if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('An unknown error occurred');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchClaimsData();

    return () => {
      controller.abort();
    };
  }, [page, status, refetchToggle]);

  return { data, loading, error, page, setPage, setStatus, triggerRefetch };
};

export default useClaimsData;
