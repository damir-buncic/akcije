import { format } from "date-fns";

export function validate(dateFrom: string, dateTo: string): boolean {
  const today = format(new Date(), "yyyy-MM-dd");

  if (dateFrom > today || dateTo < today) {
    return false;
  }
  return true;
}
