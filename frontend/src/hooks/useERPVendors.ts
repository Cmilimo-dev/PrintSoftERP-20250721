// Clean ERP vendors hook without business document dependencies
import { useState, useEffect } from 'react';
import { ERPVendor } from '../types/erpTypes';
import { erpDataService } from '../services/erpDataService';

export interface UseERPVendorsReturn {
  vendors: ERPVendor[];
  loading: boolean;
  error: string | null;
  searchVendors: (query: string) => ERPVendor[];
  saveVendor: (vendor: ERPVendor) => Promise<ERPVendor>;
  deleteVendor: (id: string) => Promise<void>;
  getVendor: (id: string) => ERPVendor | undefined;
  refreshVendors: () => void;
}

export function useERPVendors(): UseERPVendorsReturn {
  const [vendors, setVendors] = useState<ERPVendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadVendors = () => {
    try {
      setLoading(true);
      setError(null);
      const data = erpDataService.getVendors();
      setVendors(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load vendors');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVendors();
  }, []);

  const searchVendors = (query: string): ERPVendor[] => {
    try {
      return erpDataService.searchVendors(query);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
      return [];
    }
  };

  const saveVendor = async (vendor: ERPVendor): Promise<ERPVendor> => {
    try {
      setError(null);
      const savedVendor = erpDataService.saveVendor(vendor);
      loadVendors(); // Refresh the list
      return savedVendor;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save vendor';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const deleteVendor = async (id: string): Promise<void> => {
    try {
      setError(null);
      erpDataService.deleteVendor(id);
      loadVendors(); // Refresh the list
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete vendor';
      setError(errorMessage);
      throw new Error(errorMessage);
    }
  };

  const getVendor = (id: string): ERPVendor | undefined => {
    return vendors.find(vendor => vendor.id === id);
  };

  const refreshVendors = () => {
    loadVendors();
  };

  return {
    vendors,
    loading,
    error,
    searchVendors,
    saveVendor,
    deleteVendor,
    getVendor,
    refreshVendors
  };
}
