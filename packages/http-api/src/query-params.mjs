export function queryYear(url, fallbackYear) {
  const year = url.searchParams.get('taxYear');
  if (year == null || year === '') return fallbackYear;
  return Number(year);
}

export function queryParam(url, key) {
  const value = url.searchParams.get(key);
  return value == null || value === '' ? undefined : value;
}

export function queryInt(url, key) {
  const value = url.searchParams.get(key);
  return value == null || value === '' ? undefined : Number(value);
}
