"""
Cross-platform trending-content connector (YouTube, TikTok, Instagram Reels).

Adapted from the Trends-MCP project (https://github.com/rugvedp/Trends-MCP), which
exposes these lookups as MCP tools. The same data sources are integrated here as a
plain connector so the Trend Research agent can mix cross-platform trending signal
with the Facebook signal (FR-19..FR-22). This is a research data source only —
publishing stays limited to Facebook / Instagram / Threads.

Tool mapping (Trends-MCP -> this module):
- get_yt_trending_global / get_yt_trending_by_region -> fetch_youtube_trending()
- get_comments_yt                                    -> fetch_youtube_comments()
- get_yt_video_info                                  -> fetch_youtube_video_info()
- tiktok_trending_global                             -> fetch_tiktok_trending()
- get_this_weeks_reels_trends                        -> fetch_reels_trends()

Data sources & credentials:
- YouTube: RapidAPI "yt-api" (trending theo region + search theo keyword) khi có
  RAPIDAPI_KEY; fallback yt-dlp (đường cũ — YouTube đã gỡ /feed/trending giữa 2025
  nên gần như luôn fail) rồi mock. Comment vẫn qua youtube-comment-downloader (free).
- TikTok: RapidAPI "tiktok-best-experience" — trending toàn cầu hoặc theo region.
- Instagram: (a) bài theo HASHTAG thương hiệu qua RapidAPI "instagram-scraper-api2"
  (hashtag tiếng Việt → nội dung VN tự nhiên); (b) Reels trends tuần parsed from
  Later.com's public weekly roundup.
- Threads: keyword search qua API CHÍNH THỨC của Meta (graph.threads.net
  /keyword_search) — cần THREADS_ACCESS_TOKEN (long-lived user token, quyền
  threads_keyword_search). Miễn phí, không cần scraper.

RapidAPI: MỘT key (RAPIDAPI_KEY) dùng chung cho mọi API đã subscribe trên tài khoản —
header x-rapidapi-host chọn API. Biến cũ TIKTOK_RAPIDAPI_KEY vẫn được đọc (tương thích).
TRENDS_DEFAULT_REGION (vd "VN") đặt region mặc định khi request không chỉ định.

Like FacebookTrendAnalyzer, every fetcher falls back to mock data when credentials
are missing or a live call fails, so trend research stays demoable offline.
"""

import datetime
import logging
import os
from typing import Any, Dict, List, Optional

import requests
from bs4 import BeautifulSoup
from dotenv import load_dotenv

logger = logging.getLogger(__name__)

load_dotenv()


class TrendsMCPConnector:
    """
    Fetches trending content from YouTube, TikTok, and Instagram Reels and
    normalizes it to the same internal item shape used by FacebookTrendAnalyzer
    (text / likes_count / comments_count / shares_count / views_count / type /
    source), so all signal can be aggregated by `analyze_trends`.
    """

    TIKTOK_API_HOST = "tiktok-best-experience.p.rapidapi.com"
    REELS_TRENDS_URL = "https://later.com/blog/instagram-reels-trends/"

    def __init__(
        self,
        tiktok_api_key: Optional[str] = None,
        use_mock_fallback: bool = True,
    ):
        """
        Args:
            tiktok_api_key: RapidAPI key (giữ tên tham số cũ để tương thích). If None,
                            read from env 'RAPIDAPI_KEY' (generic) rồi 'TIKTOK_RAPIDAPI_KEY'.
            use_mock_fallback: If True, falls back to simulated data when a key is
                               missing or a live fetch fails.
        """
        key = tiktok_api_key or os.getenv("RAPIDAPI_KEY") or os.getenv("TIKTOK_RAPIDAPI_KEY")
        # .env.example placeholder ("your_...") counts as missing — skip doomed live calls.
        if key and key.startswith("your_"):
            key = None
        self.rapidapi_key = key
        self.use_mock_fallback = use_mock_fallback
        # Host yt-api có thể thay bằng API YouTube khác trên RapidAPI mà không sửa code.
        self.youtube_api_host = os.getenv("YOUTUBE_RAPIDAPI_HOST", "yt-api.p.rapidapi.com")
        self.instagram_api_host = os.getenv(
            "INSTAGRAM_RAPIDAPI_HOST", "instagram-scraper-api2.p.rapidapi.com"
        )
        # Threads dùng API chính thức của Meta — token long-lived của một tài khoản đã kết nối.
        threads_token = (os.getenv("THREADS_ACCESS_TOKEN") or "").strip()
        if threads_token.startswith("your_"):
            threads_token = ""
        self.threads_access_token = threads_token or None
        self.threads_api_base = os.getenv("THREADS_API_BASE", "https://graph.threads.net/v1.0")
        # Region mặc định (ISO 3166, vd "VN") khi request không chỉ định — BE hiện chưa gửi sources.
        default_region = os.getenv("TRENDS_DEFAULT_REGION", "").strip()
        self.default_region = default_region or None

        if not self.rapidapi_key:
            if self.use_mock_fallback:
                logger.warning(
                    "No RAPIDAPI_KEY/TIKTOK_RAPIDAPI_KEY found. TikTok/YouTube RapidAPI sources will use MOCK FALLBACK mode."
                )
            else:
                logger.error("No RapidAPI key provided. RapidAPI calls will fail.")

    @property
    def has_rapidapi_key(self) -> bool:
        """True khi có key thật — dùng để bỏ qua các nguồn phụ (search) trong mock mode."""
        return bool(self.rapidapi_key)

    @property
    def has_threads_token(self) -> bool:
        """True khi có THREADS_ACCESS_TOKEN — bật nguồn keyword search Threads chính thức."""
        return bool(self.threads_access_token)

    def _rapidapi_get(self, host: str, path: str, params: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """GET một endpoint RapidAPI bất kỳ (host chọn API, một key dùng chung)."""
        response = requests.get(
            f"https://{host}{path}",
            headers={"x-rapidapi-key": self.rapidapi_key, "x-rapidapi-host": host},
            params=params or {},
            timeout=15,
        )
        response.raise_for_status()
        return response.json()

    @staticmethod
    def _to_int(value: Any) -> int:
        """Ép view/like count về int — RapidAPI có nơi trả chuỗi ("123,456")."""
        if isinstance(value, (int, float)):
            return int(value)
        digits = "".join(ch for ch in str(value or "") if ch.isdigit())
        return int(digits) if digits else 0

    # ==========================================
    # YouTube (yt-dlp / youtube-comment-downloader)
    # ==========================================

    def fetch_youtube_trending(
        self, region: Optional[str] = None, limit: int = 10
    ) -> List[Dict[str, Any]]:
        """
        Fetch trending YouTube videos, globally or for an ISO region code (e.g. 'VN').

        Thứ tự nguồn: RapidAPI yt-api (trending theo region — đường sống duy nhất hiện nay)
        → yt-dlp (đường cũ; YouTube đã gỡ /feed/trending giữa 2025 nên gần như luôn fail)
        → mock. Region không truyền thì dùng TRENDS_DEFAULT_REGION.
        """
        region = region or self.default_region

        if self.rapidapi_key:
            try:
                return self._fetch_youtube_trending_rapidapi(region, limit)
            except Exception as e:
                logger.error(f"RapidAPI YouTube trending failed ({region or 'global'}): {e}")
                # rơi tiếp xuống yt-dlp / mock bên dưới

        try:
            import yt_dlp  # heavy import — only load for live fetches

            url = "https://www.youtube.com/feed/trending"
            if region:
                url += f"?gl={region.upper()}"
            opts = {
                "extract_flat": True,
                "force_generic_extractor": True,
                "quiet": True,
                "socket_timeout": 15,
            }
            with yt_dlp.YoutubeDL(opts) as ydl:
                info = ydl.extract_info(url, download=False)

            entries = [e for e in (info.get("entries") or []) if e.get("id")][:limit]
            if not entries:
                raise RuntimeError("no trending entries parsed from the feed")

            normalized = []
            for entry in entries:
                video_id = entry["id"]
                normalized.append({
                    "id": f"yt_{video_id}",
                    "video_id": video_id,
                    "text": entry.get("title", ""),
                    "url": f"https://www.youtube.com/watch?v={video_id}",
                    "likes_count": 0,
                    "comments_count": 0,
                    "shares_count": 0,
                    "views_count": int(entry.get("view_count") or 0),
                    "type": "video",
                    "source": "youtube_trending",
                    "raw": {},
                })
            return normalized

        except Exception as e:
            logger.error(f"Failed to fetch YouTube trending ({region or 'global'}): {e}")
            if self.use_mock_fallback:
                logger.info("Falling back to MOCK data for YouTube trending.")
                return self._generate_mock_youtube_trending(limit)
            raise

    def _fetch_youtube_trending_rapidapi(self, region: Optional[str], limit: int) -> List[Dict[str, Any]]:
        """Trending qua RapidAPI yt-api: GET /trending?geo=VN — trả data[] các video."""
        params: Dict[str, Any] = {}
        if region:
            params["geo"] = region.upper()
        data = self._rapidapi_get(self.youtube_api_host, "/trending", params)
        items = self._normalize_ytapi_items(data, source="youtube_trending", limit=limit)
        if not items:
            raise RuntimeError("no trending videos in yt-api response")
        return items

    def fetch_youtube_search(
        self, keyword: str, region: Optional[str] = None, limit: int = 5
    ) -> List[Dict[str, Any]]:
        """
        Search video theo TỪ KHÓA THƯƠNG HIỆU/ngành (FR-20) qua RapidAPI yt-api: GET /search.

        Nguồn phụ bổ sung cho trending — lỗi/thiếu key chỉ trả [] (không mock, tránh
        nhân đôi nhiễu mock trong signal), research vẫn chạy tiếp với các nguồn khác.
        """
        if not self.rapidapi_key:
            return []
        try:
            params: Dict[str, Any] = {"query": keyword}
            region = region or self.default_region
            if region:
                params["geo"] = region.upper()
            data = self._rapidapi_get(self.youtube_api_host, "/search", params)
            return self._normalize_ytapi_items(
                data, source=f"youtube_search:{keyword}", limit=limit
            )
        except Exception as e:
            logger.error(f"RapidAPI YouTube search failed for '{keyword}': {e}")
            return []

    def _normalize_ytapi_items(
        self, data: Dict[str, Any], source: str, limit: int
    ) -> List[Dict[str, Any]]:
        """Map response yt-api (data[] có videoId/title/viewCount) về item shape nội bộ."""
        normalized: List[Dict[str, Any]] = []
        for entry in data.get("data") or []:
            video_id = entry.get("videoId")
            if not video_id:  # bỏ các entry không phải video (channel/playlist/section)
                continue
            normalized.append({
                "id": f"yt_{video_id}",
                "video_id": video_id,
                "text": entry.get("title", ""),
                "url": f"https://www.youtube.com/watch?v={video_id}",
                "likes_count": 0,
                "comments_count": 0,
                "shares_count": 0,
                "views_count": self._to_int(entry.get("viewCount")),
                "type": "video",
                "source": source,
                "raw": {},
            })
            if len(normalized) >= limit:
                break
        return normalized

    def fetch_youtube_comments(self, video_id: str, limit: int = 100) -> List[Dict[str, Any]]:
        """Fetch public comments of a YouTube video, normalized like Facebook comments."""
        try:
            from youtube_comment_downloader import YoutubeCommentDownloader

            downloader = YoutubeCommentDownloader()
            comments: List[Dict[str, Any]] = []
            for c in downloader.get_comments_from_url(
                f"https://www.youtube.com/watch?v={video_id}"
            ):
                comments.append({
                    "id": f"yt_comment_{video_id}_{len(comments)}",
                    "text": c.get("text", ""),
                    "created_time": c.get("time", ""),
                    "likes_count": 0,
                    "parent_id": f"yt_{video_id}",
                    "type": "comment",
                    "raw": {},
                })
                if len(comments) >= limit:
                    break
            return comments

        except Exception as e:
            logger.error(f"Failed to fetch YouTube comments for {video_id}: {e}")
            if self.use_mock_fallback:
                logger.info("Falling back to MOCK data for YouTube comments.")
                return self._generate_mock_youtube_comments(video_id, limit)
            raise

    def fetch_youtube_video_info(self, url: str) -> Optional[Dict[str, Any]]:
        """Fetch metadata of a single YouTube video (title, channel, views, likes...)."""
        try:
            import yt_dlp

            opts = {"quiet": True, "skip_download": True, "socket_timeout": 15}
            with yt_dlp.YoutubeDL(opts) as ydl:
                i = ydl.extract_info(url, download=False)
            return {
                "title": i.get("title", ""),
                "channel": i.get("uploader", ""),
                "description": i.get("description", ""),
                "views": int(i.get("view_count") or 0),
                "likes": int(i.get("like_count") or 0),
                "upload_date": i.get("upload_date", ""),
                "duration_seconds": int(i.get("duration") or 0),
                "url": i.get("webpage_url", url),
            }

        except Exception as e:
            logger.error(f"Failed to fetch YouTube video info for {url}: {e}")
            if self.use_mock_fallback:
                logger.info("Falling back to MOCK data for YouTube video info.")
                return self._generate_mock_youtube_video_info(url)
            raise

    # ==========================================
    # TikTok (RapidAPI)
    # ==========================================

    def fetch_tiktok_trending(
        self, limit: int = 10, region: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """
        Fetch trending TikTok videos with engagement metrics and hashtags.

        Requires RAPIDAPI_KEY (RapidAPI 'tiktok-best-experience'). Có region (vd 'VN')
        thì thử /trending/{region} trước — endpoint region không có ở mọi gói subscribe
        nên fail thì lùi về /trending toàn cầu rồi mới tới mock.
        """
        if not self.rapidapi_key:
            if self.use_mock_fallback:
                return self._generate_mock_tiktok_trending(limit)
            raise ValueError("RapidAPI key required. Set RAPIDAPI_KEY.")

        region = region or self.default_region
        paths = [f"/trending/{region.lower()}", "/trending"] if region else ["/trending"]
        last_error: Optional[Exception] = None
        for path in paths:
            try:
                data = self._rapidapi_get(self.TIKTOK_API_HOST, path)
                if data.get("status") != "ok" or "data" not in data:
                    raise RuntimeError(f"unexpected TikTok API response status: {data.get('status')}")
                videos = data["data"].get("list", [])[:limit]
                return [self._normalize_tiktok_video(v) for v in videos]
            except Exception as e:
                last_error = e
                logger.error(f"Failed to fetch TikTok trending ({path}): {e}")

        if self.use_mock_fallback:
            logger.info("Falling back to MOCK data for TikTok trending.")
            return self._generate_mock_tiktok_trending(limit)
        raise last_error  # type: ignore[misc]

    def _normalize_tiktok_video(self, video: Dict[str, Any]) -> Dict[str, Any]:
        """Map a raw TikTok API video to the normalized internal item shape."""
        hashtags = {
            tag["cha_name"] for tag in video.get("cha_list") or [] if tag.get("cha_name")
        }
        hashtags.update(
            tag["hashtag_name"]
            for tag in video.get("text_extra") or []
            if tag.get("type") == 1 and tag.get("hashtag_name")
        )

        # Append hashtags missing from the description so hashtag mining sees them.
        text = video.get("desc") or ""
        extra_tags = " ".join(f"#{t}" for t in sorted(hashtags) if f"#{t}" not in text)
        if extra_tags:
            text = f"{text} {extra_tags}".strip()

        stats = video.get("statistics", {})
        return {
            "id": f"tiktok_{video.get('aweme_id', '')}",
            "text": text,
            "url": video.get("share_url", ""),
            "likes_count": stats.get("digg_count", 0),
            "comments_count": stats.get("comment_count", 0),
            "shares_count": stats.get("share_count", 0),
            "views_count": stats.get("play_count", 0),
            "type": "video",
            "source": "tiktok_trending",
            "raw": {},
        }

    # ==========================================
    # Instagram hashtag posts (RapidAPI)
    # ==========================================

    def fetch_instagram_hashtag(self, keyword: str, limit: int = 5) -> List[Dict[str, Any]]:
        """
        Lấy bài Instagram theo HASHTAG (RapidAPI "instagram-scraper-api2":
        GET /v1/hashtag?hashtag=...). Hashtag lấy từ từ khóa thương hiệu — tiếng Việt
        thì nội dung trả về tự nhiên là thị trường VN (FR-20).

        Nguồn phụ như fetch_youtube_search: thiếu key / lỗi / chưa subscribe → trả []
        (không mock), research vẫn chạy với các nguồn khác.
        """
        if not self.rapidapi_key:
            return []
        # IG hashtag không có khoảng trắng — "mỹ phẩm" → "mỹphẩm" (unicode hợp lệ).
        tag = "".join((keyword or "").split()).lstrip("#")
        if not tag:
            return []
        try:
            data = self._rapidapi_get(self.instagram_api_host, "/v1/hashtag", {"hashtag": tag})
            payload = data.get("data") if isinstance(data.get("data"), dict) else data
            items = payload.get("items") or payload.get("medias") or []

            normalized: List[Dict[str, Any]] = []
            for m in items:
                caption = m.get("caption")
                text = caption.get("text", "") if isinstance(caption, dict) else str(caption or "")
                code = m.get("code") or m.get("shortcode") or ""
                normalized.append({
                    "id": f"ig_{m.get('id') or code}",
                    "text": text,
                    "url": f"https://www.instagram.com/p/{code}/" if code else "",
                    "likes_count": self._to_int(m.get("like_count")),
                    "comments_count": self._to_int(m.get("comment_count")),
                    "shares_count": 0,
                    "views_count": self._to_int(m.get("play_count") or m.get("view_count")),
                    "type": "post",
                    "source": f"instagram_hashtag:{keyword}",
                    "raw": {},
                })
                if len(normalized) >= limit:
                    break
            return normalized
        except Exception as e:
            logger.error(f"RapidAPI Instagram hashtag failed for '{keyword}': {e}")
            return []

    # ==========================================
    # Threads keyword search (official Meta API)
    # ==========================================

    def fetch_threads_keyword(self, keyword: str, limit: int = 5) -> List[Dict[str, Any]]:
        """
        Search bài Threads theo từ khóa qua API CHÍNH THỨC (GET {graph.threads.net}
        /keyword_search?q=...) — cần THREADS_ACCESS_TOKEN với quyền threads_keyword_search.

        API chính thức không trả engagement counts trong search → counts = 0; bài vẫn
        rất giá trị vì Threads là nền tảng đăng bài trong scope. Lỗi/thiếu token → [].
        """
        if not self.threads_access_token or not (keyword or "").strip():
            return []
        try:
            response = requests.get(
                f"{self.threads_api_base}/keyword_search",
                params={
                    "q": keyword.strip(),
                    "search_type": "TOP",
                    "fields": "id,text,permalink,username,timestamp",
                    "access_token": self.threads_access_token,
                },
                timeout=15,
            )
            response.raise_for_status()
            posts = response.json().get("data") or []

            normalized: List[Dict[str, Any]] = []
            for p in posts:
                text = p.get("text") or ""
                if not text:
                    continue
                normalized.append({
                    "id": f"threads_{p.get('id', '')}",
                    "text": text,
                    "url": p.get("permalink", ""),
                    "likes_count": 0,
                    "comments_count": 0,
                    "shares_count": 0,
                    "views_count": 0,
                    "type": "post",
                    "source": f"threads_search:{keyword}",
                    "raw": {},
                })
                if len(normalized) >= limit:
                    break
            return normalized
        except Exception as e:
            logger.error(f"Threads keyword search failed for '{keyword}': {e}")
            return []

    # ==========================================
    # Instagram Reels trends (Later.com roundup)
    # ==========================================

    def fetch_reels_trends(self) -> List[Dict[str, Any]]:
        """
        Fetch this week's curated Instagram Reels trends (name, date, description)
        from Later.com's public roundup. Trends older than 30 days are skipped.

        Returns curated trend descriptions (not post items) — feed these to the LLM
        as-is rather than through engagement aggregation.
        """
        try:
            r = requests.get(
                self.REELS_TRENDS_URL,
                headers={"User-Agent": "Mozilla/5.0"},
                timeout=15,
            )
            r.raise_for_status()
            soup = BeautifulSoup(r.text, "html.parser")
            today = datetime.date.today()

            trends = []
            for h in soup.select("h3"):
                heading = h.get_text(strip=True)
                if not heading.startswith("Trend:"):
                    continue
                try:
                    name, date_str = heading[len("Trend:"):].split("—")
                    trend_date = datetime.datetime.strptime(date_str.strip(), "%B %d, %Y").date()
                    if (today - trend_date).days > 30:
                        continue
                    ps = h.find_next_siblings("p", limit=2)
                    trends.append({
                        "date": str(trend_date),
                        "trend": name.strip(),
                        "description": ps[0].get_text(strip=True) if ps else "",
                        "posts_info": ps[1].get_text(strip=True) if len(ps) > 1 else "",
                    })
                except ValueError:
                    continue

            # An empty parse almost always means the blog layout changed, not that
            # there are no trends this week — treat it like a failed fetch.
            if not trends:
                raise RuntimeError("no recent trends parsed from the roundup page")
            return trends

        except Exception as e:
            logger.error(f"Failed to fetch Instagram Reels trends: {e}")
            if self.use_mock_fallback:
                logger.info("Falling back to MOCK data for Instagram Reels trends.")
                return self._generate_mock_reels_trends()
            raise

    # ==========================================
    # MOCK DATA GENERATORS (Development support)
    # ==========================================

    def _generate_mock_youtube_trending(self, limit: int) -> List[Dict[str, Any]]:
        """Simulates the YouTube trending feed (titles + view counts only)."""
        titles = [
            ("Thử thách skincare 7 ngày cùng chuyên gia da liễu — kết quả gây sốc!", 1_250_000),
            ("Review TẤT TẦN TẬT bộ sưu tập son hot nhất hè này | Beauty Vlog", 480_000),
            ("GRWM: Makeup trong 10 phút đi làm mà vẫn xinh 💄", 320_000),
            ("Vlog: Một ngày làm chủ tiệm mỹ phẩm nhỏ — behind the scenes", 150_000),
            ("Top 5 xu hướng làm đẹp thuần chay đang viral toàn cầu", 890_000),
        ]
        videos = []
        for i in range(min(limit, len(titles))):
            title, views = titles[i]
            videos.append({
                "id": f"yt_mock_video_{i}",
                "video_id": f"mock_video_{i}",
                "text": title,
                "url": f"https://www.youtube.com/watch?v=mock_video_{i}",
                "likes_count": 0,
                "comments_count": 0,
                "shares_count": 0,
                "views_count": views,
                "type": "video",
                "source": "youtube_trending",
                "raw": {},
            })
        return videos

    def _generate_mock_youtube_comments(self, video_id: str, limit: int) -> List[Dict[str, Any]]:
        """Simulates YouTube comments reacting to trending beauty content."""
        sample_comments = [
            "Da mình nhạy cảm mà dùng theo routine này thấy cải thiện hẳn luôn!",
            "Xin link mua sản phẩm ở phút 3:20 với ạ 🙏",
            "Trend son thuần chay năm nay đúng là mạnh thật sự.",
            "Makeup 10 phút mà xinh vậy thì mai mình thử liền.",
            "Chờ mãi video behind the scenes như này, làm thêm phần 2 đi chị!",
        ]
        return [
            {
                "id": f"yt_comment_{video_id}_{i}",
                "text": sample_comments[i % len(sample_comments)],
                "created_time": "1 day ago",
                "likes_count": 0,
                "parent_id": f"yt_{video_id}",
                "type": "comment",
                "raw": {},
            }
            for i in range(min(limit, 10))
        ]

    def _generate_mock_youtube_video_info(self, url: str) -> Dict[str, Any]:
        """Simulates single-video metadata."""
        return {
            "title": "Top 5 xu hướng làm đẹp thuần chay đang viral toàn cầu",
            "channel": "Beauty Insider VN",
            "description": "Cùng điểm qua 5 xu hướng vegan beauty nổi bật nhất. #VeganBeauty #XuHuong",
            "views": 890_000,
            "likes": 45_000,
            "upload_date": "20260628",
            "duration_seconds": 612,
            "url": url,
        }

    def _generate_mock_tiktok_trending(self, limit: int) -> List[Dict[str, Any]]:
        """Simulates trending TikTok videos with engagement metrics and hashtags."""
        samples = [
            ("POV: em son mới về là phải swatch liền cho cả nhà xem 💋 #SonMoi #SwatchSon #BeautyTok", 2_400_000, 310_000, 8_200, 15_000),
            ("Biến hình theo trend 'Glow Up 2026' — ai đu trend chưa? ✨ #GlowUp2026 #BienHinh #Trend", 5_100_000, 720_000, 21_000, 43_000),
            ("Skincare routine tối giản cho da dầu mụn, 3 bước là đủ! #SkincareToiGian #DaDauMun", 1_800_000, 260_000, 12_500, 9_800),
            ("Thử món 'matcha strawberry latte' đang viral — 10 điểm không nhưng! #MatchaLatte #FoodTok", 3_600_000, 540_000, 17_000, 28_000),
        ]
        videos = []
        for i in range(min(limit, len(samples))):
            desc, plays, likes, comments, shares = samples[i]
            videos.append({
                "id": f"tiktok_mock_{i}",
                "text": desc,
                "url": f"https://www.tiktok.com/@mock/video/{i}",
                "likes_count": likes,
                "comments_count": comments,
                "shares_count": shares,
                "views_count": plays,
                "type": "video",
                "source": "tiktok_trending",
                "raw": {},
            })
        return videos

    def _generate_mock_reels_trends(self) -> List[Dict[str, Any]]:
        """Simulates this week's curated Instagram Reels trends."""
        today = datetime.date.today()
        samples = [
            ("Nostalgia Cut", "Creators pair childhood photos with a slow-zoom transition into the present day.", "Best for brand-story and founder-journey content."),
            ("5-Second Tutorial", "Ultra-short how-to Reels that deliver one tip before the viewer can scroll away.", "Works well for beauty tips and product demos."),
            ("Sound-On Unboxing", "ASMR-style unboxings using the trending audio, letting packaging sounds carry the video.", "Popular with small product brands this week."),
        ]
        return [
            {
                "date": str(today - datetime.timedelta(days=2 + i * 3)),
                "trend": name,
                "description": description,
                "posts_info": info,
            }
            for i, (name, description, info) in enumerate(samples)
        ]


# ==========================================
# Run Demonstration
# ==========================================
if __name__ == "__main__":
    import sys

    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")

    logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")

    print("--- Running Trends-MCP Connector Standalone Test ---")
    connector = TrendsMCPConnector(use_mock_fallback=True)

    print("\n1. YouTube trending (global):")
    for v in connector.fetch_youtube_trending(limit=5):
        print(f" - [{v['views_count']:,} views] {v['text'][:70]}")

    print("\n2. TikTok trending:")
    for v in connector.fetch_tiktok_trending(limit=4):
        print(f" - [plays: {v['views_count']:,}, likes: {v['likes_count']:,}] {v['text'][:70]}")

    print("\n3. Instagram Reels trends (curated):")
    for t in connector.fetch_reels_trends():
        print(f" - [{t['date']}] {t['trend']}: {t['description'][:70]}")
