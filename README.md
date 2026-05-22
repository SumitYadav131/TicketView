# ViewMe Tickets - Exact Seat Preview Technology

## 🎯 What is ViewMe Tickets?

ViewMe Tickets is a browser extension and API that shows ticket buyers **exactly what their view will look like** before purchasing seats on Ticketmaster, StubHub, and other ticket marketplaces.

## 🔥 The Problem We Solve

Ticket sites show you a 2D dot on a map. You have no idea if you're behind a pillar, have a restricted view, or just can't see the stage. ViewMe gives you a **3D/360° preview** from your exact seat.

## 🌍 Global Coverage

| Region | Status | Venues |
|--------|--------|--------|
| North America | ✅ Active | 55 |
| Europe | ✅ Active | 8 |
| Oceania | ✅ Active | 1 |
| Latin America | 📅 Planned Q1 2026 | 0 |
| Asia Pacific | 📅 Planned Q2 2026 | 0 |
| Middle East | 📅 Planned Q3 2026 | 0 |
| Africa | 📅 Planned Q4 2026 | 0 |

**Total: 67 venues mapped** | **45 with seat-level coordinates**

## 🚀 Features

- 🔍 **Browser Extension** - Adds "Preview with ViewMe" button on Ticketmaster/StubHub
- 🎮 **3D Seat Preview** - Interactive WebGL view from any seat
- 📸 **Crowd-sourced Photos** - Users upload real views from events
- 🌐 **30+ Countries** - Expansion roadmap across 6 continents

## 📁 Project Structure
viewme-tickets/
├── extension/ # Chrome extension (load unpacked)
├── backend/ # CSV to JSON converter
├── regions.json # Global expansion strategy
└── README.md # This file

## 🛠️ Tech Stack

- **Frontend:** Three.js (WebGL), HTML5 Canvas, SVG
- **Extension:** Chrome Extension Manifest V3
- **Data:** JSON venue database with seat coordinates
- **APIs:** Ticketmaster Discovery API, StubHub Live Feed API

## 📦 Installation (For Developers)

### 1. Load the Chrome Extension
```bash
# Clone the repo
git clone https://github.com/YOUR_USERNAME/viewme-tickets.git

# Open Chrome → chrome://extensions
# Enable "Developer mode"
# Click "Load unpacked" → select the /extension folder