import { connectMongoDB, disconnectMongodDB } from "@/configs/database";
import { elasticsearchConfig } from "@/configs/elasticsearch";
import { ArtistRepository } from "@/repositories/ArtistRepository";
import { SearchRepository } from "@/repositories/SearchRepository";
import { logger } from "@/utils/logger";


async function migrateToElasticsearch(): Promise<void> {
  try {
    logger.info('Starting Elasticsearch migration...');
    
    await connectMongoDB();
    const esConnected = await elasticsearchConfig.checkConnection();
    
    if (!esConnected) {
      throw new Error('Elasticsearch connection failed');
    }
    
    const artistRepository = new ArtistRepository();
    const searchRepository = new SearchRepository();
    
    await searchRepository.createIndex();
    
    const totalArtists = await artistRepository.count();
    logger.info(`Total artists to migrate: ${totalArtists}`);
    
    if (totalArtists === 0) {
      logger.warn('No artists found. Run collection first.');
      return;
    }

    const batchSize = 1000;
    let processed = 0;
    
    while (processed < totalArtists) {
      const artists = await artistRepository.findAll()
      
      if (artists.length === 0) break;
      
      await searchRepository.bulkIndexArtists(artists);
      processed += artists.length;
      
      const progress = ((processed / totalArtists) * 100).toFixed(1);
      logger.info(`Migrated ${processed}/${totalArtists} artists (${progress}%)`);
    }
    
    const stats = await searchRepository.getIndexStats();
    const indexedCount = stats.indices?.music_artists?.total?.docs?.count || 0;
    
    logger.info(`Migration completed!`);
    logger.info(`Migration Summary: ${totalArtists} → ${indexedCount} artists`);
    
  } catch (error) {
    logger.error('Migration failed:', error);
    throw error;
  } finally {
    await disconnectMongodDB();
  }
}

if (require.main === module) {
  migrateToElasticsearch()
    .then(() => {
      logger.info('Migration completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('Migration failed:', error);
      process.exit(1);
    });
}
