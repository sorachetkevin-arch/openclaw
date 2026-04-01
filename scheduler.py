"""
TikTok Scraper Scheduler
Run periodic TikTok data collection
"""

import schedule
import time
import datetime
import json
from pathlib import Path

def load_config():
    """Load configuration from config.yaml"""
    config_path = Path(__file__).parent / 'config.yaml'
    if config_path.exists():
        with open(config_path, 'r') as f:
            return yaml.safe_load(f)
    return {}

def job_trending():
    """Job: Scrape trending videos"""
    print(f"[{datetime.datetime.now()}] 🔍 Running trending scrape...")
    from tiktok_scraper import TikTokScraper
    
    scraper = TikTokScraper(output_dir='./data')
    data = scraper.get_trending(count=20)
    print(f"[{datetime.datetime.now()}] ✅ Scraped {len(data)} videos")

def job_user_analysis():
    """Job: Analyze scraped data"""
    print(f"[{datetime.datetime.now()}] 📊 Running data analysis...")
    # Add analysis logic here
    pass

def run_scheduler():
    """Run the scheduler based on config"""
    import argparse
    import yaml
    
    parser = argparse.ArgumentParser(description='TikTok Scraper Scheduler')
    parser.add_argument('--task', choices=['trending', 'analysis', 'all'], 
                        default='all', help='Task to run')
    parser.add_argument('--interval', type=int, default=60,
                        help='Interval in minutes')
    parser.add_argument('--once', action='store_true',
                        help='Run once and exit')
    
    args = parser.parse_args()
    
    if args.task in ['trending', 'all']:
        schedule.every(args.interval).minutes.do(job_trending)
    
    if args.task in ['analysis', 'all']:
        schedule.every(args.interval).minutes.do(job_user_analysis)
    
    # Run once immediately
    if args.once:
        schedule.run_all()
        return
    
    print(f"⏰ Scheduler started. Running {args.task} every {args.interval} minutes.")
    print("Press Ctrl+C to stop.")
    
    while True:
        schedule.run_pending()
        time.sleep(1)

if __name__ == '__main__':
    run_scheduler()
