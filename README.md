# Meshtastic News

Runs in a Docker container, or on any machine with Node.js 24 installed. Periodically checks an RSS feed, compares data with last message sent, decides if a new message is needed and then sends it to the mesh.

## Environment Variables

```env
MESHTASTIC_NODE_IP_ADDRESS=10.0.1.22
RSS_FEED_URL=http://feeds.bbci.co.uk/news/rss.xml
CRON_SCHEDULE=*/5 * * * *
```
