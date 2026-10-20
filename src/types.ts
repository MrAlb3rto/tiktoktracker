export interface VideoStats {
  id: string;
  url: string;
  author: string;
  authorAvatar?: string;
  description: string;
  publishTime: string;
  coverUrl?: string;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  engagementRate: number;
  velocityVpm: number;
  deltaViews: number;
  lastCheckTimestamp: number;
  isTracking: boolean;
  milestoneInterval: number;
  lastMilestoneViews: number;
  lastMilestoneTimestamp: number;
  targetMilestone: number;
  initialViews: number;
  initialTimestamp: number;
}

export interface MetricSnapshot {
  id: string;
  videoId: string;
  timestamp: number;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  engagementRate: number;
  deltaViews: number;
  velocityVpm: number;
  isViralSpike: boolean;
}

export interface MilestoneAlert {
  id: string;
  videoId: string;
  videoTitle: string;
  author: string;
  milestoneTarget: number;
  achievedTimestamp: number;
  durationFormatted: string;
  avgVelocityVpm: number;
  netViewsDelta: number;
  netLikesDelta: number;
  netCommentsDelta: number;
  netSharesDelta: number;
  netSavesDelta: number;
  totalViews: number;
  sentToTelegram: boolean;
}

export interface ViralSpikeAlert {
  id: string;
  videoId: string;
  videoTitle: string;
  author: string;
  timestamp: number;
  velocityVpm: number;
  movingAverageVpm: number;
  ratio: number;
  views: number;
  sentToTelegram: boolean;
}

export interface AnalyticsOverview {
  period: 'hour' | 'day' | 'week' | 'all';
  authorFilter: string;
  videoCount: number;
  totals: {
    views: number;
    likes: number;
    comments: number;
    shares: number;
    saves: number;
    avgEngagementRate: number;
    currentVelocityVpm: number;
    conversionPer1k: {
      likes: number;
      saves: number;
    };
  };
  timeSeries: {
    label: string;
    timestamp: number;
    deltaViews: number;
    velocityVpm: number;
    approxLikes: number;
    approxSaves: number;
  }[];
  recentMilestones: MilestoneAlert[];
  recentViralSpikes: ViralSpikeAlert[];
}

export interface TelegramSettings {
  botToken: string;
  chatId: string;
  checkIntervalMinutes: number;
  telegramAlertsEnabled: boolean;
  monitoredProfile: string;
}

export interface ServerStatus {
  settings: TelegramSettings;
  videoCount: number;
  trackingCount: number;
  snapshotCount: number;
  milestoneAlertsCount: number;
  viralAlertsCount: number;
  lastCheckTime: number;
  uptime: number;
}
