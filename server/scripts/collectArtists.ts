import mongoose from 'mongoose';
import DataCollectionService from '../src/services/DataCollectionService';
import ArtistService from '../src/services/ArtistService';
import { logger } from '../src/utils/logger';
import { chunkArray } from '@/utils/helpers';
import { connectMongoDB, disconnectMongodDB } from '@/configs/database';
import config from '@/configs/environment';

async function collectAndStoreArtists(): Promise<void> {
  try {
    logger.info('Starting Spotify artist collection...');
    
    await connectMongoDB();
    
    const existingCount = await ArtistService.getArtistStats();
    if (existingCount.totalArtists > 0) {
      logger.info(`Found ${existingCount.totalArtists} existing artists`);
      
      if (process.env.FORCE_RECOLLECT !== 'true') {
        logger.info('Skipping collection. Set FORCE_RECOLLECT=true to override');
        return;
      }
    }
    
    const artists = await DataCollectionService.collectArtists(config.TARGET_ARTIST_COUNT);
    
    if (artists.length === 0) {
      logger.error('No artists collected. Check Spotify credentials.');
      return;
    }
    
    logger.info(`✅ Collected ${artists.length} artists from Spotify`);
    
    logger.info('Saving to db'); 
    const batchSize = 1000;
    const batches = chunkArray(artists, batchSize);
    
    let totalSaved = 0;
    
    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      
      try {
        await ArtistService.bulkCreateArtists(batch);
        totalSaved += batch.length;
        logger.info(`Saved batch ${i + 1}/${batches.length} (${totalSaved}/${artists.length})`);
      } catch (error: unknown) {
        logger.error(`Error saving batch ${i + 1}:`, error);
      }
    }
    
    const finalStats = await ArtistService.getArtistStats();
    logger.info(`📊 Final Statistics:`, finalStats);
    
  } catch (error) {
    logger.error('Collection failed:', error);
    throw error;
  } finally {
    await disconnectMongodDB();
  }
}

if (require.main === module) {
  collectAndStoreArtists()
    .then(() => {
      logger.info('Collection completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('Collection failed:', error);
      process.exit(1);
    });
}
