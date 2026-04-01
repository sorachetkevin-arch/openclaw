"""
TikTok Scraper - Social Media Analytics Tool
Author: Luffy (OpenClaw Agent)
"""

import os
import json
import datetime
import requests
from typing import List, Dict, Optional
from pathlib import Path

class TikTokScraper:
    """TikTok Scraper for extracting trending videos and user data"""
    
    BASE_URL = "https://www.tiktok.com"
    
    def __init__(self, output_dir: str = "./data"):
        self.output_dir = Path(output_dir)
        self.output_dir.mkdir(parents=True, exist_ok=True)
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
            'Accept': 'application/json',
            'Accept-Language': 'en-US,en;q=0.9',
        })
    
    def get_trending(self, count: int = 20) -> List[Dict]:
        """
        ดึงข้อมูล Trending Videos
        
        Args:
            count: จำนวนวิดีโอที่ต้องการดึง
            
        Returns:
            List of video data dictionaries
        """
        try:
            # Using TikTok API endpoint
            url = f"{self.BASE_URL}/api/post/item_list/"
            params = {
                'aid': 1988,
                'count': count,
                'type': 5,
            }
            
            response = self.session.get(url, params=params, timeout=10)
            response.raise_for_status()
            
            data = response.json()
            videos = data.get('itemList', [])
            
            results = []
            for video in videos:
                results.append(self._parse_video_data(video))
            
            # Save to file
            self._save_data(results, 'trending')
            
            return results
            
        except Exception as e:
            print(f"Error fetching trending: {e}")
            return []
    
    def get_user_profile(self, username: str) -> Optional[Dict]:
        """
        ดึงข้อมูล User Profile
        
        Args:
            username: ชื่อผู้ใช้ TikTok (ไม่ต้องมี @)
            
        Returns:
            User profile dictionary
        """
        try:
            username = username.lstrip('@')
            url = f"{self.BASE_URL/@username"
            
            # Note: This is a simplified version
            # In production, use proper TikTok API or unofficial API
            return {
                'username': username,
                'error': 'Requires additional API setup',
                'note': 'Use TikTokApi package for full functionality'
            }
            
        except Exception as e:
            print(f"Error fetching user: {e}")
            return None
    
    def _parse_video_data(self, video: Dict) -> Dict:
        """Parse video data from TikTok API response"""
        return {
            'video_id': video.get('id'),
            'description': video.get('desc', ''),
            'create_time': datetime.datetime.fromtimestamp(
                video.get('createTime', 0)
            ).isoformat() if video.get('createTime') else None,
            'author': {
                'id': video.get('author', {}).get('id'),
                'unique_id': video.get('author', {}).get('uniqueId'),
                'nickname': video.get('author', {}).get('nickname'),
            },
            'stats': {
                'views': video.get('stats', {}).get('playCount', 0),
                'likes': video.get('stats', {}).get('diggCount', 0),
                'comments': video.get('stats', {}).get('commentCount', 0),
                'shares': video.get('stats', {}).get('shareCount', 0),
            },
            'music': {
                'title': video.get('music', {}).get('title'),
                'author': video.get('music', {}).get('authorName'),
            },
            'hashtags': [
                tag.get('title', '') 
                for tag in video.get('challenges', [])[:5]
            ],
            'scraped_at': datetime.datetime.now().isoformat(),
        }
    
    def _save_data(self, data: List[Dict], prefix: str):
        """Save scraped data to JSON file"""
        timestamp = datetime.datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f"{prefix}_{timestamp}.json"
        filepath = self.output_dir / filename
        
        with open(filepath, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        
        print(f"✅ Data saved to {filepath}")
    
    def export_to_csv(self, data: List[Dict], filename: str = None):
        """Export data to CSV format"""
        if not data:
            return
        
        import csv
        
        if not filename:
            timestamp = datetime.datetime.now().strftime('%Y%m%d_%H%M%S')
            filename = f"tiktok_export_{timestamp}.csv"
        
        filepath = self.output_dir / filename
        
        keys = ['video_id', 'description', 'create_time', 'author.nickname', 
                'stats.views', 'stats.likes', 'stats.comments', 'stats.shares']
        
        with open(filepath, 'w', newline='', encoding='utf-8') as f:
            writer = csv.DictWriter(f, fieldnames=keys)
            writer.writeheader()
            
            for item in data:
                row = {
                    'video_id': item.get('video_id'),
                    'description': item.get('description', '')[:100],
                    'create_time': item.get('create_time'),
                    'author.nickname': item.get('author', {}).get('nickname'),
                    'stats.views': item.get('stats', {}).get('views', 0),
                    'stats.likes': item.get('stats', {}).get('likes', 0),
                    'stats.comments': item.get('stats', {}).get('comments', 0),
                    'stats.shares': item.get('stats', {}).get('shares', 0),
                }
                writer.writerow(row)
        
        print(f"✅ CSV saved to {filepath}")


def main():
    """Main function for CLI usage"""
    import argparse
    
    parser = argparse.ArgumentParser(description='TikTok Scraper')
    parser.add_argument('--task', choices=['trending', 'user'], default='trending')
    parser.add_argument('--username', help='Username for user task')
    parser.add_argument('--count', type=int, default=20, help='Number of videos')
    parser.add_argument('--output', default='./data', help='Output directory')
    
    args = parser.parse_args()
    
    scraper = TikTokScraper(output_dir=args.output)
    
    if args.task == 'trending':
        print("🔍 Fetching trending videos...")
        data = scraper.get_trending(count=args.count)
        print(f"📊 Found {len(data)} videos")
        
    elif args.task == 'user':
        if not args.username:
            print("❌ Please specify --username")
            return
        print(f"🔍 Fetching user @{args.username}...")
        data = scraper.get_user_profile(args.username)
        print(f"📊 User data: {data}")


if __name__ == '__main__':
    main()
