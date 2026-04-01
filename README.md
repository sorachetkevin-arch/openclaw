# TikTok Scraper System

ระบบดึงข้อมูล TikTok สำหรับ Social Media Analytics

## Features

- 🎬 ดึงข้อมูล Trending Videos
- 👤 ดึงข้อมูล User Profile
- 📊 วิเคราะห์ Engagement Metrics
- 📅 ตั้งเวลาดึงข้อมูลอัตโนมัติ (Cron)
- 📁 Export ข้อมูลเป็น JSON/CSV

## Installation

```bash
pip install -r requirements.txt
```

## Usage

### Basic - Scrape Trending Videos

```python
from tiktok_scraper import TikTokScraper

scraper = TikTokScraper()
trending = scraper.get_trending(count=20)
print(trending)
```

### Scrape User Profile

```python
user_data = scraper.get_user_profile("@username")
print(user_data)
```

### Schedule Daily Scrape

```bash
python scheduler.py --task trending --interval daily
```

## Configuration

ดู `config.yaml` สำหรับตั้งค่า:
- API credentials
- Output directory
- Schedule settings

## Disclaimer

⚠️ ระบบนี้ใช้สำหรับการศึกษาและวิจัยเท่านั้น
โปรดตรวจสอบ TikTok Terms of Service ก่อนใช้งาน
# openclaw
