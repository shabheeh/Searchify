// services/api.ts
import { AxiosError } from 'axios';
import { api } from '../utils/api';
import type { Artist, Suggestion } from '../types';

export class ApiService {
 
  static async getSuggestions(query: string): Promise<Suggestion[]> {
    try {
      const response = await api.get('/suggest', {
        params: { q: query },
      });

      
      return response.data.data;
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      
      if (error instanceof AxiosError) {
        if (error.response?.status === 404) {
          console.warn('Suggestions endpoint not found');
        } else if (error.response?.status === 429) {
          console.warn('Too many requests - rate limited');
        }
      }
      
      return [];
    }
  }

  static async searchArtists(query: string): Promise<Artist[]> {
    try 
    {

      const response = await api.get('/search', {
        params: { q: query },
      });
      console.log(response.data.data, "data")
      return response.data.data.data;
    } catch (error) {
      console.error('Error searching artists:', error);
      
      if (error instanceof AxiosError) {
        if (error.response?.status === 400) {
          console.warn('Invalid search query');
        } else if (error.response?.status === 503) {
          console.warn('Search service temporarily unavailable');
        }
      }
      
      return [];
    }
  }
  static async getArtist(artistId: string): Promise<Artist | null> {
    try {
      const response = await api.get(`/artists/${artistId}`);
      return response.data.data;
    } catch (error) {
      console.error('Error fetching artist:', error);
      
      if (error instanceof AxiosError) {
        if (error.response?.status === 404) {
          console.warn(`Artist with ID ${artistId} not found`);
        } else if (error.response?.status === 403) {
          console.warn('Access denied to artist information');
        }
      }
      
      return null;
    }
  }

}
