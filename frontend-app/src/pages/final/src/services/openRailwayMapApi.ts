// OpenRailwayMap API service
const BASE_API_URL = 'https://api.openrailwaymap.org/v2';
const TILE_URL = 'https://{s}.tiles.openrailwaymap.org/{style}/{z}/{x}/{y}.png';

export interface RailwayFacility {
  osm_id: number;
  name: string;
  railway: string;
  ref?: string;
  uic_ref?: string;
  operator?: string;
  latitude: number;
  longitude: number;
  rank: number;
  website?: string;
  platforms?: string;
  wheelchair?: string;
  [key: string]: any; // For additional OSM tags
}

export interface FacilitySearchParams {
  q?: string;        // General search term
  name?: string;     // Name search only
  ref?: string;      // Official facility reference
  uic_ref?: string;  // UIC reference number
  limit?: number;    // Max results (default: 20, max: 200)
}

export class OpenRailwayMapAPI {
  /**
   * Search for railway facilities (stations, junctions, yards, etc.)
   */
  static async searchFacilities(params: FacilitySearchParams): Promise<RailwayFacility[]> {
    const searchParams = new URLSearchParams();
    
    // Add search parameters
    if (params.q) searchParams.append('q', params.q);
    if (params.name) searchParams.append('name', params.name);
    if (params.ref) searchParams.append('ref', params.ref);
    if (params.uic_ref) searchParams.append('uic_ref', params.uic_ref);
    if (params.limit) searchParams.append('limit', params.limit.toString());

    const url = `${BASE_API_URL}/facility?${searchParams.toString()}`;

    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data as RailwayFacility[];
    } catch (error) {
      console.error('Error fetching railway facilities:', error);
      throw error;
    }
  }

  /**
   * Get tile URL for OpenRailwayMap tiles
   * @param style - Map style (e.g., 'standard', 'maxspeed', 'signals')
   * @param subdomain - Subdomain (a, b, or c for load balancing)
   */
  static getTileUrl(style: string = 'standard', subdomain: string = 'a'): string {
    return TILE_URL.replace('{s}', subdomain).replace('{style}', style);
  }

  /**
   * Search facilities by name
   */
  static async searchByName(name: string, limit: number = 10): Promise<RailwayFacility[]> {
    return this.searchFacilities({ name, limit });
  }

  /**
   * Search facilities by general query
   */
  static async searchByQuery(query: string, limit: number = 10): Promise<RailwayFacility[]> {
    return this.searchFacilities({ q: query, limit });
  }

  /**
   * Get facility by UIC reference
   */
  static async getFacilityByUIC(uicRef: string): Promise<RailwayFacility[]> {
    return this.searchFacilities({ uic_ref: uicRef, limit: 1 });
  }
}

// Available map styles
export const RAILWAY_MAP_STYLES = {
  standard: 'standard',
  maxspeed: 'maxspeed',
  signals: 'signals',
  electrification: 'electrification',
  gauge: 'gauge'
} as const;

export type RailwayMapStyle = keyof typeof RAILWAY_MAP_STYLES;
