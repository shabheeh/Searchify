import { logger } from "@/utils/logger";
import { Client } from "@elastic/elasticsearch";
import config from "./environment";

class ElasticsearchConfig {
  private static instance: ElasticsearchConfig;
  public client: Client;

  private constructor() {
    this.client = new Client({
      node:  config.ELASTICSEARCH_URL,
      requestTimeout: 60000,
      pingTimeout: 3000,
      maxRetries: 3,
    });
  }

  public static getInstance(): ElasticsearchConfig {
    if (!ElasticsearchConfig.instance) {
      ElasticsearchConfig.instance = new ElasticsearchConfig();
    }
    return ElasticsearchConfig.instance;
  }

  public async checkConnection(): Promise<boolean> {
    try {
      await this.client.ping();
      logger.info("Elasticsearch connected successfully");
      return true;
    } catch (error) {
      logger.error("Elasticsearch connection failed:", error);
      return false;
    }
  }
}

export const elasticsearchConfig = ElasticsearchConfig.getInstance();
export const esClient = elasticsearchConfig.client;

