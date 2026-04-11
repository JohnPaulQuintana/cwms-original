import { useState, useEffect, useCallback } from "react";
import toast from "react-hot-toast";
import { useAuth } from "../hooks/useAuth";

const API_URL = import.meta.env.VITE_API_URL;

export const useNavCount = () => {
  const { user, token, logoutUser } = useAuth();

  const [counts, setCounts] = useState({
    inventory: 0,
    shipment: 0,
    request: 0,
    returned: 0,
    defected: 0,
    warehouses: 0,
    projects: 0
  });

  const [loading, setLoading] = useState(false);

  const fetchCounts = useCallback(async () => {
    if (!user?.role || !token) return;

    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/count/${user.role}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.status === 401) {
        toast.error("Session expired");
        logoutUser();
        return;
      }

      if (!res.ok) {
        throw new Error("Failed to fetch nav counts");
      }

      const data = await res.json();

      setCounts(data);
    } catch (error) {
      console.error(error);
      toast.error("Error fetching navigation counts");
    } finally {
      setLoading(false);
    }
  }, [user?.role, token, logoutUser]);

  //   useEffect(() => {
  //     fetchCounts();
  //   }, [fetchCounts]);
  useEffect(() => {
    fetchCounts(); // initial load

    const interval = setInterval(() => {
      fetchCounts();
    }, 10000); // every 10 seconds

    return () => clearInterval(interval);
  }, [fetchCounts]);

  return {
    counts,
    loading,
    refetch: fetchCounts,
  };
};
