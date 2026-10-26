import demoDataRaw from '../data/demo_data.json';

export interface WeatherData {
  index: number;
  valid_time_raw: string;
  init_time_raw: string;
  valid_time_formatted: string;
  init_time_formatted: string;
  valid_date_str: string;
  valid_hour_str: string;
  valid_time: Date;
  init_time: Date;
  lead_hours: number;
  location_id: string;
  location_name: string;
  latitude: number;
  longitude: number;
  elevation_m: number;
  ecmwf: number;
  gfs: number;
  icon: number;
  reference: number;
  ai_weight_ecmwf: number | null;
  ai_weight_gfs: number | null;
  ai_weight_icon: number | null;
  ai_blend: number | null;
}

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC'];

export function formatUtcDateTime(dateStr: string): string {
  if (!dateStr) return '';
  const parts = dateStr.trim().split(/[\sT]+/);
  if (parts.length < 2) return dateStr;
  const [datePart, timePart] = parts;
  const [year, monthStr, day] = datePart.split('-');
  const [hour, min] = timePart.split(':');
  const monthIdx = parseInt(monthStr, 10) - 1;
  const monthName = MONTHS[monthIdx] || monthStr;
  return `${day} ${monthName} ${year} ${hour}:${min || '00'} UTC`;
}

export function formatUtcShort(dateStr: string): string {
  if (!dateStr) return '';
  const parts = dateStr.trim().split(/[\sT]+/);
  if (parts.length < 2) return dateStr;
  const [datePart, timePart] = parts;
  const [, monthStr, day] = datePart.split('-');
  const [hour] = timePart.split(':');
  const monthIdx = parseInt(monthStr, 10) - 1;
  const monthName = MONTHS[monthIdx] || monthStr;
  return `${day} ${monthName} ${hour}:00`;
}

export const STATION_METADATA = {
  id: 'new_delhi',
  name: 'New Delhi (Safdarjung)',
  icao: 'VIDP',
  latitude: 28.6139,
  longitude: 77.2090,
  elevation_m: 216,
  country: 'India',
  variable: 'precipitation',
  lead_hours: 24,
  sample_count: 269
};

export const DEMO_DATA: WeatherData[] = (demoDataRaw as Array<{
  valid_time: string;
  init_time: string;
  lead_hours: string;
  location_id: string;
  ecmwf_precipitation: string;
  gfs_precipitation: string;
  icon_precipitation: string;
  reference_precipitation: string;
}>).map((d, index) => {
  const validIso = d.valid_time.replace(' ', 'T') + 'Z';
  const initIso = d.init_time.replace(' ', 'T') + 'Z';
  const validTime = new Date(validIso);
  const initTime = new Date(initIso);

  const parts = d.valid_time.trim().split(/[\sT]+/);
  const [datePart, timePart] = parts;
  const [year, monthStr, day] = (datePart || '2026-09-09').split('-');
  const [hour, min] = (timePart || '00:00:00').split(':');
  const monthIdx = parseInt(monthStr, 10) - 1;
  const monthName = MONTHS[monthIdx] || monthStr;

  return {
    index,
    valid_time_raw: d.valid_time,
    init_time_raw: d.init_time,
    valid_time_formatted: `${day} ${monthName} ${year} ${hour}:${min || '00'} UTC`,
    init_time_formatted: formatUtcDateTime(d.init_time),
    valid_date_str: `${day} ${monthName} ${year}`,
    valid_hour_str: `${hour}:00 UTC`,
    valid_time: validTime,
    init_time: initTime,
    lead_hours: parseInt(d.lead_hours, 10) || 24,
    location_id: d.location_id,
    location_name: STATION_METADATA.name,
    latitude: STATION_METADATA.latitude,
    longitude: STATION_METADATA.longitude,
    elevation_m: STATION_METADATA.elevation_m,
    ecmwf: parseFloat(d.ecmwf_precipitation),
    gfs: parseFloat(d.gfs_precipitation),
    icon: parseFloat(d.icon_precipitation),
    reference: parseFloat(d.reference_precipitation),
    ai_weight_ecmwf: null,
    ai_weight_gfs: null,
    ai_weight_icon: null,
    ai_blend: null
  };
});

export function getForecastData(locationId: string = 'new_delhi', leadHours: number = 24) {
  return DEMO_DATA.filter(d => d.location_id === locationId && d.lead_hours === leadHours);
}
