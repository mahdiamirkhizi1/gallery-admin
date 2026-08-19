import { useQuery } from "@tanstack/react-query";
import { getDashboardData } from "./dashboard.api";
export function useDashboard() { return useQuery({ queryKey: ["dashboard"], queryFn: getDashboardData, staleTime: 120_000, refetchInterval: 300_000, refetchOnWindowFocus: false }); }
