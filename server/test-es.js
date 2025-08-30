const { Client } = require('@elastic/elasticsearch');

const client = new Client({ node: 'http://localhost:9200' });

(async () => {
  try {
    await client.ping();
    console.log('Elasticsearch connected!');
  } catch (err) {
    console.error('Connection failed:', err);
  }
})();
