"""
Facebook Data Collection and Trend Analysis Module.

This module provides compliant interfaces for fetching and analyzing Facebook data
including Public Pages, Public Groups, Reels, and Comments.

COMPLIANCE & LEGAL NOTICE:
--------------------------
To adhere strictly to Facebook's Terms of Service (TOS) and automated scraping policy:
1. DO NOT use web scraping libraries (e.g., Selenium, BeautifulSoup, Playwright, Scrapy)
   to extract data from Facebook. Unauthorized scraping violates Meta's Terms of Service
   and is subject to account/IP blocking.
2. All data fetching MUST be performed through the official Meta Graph API or approved partner integrations.
3. Respect API rate limiting (use exponential backoff when encountering rate limit errors).
4. Respect user privacy settings: only fetch publicly available data and ensure correct permissions.
5. Use Page Access Tokens, User Access Tokens, or App Access Tokens as required.
"""

import logging
import os
import re
import time
from collections import Counter
from typing import Any, Dict, List, Optional, Set

import requests
from dotenv import load_dotenv

# Set up logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger(__name__)

# Load environment variables
load_dotenv()


class FacebookTrendAnalyzer:
    """
    Analyzes Facebook trends by compliantly fetching public data using the Facebook Graph API
    and executing trend analysis algorithms. Includes a built-in mock fallback for development.
    """

    def __init__(
        self,
        access_token: Optional[str] = None,
        api_version: str = "v20.0",
        use_mock_fallback: bool = True,
    ):
        """
        Initialize the analyzer.

        Args:
            access_token: Meta Graph API access token. If None, tries to read from environment variable
                          'FACEBOOK_PAGE_ACCESS_TOKEN' or 'FACEBOOK_USER_ACCESS_TOKEN'.
            api_version: The version of the Graph API to target (default: 'v20.0').
            use_mock_fallback: If True, falls back to high-quality simulated data when no credentials
                               are present or when the API call fails/lacks permissions.
        """
        token = access_token or os.getenv("FACEBOOK_PAGE_ACCESS_TOKEN") or os.getenv("FACEBOOK_USER_ACCESS_TOKEN")
        # .env.example placeholders ("your_..._here") are non-empty strings — treat them
        # as "no credentials" so we go straight to mock instead of firing doomed API calls.
        if token and token.startswith("your_"):
            token = None
        self.access_token = token
        self.api_version = api_version
        self.base_url = f"https://graph.facebook.com/{self.api_version}"
        self.use_mock_fallback = use_mock_fallback

        if not self.access_token:
            if self.use_mock_fallback:
                logger.warning(
                    "No Facebook access token found in environment. Running in MOCK FALLBACK mode."
                )
            else:
                logger.error(
                    "No Facebook access token provided. API calls will fail."
                )

        # Stop words to filter out during trend analysis (both English and Vietnamese)
        self.stop_words: Set[str] = {
            # English common stop words
            "a", "about", "above", "after", "again", "against", "all", "am", "an", "and", "any", "are", "aren't",
            "as", "at", "be", "because", "been", "before", "being", "below", "between", "both", "but", "by",
            "can't", "cannot", "could", "couldn't", "did", "didn't", "do", "does", "doesn't", "doing", "don't",
            "down", "during", "each", "few", "for", "from", "further", "had", "hadn't", "has", "hasn't", "have",
            "haven't", "having", "he", "he'd", "he'll", "he's", "her", "here", "here's", "hers", "herself",
            "him", "himself", "his", "how", "how's", "i", "i'd", "i'll", "i'm", "i've", "if", "in", "into", "is",
            "isn't", "it", "it's", "its", "itself", "let's", "me", "more", "most", "mustn't", "my", "myself",
            "no", "nor", "not", "of", "off", "on", "once", "only", "or", "other", "ought", "our", "ours",
            "ourselves", "out", "over", "own", "same", "shan't", "she", "she'd", "she'll", "she's", "should",
            "shouldn't", "so", "some", "such", "than", "that", "that's", "the", "their", "theirs", "them",
            "themselves", "then", "there", "there's", "these", "they", "they'd", "they'll", "they're", "they've",
            "this", "those", "through", "to", "too", "under", "until", "up", "very", "was", "wasn't", "we",
            "we'd", "we'll", "we're", "we've", "were", "weren't", "what", "what's", "when", "when's", "where",
            "where's", "which", "while", "who", "who's", "whom", "why", "why's", "with", "won't", "would",
            "wouldn't", "you", "you'd", "you'll", "you're", "you've", "your", "yours", "yourself", "yourselves",
            # Vietnamese common stop words / particles
            "và", "của", "là", "có", "cho", "được", "trong", "đã", "đang", "sẽ", "để", "với", "một", "những",
            "các", "ra", "vào", "lên", "xuống", "đến", "đi", "này", "kia", "đó", "thế", "nhưng", "tại", "vì",
            "nên", "thì", "mà", "như", "cũng", "chỉ", "còn", "hơn", "sau", "trước", "khi", "lúc", "nơi", "này",
            "nào", "ai", "gì", "sao", "quá", "rất", "nhiều", "ít", "đại", "tiểu", "tự", "bị", "được", "bởi",
            "cả", "chưa", "hết", "chứ", "rồi", "nữa", "nhé", "nha", "ạ", "ơi", "đây", "đấy", "thôi", "vẫn",
            # Vietnamese pronouns / fillers common in social posts & comments
            "em", "anh", "chị", "mình", "bạn", "mọi", "người", "không", "luôn", "lắm", "vậy", "ngay",
            "cùng", "về", "theo", "từ", "tới", "vừa", "mới", "đừng", "hãy", "nếu", "xin", "á",
            "mua", "dùng", "cách", "nhất", "nay", "hôm", "nàng", "ấy", "gọi", "hỏi", "biết",
        }

    def _make_request(
        self,
        endpoint: str,
        params: Optional[Dict[str, Any]] = None,
        method: str = "GET",
        retry_count: int = 3,
        backoff_factor: float = 2.0,
    ) -> Dict[str, Any]:
        """
        Helper to make rate-limit-aware and compliant requests to the Graph API.

        Respects Meta Graph API Rate Limits (Application rate limit & Page rate limit).
        """
        if not self.access_token:
            raise ValueError("Graph API Access Token is required to make live requests.")

        url = f"{self.base_url}/{endpoint.lstrip('/')}"
        params = params or {}
        params["access_token"] = self.access_token

        for attempt in range(retry_count):
            try:
                response = requests.request(method=method, url=url, params=params, timeout=15)
                
                # Check for rate limit issues (Meta Graph API error codes: 4, 17, 32, 613)
                if response.status_code == 429 or (
                    response.status_code == 400 and response.json().get("error", {}).get("code") in [4, 17, 32, 613]
                ):
                    sleep_time = backoff_factor ** (attempt + 1)
                    logger.warning(
                        f"Facebook API Rate Limit hit. Retrying in {sleep_time} seconds (Attempt {attempt + 1}/{retry_count})..."
                    )
                    time.sleep(sleep_time)
                    continue

                response.raise_for_status()
                return response.json()

            except requests.RequestException as e:
                logger.error(f"HTTP request error: {e}")
                if attempt == retry_count - 1:
                    raise e
                time.sleep(backoff_factor ** (attempt + 1))

        raise Exception("Failed to get response from Facebook API after multiple retries.")

    def fetch_public_page_posts(self, page_id: str, limit: int = 50) -> List[Dict[str, Any]]:
        """
        Compliantly fetch posts from a public Facebook page.

        Meta Policy Compliance Note:
        - Requires a Page Access Token or a User Access Token.
        - Requires 'pages_read_engagement' and 'pages_show_list_posts' permissions for pages you manage,
          or the Page Public Metadata Access feature for third-party public pages.
        """
        if not self.access_token:
            if self.use_mock_fallback:
                return self._generate_mock_posts(page_id, limit)
            raise ValueError("Live credentials required. Set FACEBOOK_PAGE_ACCESS_TOKEN.")

        endpoint = f"{page_id}/posts"
        # Requesting fields complying with data minimization principles (only fetch what is needed for trend analysis)
        params = {
            "fields": "id,message,created_time,shares,comments.summary(true),likes.summary(true),attachments{media_type,title,url}",
            "limit": limit,
        }

        try:
            result = self._make_request(endpoint, params=params)
            posts = result.get("data", [])
            
            # Clean and normalize fields to a standard internal structure
            normalized_posts = []
            for post in posts:
                likes_summary = post.get("likes", {}).get("summary", {})
                comments_summary = post.get("comments", {}).get("summary", {})
                
                normalized_posts.append({
                    "id": post.get("id"),
                    "text": post.get("message", ""),
                    "created_time": post.get("created_time"),
                    "likes_count": likes_summary.get("total_count", 0),
                    "comments_count": comments_summary.get("total_count", 0),
                    "shares_count": post.get("shares", {}).get("count", 0),
                    "type": "post",
                    "source": "public_page",
                    "raw": post
                })
            return normalized_posts

        except Exception as e:
            logger.error(f"Failed to fetch public page posts for {page_id}: {e}")
            if self.use_mock_fallback:
                logger.info("Falling back to MOCK data for public page posts.")
                return self._generate_mock_posts(page_id, limit)
            raise e

    def fetch_public_group_feed(self, group_id: str, limit: int = 50) -> List[Dict[str, Any]]:
        """
        Compliantly fetch posts/feed from a Facebook Group.

        Meta Policy Compliance Note:
        - Meta deprecated the old Groups API. Direct programmatic access to group feeds
          is restricted. Group owners must use the approved Meta Business Suite or configured App permissions
          ('groups_access_member_info') to access data.
        - Scraping private or public group pages directly with scrapers violates Facebook Terms of Service.
        """
        if not self.access_token:
            if self.use_mock_fallback:
                return self._generate_mock_group_posts(group_id, limit)
            raise ValueError("Live credentials required. Set FACEBOOK_USER_ACCESS_TOKEN.")

        # If compliant access is granted via API, we hit group/feed endpoint
        endpoint = f"{group_id}/feed"
        params = {
            "fields": "id,message,created_time,reactions.summary(true),comments.summary(true)",
            "limit": limit,
        }

        try:
            result = self._make_request(endpoint, params=params)
            posts = result.get("data", [])
            
            normalized_posts = []
            for post in posts:
                reactions_count = post.get("reactions", {}).get("summary", {}).get("total_count", 0)
                comments_count = post.get("comments", {}).get("summary", {}).get("total_count", 0)
                
                normalized_posts.append({
                    "id": post.get("id"),
                    "text": post.get("message", ""),
                    "created_time": post.get("created_time"),
                    "likes_count": reactions_count,  # Mapping reactions to likes
                    "comments_count": comments_count,
                    "shares_count": 0,
                    "type": "post",
                    "source": "public_group",
                    "raw": post
                })
            return normalized_posts

        except Exception as e:
            logger.error(f"Failed to fetch public group feed for {group_id}: {e}")
            if self.use_mock_fallback:
                logger.info("Falling back to MOCK data for public group posts.")
                return self._generate_mock_group_posts(group_id, limit)
            raise e

    def fetch_reels(self, page_id: str, limit: int = 25) -> List[Dict[str, Any]]:
        """
        Compliantly fetch Reels metadata and interaction metrics.

        Meta Policy Compliance Note:
        - For Facebook Pages, reels are returned under the Page Video/Posts endpoint or the Reels API.
        - Requires the 'pages_read_engagement' permission.
        """
        if not self.access_token:
            if self.use_mock_fallback:
                return self._generate_mock_reels(page_id, limit)
            raise ValueError("Live credentials required.")

        # Reels are queried via video_reels endpoint for pages
        endpoint = f"{page_id}/video_reels"
        params = {
            "fields": "id,description,created_time,video{views,likes.summary(true),comments.summary(true)}",
            "limit": limit,
        }

        try:
            result = self._make_request(endpoint, params=params)
            reels = result.get("data", [])
            
            normalized_reels = []
            for reel in reels:
                video_data = reel.get("video", {})
                likes_count = video_data.get("likes", {}).get("summary", {}).get("total_count", 0)
                comments_count = video_data.get("comments", {}).get("summary", {}).get("total_count", 0)
                views_count = video_data.get("views", 0)

                normalized_reels.append({
                    "id": reel.get("id"),
                    "text": reel.get("description", ""),
                    "created_time": reel.get("created_time"),
                    "likes_count": likes_count,
                    "comments_count": comments_count,
                    "shares_count": 0,
                    "views_count": views_count,
                    "type": "reel",
                    "source": "public_page",
                    "raw": reel
                })
            return normalized_reels

        except Exception as e:
            logger.error(f"Failed to fetch reels for {page_id}: {e}")
            if self.use_mock_fallback:
                logger.info("Falling back to MOCK data for reels.")
                return self._generate_mock_reels(page_id, limit)
            raise e

    def fetch_comments(self, object_id: str, limit: int = 100) -> List[Dict[str, Any]]:
        """
        Compliantly fetch comments for a specific post, reel, or video.

        Meta Policy Compliance Note:
        - You can only fetch comments on objects belonging to the Pages or Groups you manage,
          or objects that are entirely public.
        - Respect 'read_insights' and data privacy requirements.
        """
        if not self.access_token:
            if self.use_mock_fallback:
                return self._generate_mock_comments(object_id, limit)
            raise ValueError("Live credentials required.")

        endpoint = f"{object_id}/comments"
        params = {
            "fields": "id,message,created_time,like_count",
            "limit": limit,
            "order": "reverse_chronological"
        }

        try:
            result = self._make_request(endpoint, params=params)
            comments = result.get("data", [])
            
            normalized_comments = []
            for comment in comments:
                normalized_comments.append({
                    "id": comment.get("id"),
                    "text": comment.get("message", ""),
                    "created_time": comment.get("created_time"),
                    "likes_count": comment.get("like_count", 0),
                    "parent_id": object_id,
                    "type": "comment",
                    "raw": comment
                })
            return normalized_comments

        except Exception as e:
            logger.error(f"Failed to fetch comments for {object_id}: {e}")
            if self.use_mock_fallback:
                logger.info("Falling back to MOCK data for comments.")
                return self._generate_mock_comments(object_id, limit)
            raise e

    def analyze_trends(
        self,
        posts: List[Dict[str, Any]],
        comments: Optional[Dict[str, List[Dict[str, Any]]]] = None,
        top_n: int = 10
    ) -> Dict[str, Any]:
        """
        Performs text analytics and statistical parsing over posts and comments
        to discover trending keywords, hashtags, themes, and highly engaging topics.

        Args:
            posts: A list of normalized post/reel dicts.
            comments: A dictionary mapping post/reel IDs to lists of normalized comment dicts.
            top_n: Number of top elements to return for keywords, hashtags, and posts.

        Returns:
            A dictionary containing trend statistics, top hashtags, top keywords,
            and highest performing content.
        """
        comments = comments or {}
        
        all_hashtags: List[str] = []
        all_words: List[str] = []
        total_likes = 0
        total_comments = 0
        total_shares = 0
        total_views = 0
        
        # Track engagement weights: engagement = likes * 1 + comments * 2 + shares * 4
        post_performance: List[Dict[str, Any]] = []

        # Parse posts & reels
        for post in posts:
            text = post.get("text", "")
            likes = post.get("likes_count", 0)
            comments_count = post.get("comments_count", 0)
            shares = post.get("shares_count", 0)
            views = post.get("views_count", 0)

            total_likes += likes
            total_comments += comments_count
            total_shares += shares
            total_views += views

            # Custom engagement score to highlight high-impact posts
            engagement_score = (likes * 1) + (comments_count * 2) + (shares * 4) + (views * 0.1)

            # Extract hashtags
            hashtags = re.findall(r"#\w+", text.lower())
            all_hashtags.extend(hashtags)

            # Clean and tokenize words
            words = self._tokenize_and_clean(text)
            all_words.extend(words)

            post_performance.append({
                "id": post.get("id"),
                "text": text[:150] + ("..." if len(text) > 150 else ""),
                "type": post.get("type"),
                "source": post.get("source"),
                "engagement_score": engagement_score,
                "metrics": {
                    "likes": likes,
                    "comments": comments_count,
                    "shares": shares,
                    "views": views
                }
            })

        # Parse comments
        comment_count_total = 0
        for parent_id, comment_list in comments.items():
            for comment in comment_list:
                comment_count_total += 1
                comment_text = comment.get("text", "")
                
                # Extract hashtags from comments (sometimes users put tags there)
                comment_tags = re.findall(r"#\w+", comment_text.lower())
                all_hashtags.extend(comment_tags)

                # Tokenize comment words
                comment_words = self._tokenize_and_clean(comment_text)
                all_words.extend(comment_words)

        # Count frequencies
        hashtag_counts = Counter(all_hashtags)
        keyword_counts = Counter(all_words)

        # Sort posts by engagement
        post_performance.sort(key=lambda x: x["engagement_score"], reverse=True)

        return {
            "summary": {
                "total_posts_analyzed": len(posts),
                "total_comments_analyzed": comment_count_total,
                "aggregate_likes": total_likes,
                "aggregate_comments": total_comments,
                "aggregate_shares": total_shares,
                "aggregate_views": total_views,
            },
            "top_hashtags": [
                {"hashtag": tag, "count": count}
                for tag, count in hashtag_counts.most_common(top_n)
            ],
            "top_keywords": self._select_top_keywords(keyword_counts, top_n),
            "most_engaging_content": post_performance[:top_n]
        }

    def _select_top_keywords(self, keyword_counts: Counter, top_n: int) -> List[Dict[str, Any]]:
        """
        Pick the top keyword terms, preferring compound bigrams over the lone
        syllables they contain ("dưỡng da" beats listing "dưỡng" and "da" separately),
        so Vietnamese keyword lists read as real phrases instead of fragments.
        """
        # Bigrams need at least 2 occurrences to count as a recurring phrase
        bigrams = [
            (term, count) for term, count in keyword_counts.most_common()
            if " " in term and count >= 2
        ][:top_n]
        covered = {word for term, _ in bigrams for word in term.split()}
        unigrams = [
            (term, count) for term, count in keyword_counts.most_common()
            if " " not in term and term not in covered
        ]
        merged = sorted(bigrams + unigrams, key=lambda item: -item[1])[:top_n]
        return [{"keyword": term, "count": count} for term, count in merged]

    def _tokenize_and_clean(self, text: str) -> List[str]:
        """
        Helper to tokenize text into countable keyword terms: unigrams plus adjacent
        bigrams. Vietnamese words are mostly two-syllable compounds ("dưỡng da",
        "chống nắng"), so lone syllables make poor keywords — bigrams carry the
        actual trending phrases while unigrams still cover single-word terms.
        """
        # Remove URLs
        text = re.sub(r"https?://\S+|www\.\S+", "", text)
        # Remove hashtags from keyword tokenization (tracked separately)
        text = re.sub(r"#\w+", "", text)
        # Lowercase
        text = text.lower()
        # Keep letters, numbers, and space (supports Vietnamese characters)
        text = re.sub(r"[^\w\s\dàáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệđìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵ]", " ", text)

        words = text.split()

        def usable(word: str) -> bool:
            return word not in self.stop_words and len(word) >= 2 and not word.isdigit()

        # Unigrams: filter stop words and short/number-only words
        terms = [word for word in words if usable(word) and len(word) > 2]
        # Bigrams: adjacent non-stop-word pairs; 2-char syllables ("da", "áo") are
        # allowed here since they only matter as part of a compound
        terms.extend(
            f"{first} {second}"
            for first, second in zip(words, words[1:])
            if usable(first) and usable(second)
        )
        return terms

    # ==========================================
    # MOCK DATA GENERATORS (Development support)
    # ==========================================

    def _generate_mock_posts(self, page_id: str, limit: int) -> List[Dict[str, Any]]:
        """Simulates public page feed response containing trending topics."""
        topics = [
            ("Chào hè rực rỡ với BST Son dưỡng Thuần Chay mới toanh! Đang có deal hời mua 1 tặng 1 duy nhất hôm nay nhé cả nhà. Đừng bỏ lỡ sản phẩm an toàn và thân thiện môi trường này! #BSTHe #SonThuanChay #VeganBeauty #SaleHe", 450, 89, 45),
            ("5 cách dưỡng da cực đơn giản tại nhà cho những ngày nắng nóng đỉnh điểm. Các nàng lưu lại ngay để da luôn căng mướt khoẻ mạnh nha! #SkincareTips #ChamSocDa #HealthySkin #MẹoVặt", 1200, 340, 680),
            ("Đố các nàng biết, thành phần nào đang làm mưa làm gió trong cộng đồng làm đẹp năm nay? Nhắc tên ngay ở comment xem có trúng thưởng không nhé! #Minigame #LàmĐẹp #TrendingIngredients", 890, 1205, 30),
            ("Review chân thực: Liệu kem chống nắng vật lý lai hóa học có thần thánh như lời đồn? Xem video chi tiết review chất kem trên da và độ kiềm dầu nha. #ReviewMyPham #KemChongNang #BeautyReview", 650, 120, 95),
            ("Sự thật về việc uống đủ 2 lít nước mỗi ngày. Đừng để da bạn khóc thét vì thiếu ẩm nha. Cập nhật những mẹo giữ ẩm tốt nhất tại đây. #HealthyLifestyle #Tips #UongNuoc", 340, 25, 40)
        ]
        
        posts = []
        for i in range(min(limit, 15)):
            topic = topics[i % len(topics)]
            posts.append({
                "id": f"page_{page_id}_post_{i}",
                "text": topic[0],
                "created_time": f"2026-05-{31 - (i // 2):02d}T10:15:30+0700",
                "likes_count": int(topic[1] * (0.8 + 0.4 * (i % 3))),
                "comments_count": int(topic[2] * (0.8 + 0.4 * (i % 2))),
                "shares_count": int(topic[3] * (0.9 + 0.2 * (i % 3))),
                "type": "post",
                "source": "public_page",
                "raw": {}
            })
        return posts

    def _generate_mock_group_posts(self, group_id: str, limit: int) -> List[Dict[str, Any]]:
        """Simulates public group posts sharing user questions, reviews, or recommendations."""
        topics = [
            ("Mọi người ơi cho em xin review về dòng kem dưỡng ẩm phục hồi cho da dầu mụn với ạ. Em đang phân vân giữa hai loại phục hồi B5. Ai dùng rồi cho em xin ý kiến với! #GocHoiDap #ReviewB5 #DaDauMun", 120, 310),
            ("Chào cả nhà, mình mới tìm ra em sữa rửa mặt chân ái giá học sinh sinh viên siêu thích luôn. Da sạch mịn không bị khô căng. Có ai hóng review không ạ? #ReviewChanThuc #GocLamDep #SuaRuaMat", 340, 480),
            ("Góc cảnh báo! Hiện nay trên thị trường có rất nhiều hàng fake giả mạo son kem lì. Mọi người cẩn thận kiểm tra mã vạch và mua ở các store uy tín nha. #CanhBao #SonFake #PhanBietHangGia", 580, 210),
            ("Trải nghiệm quy trình skincare tối giản chỉ 3 bước trong 2 tuần: Da đỡ mụn hẳn mà lại tiết kiệm thời gian. Có bạn nào thử chưa? #SkincareToiGian #LàmĐẹp #SkincareRoutine", 210, 85)
        ]
        
        posts = []
        for i in range(min(limit, 12)):
            topic = topics[i % len(topics)]
            posts.append({
                "id": f"group_{group_id}_post_{i}",
                "text": topic[0],
                "created_time": f"2026-05-{31 - (i // 2):02d}T14:22:15+0700",
                "likes_count": int(topic[1] * (0.7 + 0.5 * (i % 3))),
                "comments_count": int(topic[2] * (0.8 + 0.4 * (i % 2))),
                "shares_count": 0,
                "type": "post",
                "source": "public_group",
                "raw": {}
            })
        return posts

    def _generate_mock_reels(self, page_id: str, limit: int) -> List[Dict[str, Any]]:
        """Simulates high-engaging Reels metadata containing views."""
        reels_data = [
            ("POV: Bạn tìm thấy em son môi chuẩn màu đè bẹp mọi thỏi son đắt tiền khác 🤫✨ #POV #MakeupTutorial #ReelsVietnam #LipstickHack", 45000, 3200, 450),
            ("Unboxing & Swatch trọn bộ màu mắt hot nhất mùa hè này 🌸 Bạn thích tone màu nào nhất? #Unboxing #BeautyUnboxing #MắtĐẹp #EyeShadow", 25000, 1800, 220),
            ("Biến hình từ phong cách công sở sang tiệc tùng chỉ trong 3 nốt nhạc! Thử ngay nha các nàng #GetReadyWithMe #GRWM #BienHinh #FashionReels", 85000, 7200, 1100),
            ("Thử thách tẩy trang sau 12 tiếng trang điểm liên tục. Sự thật về độ che phủ và chống trôi! #TẩyTrang #MakeupChallenge #SkincareChallenge", 120000, 9800, 1900)
        ]
        
        reels = []
        for i in range(min(limit, 8)):
            data = reels_data[i % len(reels_data)]
            reels.append({
                "id": f"reel_{page_id}_{i}",
                "text": data[0],
                "created_time": f"2026-05-{31 - (i // 3):02d}T18:45:00+0700",
                "likes_count": int(data[2] * (0.8 + 0.4 * (i % 2))),
                "comments_count": int(data[3] * (0.7 + 0.6 * (i % 2))),
                "shares_count": int(data[3] * 0.5 * (0.9 + 0.3 * (i % 2))),
                "views_count": int(data[1] * (0.8 + 0.5 * (i % 3))),
                "type": "reel",
                "source": "public_page",
                "raw": {}
            })
        return reels

    def _generate_mock_comments(self, object_id: str, limit: int) -> List[Dict[str, Any]]:
        """Simulates comments reacting to trends and items."""
        sample_comments = [
            ("Hóng deal 1 tặng 1 quá ạ, em vừa đặt một set xong!", 12),
            ("Ủng hộ son thuần chay nha, lành tính cực kỳ luôn á.", 5),
            ("Cho em xin link mua sản phẩm chính hãng với shop ơi.", 2),
            ("Mẹo hữu ích quá, trước giờ em toàn dưỡng da sai cách thui.", 18),
            ("Cái này có dùng được cho da nhạy cảm không vậy ạ?", 7),
            ("Đã dùng thử và thấy rất đáng tiền nha mọi người, nên mua!", 25),
            ("Da dầu mụn dùng B5 phục hồi hãng nào tốt nhất vậy các chị?", 4),
            ("Chuẩn luôn, giờ hàng nhái tràn lan sợ ghê, cảm ơn shop cảnh báo.", 9),
            ("Cái son kem này lì dã man, uống nước không trôi luôn á.", 11),
            ("Review chi tiết quá, thích giọng bạn này ghê.", 3)
        ]
        
        comments = []
        for i in range(min(limit, 20)):
            comment = sample_comments[i % len(sample_comments)]
            comments.append({
                "id": f"comment_{object_id}_{i}",
                "text": comment[0],
                "created_time": f"2026-05-31T20:{i:02d}:00+0700",
                "likes_count": comment[1] + (i % 3),
                "parent_id": object_id,
                "type": "comment",
                "raw": {}
            })
        return comments


# ==========================================
# Run Demonstration
# ==========================================
if __name__ == "__main__":
    import sys
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8")
        
    print("--- Running Facebook Trend Analyzer Standalone Test (Mock Mode) ---")
    analyzer = FacebookTrendAnalyzer(use_mock_fallback=True)
    
    # 1. Fetch data
    page_id = "beauty_trends_page"
    group_id = "makeup_lovers_group"
    
    print(f"\n1. Fetching Page Posts for Page ID: '{page_id}'...")
    page_posts = analyzer.fetch_public_page_posts(page_id, limit=5)
    for p in page_posts[:2]:
        print(f" - [{p['created_time']}] (Likes: {p['likes_count']}, Comments: {p['comments_count']}) {p['text'][:60]}...")
        
    print(f"\n2. Fetching Group Posts for Group ID: '{group_id}'...")
    group_posts = analyzer.fetch_public_group_feed(group_id, limit=5)
    for g in group_posts[:2]:
        print(f" - [{g['created_time']}] (Likes: {g['likes_count']}, Comments: {g['comments_count']}) {g['text'][:60]}...")
        
    print(f"\n3. Fetching Reels for Page ID: '{page_id}'...")
    reels = analyzer.fetch_reels(page_id, limit=5)
    for r in reels[:2]:
        print(f" - [{r['created_time']}] (Views: {r['views_count']}, Likes: {r['likes_count']}) {r['text'][:60]}...")
        
    # Combine posts & reels to analyze trends
    all_content = page_posts + group_posts + reels
    
    # 4. Fetch Comments for some posts to run deeper analysis
    print("\n4. Fetching Comments for high engagement items...")
    comments_map = {}
    for item in all_content[:4]:
        comments_map[item["id"]] = analyzer.fetch_comments(item["id"], limit=5)
        print(f" - Fetched {len(comments_map[item['id']])} comments for item ID {item['id']}")

    # 5. Run Trend Analysis
    print("\n5. Analyzing Social Content Trends...")
    trends = analyzer.analyze_trends(all_content, comments=comments_map, top_n=5)
    
    print("\n--- TREND ANALYSIS SUMMARY ---")
    print(f"Total Posts/Reels Analyzed: {trends['summary']['total_posts_analyzed']}")
    print(f"Total Comments Analyzed:    {trends['summary']['total_comments_analyzed']}")
    print(f"Total Interactions:         Likes: {trends['summary']['aggregate_likes']} | Comments: {trends['summary']['aggregate_comments']} | Shares: {trends['summary']['aggregate_shares']}")
    
    print("\nTop 5 Trending Hashtags:")
    for tag_info in trends["top_hashtags"]:
        print(f" - {tag_info['hashtag']}: {tag_info['count']} occurrences")
        
    print("\nTop 5 Trending Keywords:")
    for kw_info in trends["top_keywords"]:
        print(f" - {kw_info['keyword']}: {kw_info['count']} occurrences")
        
    print("\nTop 3 Most Engaging Content Pieces:")
    for idx, content in enumerate(trends["most_engaging_content"][:3]):
        print(f" {idx+1}. [{content['type'].upper()} from {content['source']}] Score: {content['engagement_score']:.1f}")
        print(f"    Text: {content['text']}")
        print(f"    Metrics: {content['metrics']}")
