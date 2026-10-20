import asyncio
import json
import re
from dataclasses import dataclass
from typing import Optional, List
import httpx
from yt_dlp import YoutubeDL

@dataclass
class VideoStats:
    video_id: str
    url: str
    author: str
    description: str
    publish_time: str
    views: int
    likes: int
    comments: int
    shares: int
    saves: int
    engagement_rate: float

@dataclass
class ProfileVideoSummary:
    video_id: str
    url: str
    title: str
    views: int

class TikTokScraper:
    HEADERS = {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept-Language": "es-ES,es;q=0.9,en;q=0.8"
    }

    @classmethod
    async def extract_video_stats(cls, url: str) -> Optional[VideoStats]:
        # Fast path: httpx hydration data
        try:
            async with httpx.AsyncClient(headers=cls.HEADERS, follow_redirects=True, timeout=8.0) as client:
                resp = await client.get(url)
                if resp.status_code == 200:
                    html = resp.text
                    match = re.search(r'<script id="__UNIVERSAL_DATA_FOR_REHYDRATION__"[^>]*>([\s\S]*?)</script>', html)
                    if match:
                        data = json.loads(match.group(1))
                        item_struct = data.get("__DEFAULT_SCOPE__", {}).get("webapp.video-detail", {}).get("itemInfo", {}).get("itemStruct", {})
                        if item_struct:
                            stats = item_struct.get("stats", {})
                            author_info = item_struct.get("author", {})
                            views = int(stats.get("playCount", 0))
                            likes = int(stats.get("diggCount", 0))
                            comments = int(stats.get("commentCount", 0))
                            shares = int(stats.get("shareCount", 0))
                            saves = int(stats.get("collectCount", 0))
                            eng = ((likes + comments + shares + saves) / max(1, views)) * 100

                            return VideoStats(
                                video_id=str(item_struct.get("id", "")),
                                url=url,
                                author=f"@{author_info.get('uniqueId', 'user')}",
                                description=item_struct.get("desc", ""),
                                publish_time=str(item_struct.get("createTime", "")),
                                views=views,
                                likes=likes,
                                comments=comments,
                                shares=shares,
                                saves=saves,
                                engagement_rate=round(eng, 2)
                            )
        except Exception:
            pass

        # Fallback path: yt-dlp non-blocking
        return await asyncio.to_thread(cls._extract_ytdlp, url)

    @classmethod
    def _extract_ytdlp(cls, url: str) -> Optional[VideoStats]:
        ydl_opts = {
            'skip_download': True,
            'quiet': True,
            'no_warnings': True,
            'extract_flat': False
        }
        with YoutubeDL(ydl_opts) as ydl:
            try:
                info = ydl.extract_info(url, download=False)
                if not info:
                    return None
                views = int(info.get('view_count', 0) or 0)
                likes = int(info.get('like_count', 0) or 0)
                comments = int(info.get('comment_count', 0) or 0)
                shares = int(info.get('repost_count', 0) or 0)
                saves = 0
                eng = ((likes + comments + shares + saves) / max(1, views)) * 100

                return VideoStats(
                    video_id=str(info.get('id', '')),
                    url=url,
                    author=f"@{info.get('uploader', 'user')}",
                    description=info.get('description', '') or info.get('title', ''),
                    publish_time=str(info.get('timestamp', '')),
                    views=views,
                    likes=likes,
                    comments=comments,
                    shares=shares,
                    saves=saves,
                    engagement_rate=round(eng, 2)
                )
            except Exception:
                return None

    @classmethod
    async def extract_profile_recent_videos(cls, username: str, limit: int = 10) -> List[ProfileVideoSummary]:
        clean_user = username.replace("@", "")
        profile_url = f"https://www.tiktok.com/@{clean_user}"

        def _get_flat():
            ydl_opts = {
                'extract_flat': 'in_playlist',
                'skip_download': True,
                'playlist_items': f'1-{limit}',
                'quiet': True
            }
            with YoutubeDL(ydl_opts) as ydl:
                try:
                    res = ydl.extract_info(profile_url, download=False)
                    entries = res.get('entries', []) if res else []
                    summaries = []
                    for e in entries[:limit]:
                        summaries.append(ProfileVideoSummary(
                            video_id=str(e.get('id', '')),
                            url=e.get('url', f"https://www.tiktok.com/@{clean_user}/video/{e.get('id', '')}"),
                            title=e.get('title', 'Video sin título')[:50],
                            views=int(e.get('view_count', 0) or 0)
                        ))
                    return summaries
                except Exception:
                    return []

        return await asyncio.to_thread(_get_flat)
