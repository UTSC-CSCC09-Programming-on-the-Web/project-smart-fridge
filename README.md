## Name:
Smart Fridge

## Team Member:
| Name          | Email                        | UTORid     |
|---------------|------------------------------|------------|
| Jieying Gong  | jieying.gong@mail.utoronto.ca | gongjiey   |

## LIVE DEMO link:
https://youtu.be/RPUU9XBL6Mc

## Web URL
https://smartfridge.dev

## Description:
Smart Fridge is an AI-powered web application that helps users manage fridge ingredients and generate personalized recipes based on what’s available and close to expiring.

Users can upload images of grocery receipts or handwritten shopping lists — the system leverages AI image recognition (CV) and large language models (LLM) to automatically extract and populate ingredients into the fridge. Manual entry of single ingredients is also supported.

The platform supports multi-user collaboration, where multiple users can share and manage the same fridge in real time. In addition, a single user can create/join and manage multiple fridges, making it ideal for families, roommates, or shared kitchens.

### Key Features
- Receipt/Shopping List Parsing: Upload images of receipts or shopping lists to extract ingredients list automatically using CV + LLM pipeline.
- Multi-user Fridge Sharing: Multiple users can collaborate on the same fridge in real time.
- Multiple Fridge Support: A single user can join and manage multiple fridges.
- Real-time Notifications:  Built with Socket.io, all fridge members receive real-time updates on ingredient changes, fridge locks, and more. Each user also receives personal notifications when tasks are completed.
- Smart Recipe Suggestions: AI-generated recipes are created based only on current fridge contents, prioritizing items that are soon to expire.

## Modern frontend framework of choice:
Angular

## Additional feature:
- Use a task queue (BullMQ + Redis) to process uploaded images and recipe generation requests asynchronously. When users upload grocery receipts or fridge photos, the system runs OCR (via Google Cloud Vision) and ingredient extraction (via GPT) in the background without blocking the main app. Recipe generation also runs through an LLM worker in the same queue system.

- Use Socket.io to provide real-time updates in shared fridges and notify users of task results. All members instantly see changes like ingredient updates or fridge locks. Users also receive personal notifications when AI tasks (e.g., recipe generation or ingredient extraction) are completed.

## Tech Stack
### Frontend
- Angular + Angular Material
- RxJS – for reactive state management & real-time event flows

### AI Features
- GPT API – for  recipe generation and ingredient formatting
- Google Cloud Vision API – for OCR-based ingredient extraction from receipt/shopping list images

### Backend & Database
- Express.js (RESTful API)
- PostgreSQL (main DB)
- Redi (Session + Socket + BullMq)
- Redis-semaphore for multi-user concurrency control 

### Real-time Communication
- Socket.io – for user room & fridge room (multi-user shared)

### Task Queue & Worker 
- BullMQ – task queues (handling GPT + CV tasks asynchronously via Redis)

### Authentication & Access Control & Payment
- OAuth 2.0 – Google login via Passport.js
- Express-session + Passport.js – session-based auth management
- Stripe – with webhook integration

### Deployment
- Docker + Docker Compose
- Nginx – reverse proxy
- Github workflows - CI/CD
- DigitalOcean VM – production hosting environment
- Google Cloud Storage (GCS) – static image hosting (ingredient images, receipt uploads)

## MileStones:
### Alpha Version
- Project initialization and environment setup (Angular + Express.js + PostgreSQL)
- Implemented basic frontend routing and layout with reusable components and structured pages
- Designed core PostgreSQL database schema (ingredients, recipes, users, fridges)
- Completed full CRUD APIs for ingredient management
- Connected frontend and backend to form a working end-to-end ingredient flow (manual input)
- Implemented image upload middleware and preview UI

### Beta Version:
- Recipe generation: Integrated GPT API via BullMQ task queue to generate recipes based on fridge content
- WebSocket real-time updates: Used Socket.io to notify task progress and task results
- Multi-user shared fridge support:
  - Designed many-to-many relationship between users and fridges
  - Users can join and manage one fridge collaboratively
- Image recognition and ingredients extraction pipeline:
  - Upload multiple receipt or shopping list images 
  - Images are processed via two separate queues and workers 
      - cvWorker uses Google Cloud Vision API for OCR
      - llmWorker uses GPT API for prompt cleaning and ingredient extraction from text detection result form cvWorker
  - Final result asynchronously extracted with temporary ingredients list and confirmed by user before adding to fridge
- Authentication & Payment:
  - Integrated Google OAuth 2.0
  - Implemented Stripe-based subscription system with payment page
    - Webhook handling for subscription lifecycle validation and sync
  - Implemented user and fridge authorization middlewares 

### Final Version
- Fully Dockerized deployment to Virtual Machine (VM) with Nginx reverse proxy and Github workflows for CI/CD
- Migrated image hosting from Express static to Google Cloud Storage (GCS)
- Extended to support one user managing multiple fridges (implemented user-fridge many-to-many management feature)
- Added Redis-based(reids-semaphore) fridge lock to prevent concurrent updates (fridge scope)
- Built a Real-time Notification Center:
  - Per-user & per-fridge scoped messages
  - Enhanced Socket.io architecture with fridge rooms, lock status sync, error broadcasting, and ingredient updates
  - Frontend powered by RxJS
- UI/UX refinement using Angular Material, with polished layout and component design
- All features testing