# BazaarBid - Reverse Auction Marketplace for Wholesale & Retail

## 🎯 Product Overview

BazaarBid is a dual-sided marketplace connecting:
- **Big Market Sellers** (Vashi, Byculla, etc.) who sell fresh produce, dry fruits, vegetables, groceries
- **Local Shop Sellers** who resell products to end consumers
- **Normal Buyers** (households) buying 1-10 kg for home use
- **Retail Buyers** (restaurants, hotels, mess, tiffin services) buying 50-500 kg in bulk

**Unique Selling Proposition (USP):** Reverse auction system for bulk purchases where multiple sellers bid against each other to win business from retail buyers.

---

## 🏗️ System Architecture

### Tech Stack
- **Backend:** Node.js + Express.js
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** JWT (JSON Web Tokens)
- **Real-time:** Socket.io (for live bidding updates)
- **File Upload:** Multer + Cloudinary
- **Payments:** Razorpay
- **Queue/Jobs:** BullMQ + Redis (for auction closing automation)

### Portals
1. **Main Website** - SEO-friendly landing page (Next.js)
2. **Normal Buyer Portal** - React SPA for household shoppers
3. **Retail Buyer Portal** - React SPA for bulk buyers (auction creation)
4. **Seller Portal** - React SPA for marketplace sellers
5. **Admin Panel** - React + Material-UI for platform management

---

## 📊 Database Schema Overview

### Core Collections

#### 1. `users`
Stores all platform users with role-based fields
- **Fields:** name, email, phone, password (hashed), role, isVerified, isActive
- **Role values:** `normal_buyer`, `retail_buyer`, `seller`, `admin`
- **Seller-specific:** sellerType (`big_market`/`local_shop`), sellerMarket, isReseller
- **Business details:** gstNumber, panNumber, fssaiNumber, businessName, businessType
- **Location:** coordinates (GeoJSON for geo-search), city, area, pincode
- **Indexes:** email(unique), phone(unique), role+isActive, location(2dsphere)

#### 2. `products`
Products listed by sellers for normal buyers
- **Fields:** sellerId(ref), name, description, category, unit, pricePerUnit, stock
- **Bulk pricing array:** [{minQuantity, maxQuantity, pricePerUnit, discount}]
- **Images:** array of {url, publicId, isPrimary}
- **Attributes:** brand, origin, variety, organic, vegetarian
- **Status:** isAvailable, isFeatured, approvalStatus
- **Indexes:** text index on name+description, category, sellerId, pricePerUnit

#### 3. `auctions` (CORE USP - Reverse Auction)
Bulk purchase requests from retail buyers
- **Fields:** buyerId(ref), productName, category, quantity, unit
- **Quality specs:** grade, organic, freshness, packaging
- **Delivery preferences:** preferredMarket, deliveryAddress, deliveryTimeline(days)
- **Budget range:** min, max (per unit)
- **Auction settings:** startTime, endTime, autoAward(boolean)
- **Status:** draft, open, closed, awarded, cancelled, expired, completed
- **Bid summary:** totalBids, lowestBid, highestBid, averageBid
- **Winner:** winningBidId, winningSellerId, winningPrice, awardedAt
- **Indexes:** status+endTime, buyerId+status, category+preferredMarket

#### 4. `bids`
Seller responses to auctions (Reverse auction = lowest price wins)
- **Fields:** auctionId(ref), sellerId(ref), bidPrice(total), pricePerUnit
- **Delivery offer:** deliveryTimeline(days), deliveryCharges, freeDelivery
- **Additional:** discountOffered(%), sampleAvailable, qualityGuarantee
- **Source:** sourceMarket, freshness
- **Status:** active, withdrawn, outbid, won, lost
- **Ranking:** rank (1 = lowest bid)
- **Unique constraint:** auctionId + sellerId (one bid per seller per auction)
- **Indexes:** auctionId+bidPrice+deliveryTimeline (for finding winners)

#### 5. `orders`
Orders from both direct purchase and auction wins
- **Fields:** orderNumber(auto-gen), type(direct/auction_won)
- **Participants:** buyerId(ref), sellerId(ref)
- **For auction orders:** auctionId(ref), bidId(ref)
- **Items array:** productId, productName, quantity, unit, pricePerUnit, totalPrice
- **Pricing:** subtotal, deliveryCharges, discount, tax, totalAmount
- **Payment:** paymentStatus(pending/paid/failed/refunded), paymentMethod, paymentId
- **Delivery:** deliveryAddress, deliveryTimeline, deliveryDate
- **Order status:** pending, confirmed, processing, shipped, delivered, cancelled
- **Timeline:** confirmedAt, processedAt, shippedAt, deliveredAt, cancelledAt
- **Rating:** score(1-5), review, createdAt
- **Indexes:** buyerId+createdAt, sellerId+status, orderNumber

#### 6. `categories`
Product categories with hierarchical structure
- **Fields:** name, slug(unique), description, parentCategory(ref), icon, image
- **Level:** 0(main), 1(sub), 2(sub-sub)
- **Attributes:** array of {name, type, options}
- **Order:** for display sorting

#### 7. `notifications`
User notifications for events
- **Fields:** userId(ref), type(enum), title, message, data(Mixed), isRead
- **Types:** bid_placed, outbid, auction_won, auction_expired, order_*, payment_*
- **Sent via:** email, sms, push (booleans)

---

## 🔄 Core Workflows

### Workflow 1: Normal Buyer Purchasing (B2C)

This is a complete project description , save it in a md file for your reference