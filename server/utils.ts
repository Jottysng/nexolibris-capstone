export const addDays = (date: Date, days: number) => new Date(date.getTime() + days * 86_400_000);
export const addHours = (date: Date, hours: number) => new Date(date.getTime() + hours * 3_600_000);

export const clampPage = (value: unknown) => {
  const page = Number(value);
  return Number.isInteger(page) && page > 0 ? Math.min(page, 100) : 1;
};

export const cleanWorkId = (value: string) => value.replace(/^\/works\//, '').replace(/[^A-Za-z0-9]/g, '');
