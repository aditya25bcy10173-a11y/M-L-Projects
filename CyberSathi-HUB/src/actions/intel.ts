"use server"

import Parser from 'rss-parser';

const parser = new Parser();

interface ThreatIntelItem {
  source: string;
  title: string;
  url: string;
  time: string;
  pubDate?: string;
}

export async function fetchThreatIntel(): Promise<ThreatIntelItem[]> {
  const feeds = [
    {
      name: 'CISA Alert',
      url: 'https://www.cisa.gov/cybersecurity-advisories/all.xml'
    },
    {
      name: 'BleepingComputer',
      url: 'https://www.bleepingcomputer.com/feed/'
    }
  ];

  const results: ThreatIntelItem[] = [];

  for (const feedConfig of feeds) {
    try {
      const feed = await parser.parseURL(feedConfig.url);
      const items = feed.items.slice(0, 5).map(item => {
        return {
          source: feedConfig.name,
          title: item.title || 'No Title',
          url: item.link || '#',
          pubDate: item.pubDate,
          time: '' // Filled in later
        };
      });
      results.push(...items);
    } catch (error) {
      console.error(`Error fetching feed ${feedConfig.name}:`, error);
    }
  }

  // Sort by date (descending)
  results.sort((a, b) => {
    const dateA = a.pubDate ? new Date(a.pubDate).getTime() : 0;
    const dateB = b.pubDate ? new Date(b.pubDate).getTime() : 0;
    return dateB - dateA;
  });

  // Format time
  return results.slice(0, 10).map(item => {
    let timeStr = 'Recent';
    if (item.pubDate) {
      try {
        const date = new Date(item.pubDate);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        
        if (diffMins < 0) {
          timeStr = 'Just now';
        } else if (diffMins < 60) {
          timeStr = `${diffMins}m ago`;
        } else if (diffHours < 24) {
          timeStr = `${diffHours}h ago`;
        } else {
          timeStr = `${diffDays}d ago`;
        }
      } catch {
        timeStr = 'Recent';
      }
    }
    return {
      source: item.source,
      title: item.title,
      url: item.url,
      time: timeStr
    };
  });
}
