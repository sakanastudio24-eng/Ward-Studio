# Ward Studio Portfolio - Technical Documentation

## Project Overview

This is a professional contractor portfolio website for Ward Studio, showcasing capabilities in both design and development work. The site features a minimal, typography-focused design with advanced interactions, SEO optimization, and keyboard navigation.

## Product Drawer System (Current)

The `/products` page now includes a staged purchase flow with reusable components:

- `src/app/components/products/ProductPurchaseDrawer.tsx`
- `src/app/components/products/CheckoutDrawer.tsx`
- `src/app/components/products/PlanAndAddons.tsx`
- `src/app/components/products/PriceSummary.tsx`
- `src/lib/pricing.ts`
- `src/lib/rules.ts`

### DetailFlow Flow

1. `package` step:
- Tier selection
- Booking preference
- General functional add-ons

2. `readiness` step:
- Readiness add-ons
- Readiness checklist + gate
- Compatibility guidance

3. `payment` step:
- Total/deposit/remaining summary
- Stripe checkout trigger (current demo pass flow)
- Terms/refund policy overlay links

4. Post-purchase right drawer:
- Confirmation and order summary
- Strategy call CTA
- Preparation checklist
- Email/support messaging
- Booking-confirmed upload instructions on return focus

### Success Verification + Celebration

- Route: `src/app/products/success/SuccessClient.tsx`
- Verify API: `src/app/api/stripe/session/route.ts`
- Confetti:
  - Fires only after verification resolves to paid
  - Requires `celebrate=1` query param
  - Limited to once per browser session via `sessionStorage`

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Core Features](#core-features)
3. [Component Documentation](#component-documentation)
4. [Hooks Documentation](#hooks-documentation)
5. [SEO Implementation](#seo-implementation)
6. [Keyboard Navigation](#keyboard-navigation)
7. [Interactive Features](#interactive-features)
8. [Tech Stack](#tech-stack)

---

## Architecture Overview

### File Structure

```
/src
├── /app
│   ├── App.tsx                          # Main application component
│   ├── /components
│   │   ├── Capabilities.tsx              # Capabilities section (12 items)
│   │   ├── Contact.tsx                   # Contact form section
│   │   ├── DinoGame.tsx                  # Desktop Easter egg game (ZECH Runner)
│   │   ├── FlappyBird.tsx               # Mobile Easter egg game
│   │   ├── Footer.tsx                    # Massive WARD footer with scroll animation
│   │   ├── Hero.tsx                      # Hero section with hover effects
│   │   ├── HoverTooltip.tsx             # Orange tooltip system
│   │   ├── HowIWork.tsx                 # How I Work section (4 principles)
│   │   ├── KeyboardIndicator.tsx        # Keyboard navigation hint UI
│   │   ├── ProjectCard.tsx              # Individual case study card
│   │   ├── SEOHead.tsx                  # Dynamic SEO meta tags
│   │   ├── Work.tsx                     # Case studies section (6 projects)
│   │   └── /ui                          # Reusable UI components
│   └── /hooks
│       └── useKeyboardNavigation.ts     # Keyboard navigation logic
├── /styles
│   ├── fonts.css                        # Font imports
│   └── theme.css                        # Design tokens and base styles
└── /public
    ├── sitemap.xml                      # XML sitemap for SEO
    └── robots.txt                       # Search engine crawling rules

```

---

## Core Features

### 1. **Section-Based Navigation**
- Single-page application with 6 main sections
- Smooth scroll navigation
- Keyboard shortcuts (↑/↓ or W/S)
- No traditional navigation menu

### 2. **Interactive Elements**
- Hero section with dramatic color transitions on hover
- Footer WARD typography that scales based on scroll position
- Orange tooltip system with witty messages
- Full-screen case study overlays
- Two hidden games (desktop and mobile)

### 3. **SEO Optimization**
- XML sitemap with all section anchors
- robots.txt configuration
- Dynamic meta tags that update based on visible section
- Open Graph and Twitter Card support
- Schema.org structured data for rich search results

### 4. **Responsive Design**
- Mobile-first approach
- Different games for desktop/mobile
- Adaptive typography and spacing
- Touch-friendly interactions

---

## Component Documentation

### App.tsx

**Purpose:** Main application component that orchestrates all sections and global features.

**Key Responsibilities:**
- Renders all page sections in order
- Manages game overlay state
- Provides tooltip context to child components
- Initializes keyboard navigation
- Handles mobile/desktop detection
- Controls page load animations

**State Management:**
- `gameOpen`: Boolean controlling game overlay visibility
- `isMobile`: Boolean detecting mobile viewport
- `isLoaded`: Boolean for page load animation trigger

---

### Hero.tsx

**Purpose:** Landing section introducing Ward Studio as a hybrid design/engineering contractor.

**Features:**
- Interactive hover effects on "design" and "engineering" keywords
- Background color transitions (orange for design, black for engineering)
- CTA buttons for viewing work and contact
- Tooltip integration

**Hover States:**
- Hovering "design" → Orange background, white text
- Hovering "engineering" → Black background, white text
- Smooth 300ms transitions

---

### Capabilities.tsx

**Purpose:** Displays 12 professional capabilities across 3 categories.

**Categories:**
1. **Design Systems** (4 items)
   - Brand Identity & Visual Direction
   - Component Libraries & UI Systems
   - Design Tokens & Theming
   - Documentation & Guidelines

2. **Web Engineering** (4 items)
   - Next.js/React Applications
   - TypeScript Development
   - Python Backend Development
   - Performance Optimization

3. **Integrations & Automation** (4 items)
   - Payment & Booking Flows
   - Email Systems & Templates
   - Webhooks & API Integrations
   - Third-Party Service Setup

**Layout:**
- Grid layout responsive across screen sizes
- Clean typography hierarchy
- Minimal visual design

---

### Work.tsx

**Purpose:** Showcases 6 fake case studies (3 engineering, 3 design).

**Case Studies:**

**Engineering Projects:**
1. **TechFlow Dashboard** - SaaS analytics platform (Next.js, TypeScript, PostgreSQL)
2. **PaymentBridge API** - Payment processing API (Python, FastAPI, Stripe)
3. **AutomateHub** - Workflow automation platform (React, Node.js, Redis)

**Design Projects:**
4. **Meridian Design System** - Enterprise UI system (Figma, React, Storybook)
5. **Velocity Branding** - Tech startup brand identity (Illustrator, After Effects)
6. **Cloudscape UI** - SaaS product redesign (Figma, Principle, CSS)

**Features:**
- Grid of clickable project cards
- Full-screen overlay with detailed case study
- Shows context, problem, approach, tools, and outcomes
- Smooth animations for overlay open/close

---

### HowIWork.tsx

**Purpose:** Explains working principles and approach.

**4 Principles:**
1. **Structure First** - Clear processes and documentation
2. **Direct Communication** - No fluff, straight answers
3. **Measurable Results** - Focus on metrics and outcomes
4. **Clean Handoffs** - Well-organized deliverables

**Layout:**
- Two-column grid on desktop
- Single column on mobile
- Numbered list format

---

### Contact.tsx

**Purpose:** Contact form for project inquiries.

**Form Fields:**
- Name (required)
- Email (required)
- Project Type (select: Design, Engineering, Both)
- Message (textarea, required)
- Budget Range (select)

**Features:**
- Form validation
- Tooltip integration on submit button
- Mock form submission (frontend only)
- Success state with message

---

### Footer.tsx

**Purpose:** Massive footer with scaling WARD typography and navigation.

**Key Features:**

**1. Scroll-Based Animation**
- WARD text scales from 0.3 to 1.0 based on scroll position
- Calculated using viewport intersection
- Smooth transform transitions

**2. Hover Effect**
- Hovering "WARD" changes background to orange
- All text becomes white
- 300ms transition

**3. Navigation Links**
- Home (scroll to top)
- Work (scroll to work section)
- Contact (scroll to contact section)
- Games (opens game overlay)
- Terms & Conditions (placeholder)

**4. Footer Info**
- Copyright year (dynamic)
- Creator credit

---

### ProjectCard.tsx

**Purpose:** Individual case study card component.

**Props:**
- `title`: Project name
- `category`: "Design" or "Engineering"
- `description`: Brief overview
- `year`: Project year
- `onClick`: Handler for opening overlay

**Features:**
- Hover state with color transition
- Category badge
- Clean typography
- Click to expand full case study

---

### HoverTooltip.tsx

**Purpose:** Orange tooltip that follows mouse cursor with witty messages.

**Components:**

**1. `HoverTooltip` Component**
- Renders tooltip at mouse position
- Animates in/out with Motion
- Orange background (#FF6B35)
- Black text with small arrow

**2. `useHoverTooltip` Hook**
- Manages tooltip text state
- Tracks mouse position
- Returns state and setters

**3. `getTooltipMessage` Function**
- Maps button text to witty responses
- 70+ unique messages
- Personality-driven copy

**Tooltip Messages Examples:**
- "View Work" → "Let's see what you've got"
- "Get in Touch" → "Shoot your shot"
- "Submit" → "Send it to the void"
- "Close" → "Peace out"

---

### SEOHead.tsx

**Purpose:** Dynamic SEO meta tags that update based on visible section.

**Features:**

**1. Section-Specific Meta Tags**
- Hero: General portfolio description
- Capabilities: Skills and services
- Work: Case studies focus
- How I Work: Process and approach
- Contact: Get in touch CTA

**2. Meta Tag Types**
- Standard meta tags (description, keywords)
- Open Graph (og:title, og:description, og:image)
- Twitter Cards (twitter:card, twitter:title, etc.)
- Canonical URL

**3. Schema.org Structured Data**
```json
{
  "@type": "Person",
  "name": "Zechariah Ward",
  "jobTitle": "Design & Engineering Contractor",
  "description": "...",
  "url": "https://wardstudio.com",
  "sameAs": [...social links...]
}
```

**4. Additional SEO Elements**
- Viewport configuration
- Theme color
- Charset declaration
- Robots directives

---

### KeyboardIndicator.tsx

**Purpose:** Visual hint showing keyboard navigation shortcuts.

**Behavior:**
- Appears on page load
- Shows arrow keys and W/S alternatives
- Auto-hides after 5 seconds
- Hides on first scroll or keypress
- Positioned bottom-right corner

**UI Elements:**
- Keyboard key badges (↑/↓/W/S)
- Explanatory text
- Smooth fade in/out animations
- Styled with border and shadow

---

### DinoGame.tsx

**Purpose:** Desktop Easter egg game (ZECH Runner - Chrome dino clone).

**Gameplay:**
- Press Space or Up Arrow to jump
- Avoid obstacles
- Score increases over time
- Game speeds up progressively

**Features:**
- Canvas-based rendering
- Collision detection
- Score tracking
- Game over state
- Restart functionality
- Close button with tooltip

**Controls:**
- Space/↑ to jump
- R to restart after game over
- Click close button to exit

---

### FlappyBird.tsx

**Purpose:** Mobile Easter egg game (Flappy Bird clone).

**Gameplay:**
- Tap screen to flap
- Navigate through pipe gaps
- Score points for passing pipes
- Game over on collision

**Features:**
- Canvas-based rendering
- Touch controls
- Gravity simulation
- Pipe generation
- Score tracking
- Game over state
- Restart functionality

**Controls:**
- Tap screen to flap
- Tap to restart after game over
- Click close button to exit

---

## Hooks Documentation

### useKeyboardNavigation.ts

**Purpose:** Enables keyboard-based navigation between sections.

**Configuration:**
```typescript
const SECTIONS = ['hero', 'capabilities', 'work', 'how-i-work', 'contact', 'footer'];
```

**Functions:**

#### `useKeyboardNavigation()`
Main hook that manages keyboard navigation state and listeners.

**Returns:**
- `currentSection`: Index of currently visible section (0-5)
- `totalSections`: Total number of sections (6)

**Key Behaviors:**

1. **Keyboard Listeners**
   - Arrow Down / S → Next section
   - Arrow Up / W → Previous section
   - Prevents default browser scrolling
   - Disables shortcuts when typing in inputs

2. **Scroll Tracking**
   - Monitors scroll position
   - Updates current section based on viewport center
   - Handles edge cases (top of page)

3. **Smooth Scrolling**
   - Uses `scrollIntoView` with smooth behavior
   - Special handling for hero section (scroll to top)

**Helper Functions:**

#### `handleKeyDown(e: KeyboardEvent)`
Processes keyboard input and triggers navigation.

**Logic:**
- Checks if key is navigation key (arrows or W/S)
- Prevents action if user is typing in input/textarea
- Calculates next section index
- Triggers smooth scroll if section changes

#### `scrollToSection(sectionId: string)`
Scrolls viewport to specific section.

**Parameters:**
- `sectionId`: String ID of target section

**Logic:**
- Special case for 'hero' (scroll to top)
- Finds element by ID
- Scrolls into view smoothly

#### `handleScroll()`
Tracks current section based on scroll position.

**Logic:**
- Calculates scroll position at viewport center
- Iterates through sections in reverse order
- Updates `currentSection` state when crossing threshold
- Special handling for hero section (top 100px)

---

## SEO Implementation

### XML Sitemap (/public/sitemap.xml)

**Purpose:** Helps search engines discover all sections of the portfolio.

**Structure:**
```xml
<urlset>
  <url>
    <loc>https://wardstudio.com/</loc>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://wardstudio.com/#capabilities</loc>
    <priority>0.8</priority>
  </url>
  <!-- ... more sections -->
</urlset>
```

**Sections Included:**
- Home (/)
- Capabilities (#capabilities)
- Work (#work)
- How I Work (#how-i-work)
- Contact (#contact)
- Footer (#footer)

**Metadata:**
- Last Modified: 2026-02-15
- Change Frequency: Monthly/Weekly/Yearly
- Priority: 0.5 - 1.0

---

### robots.txt (/public/robots.txt)

**Purpose:** Controls search engine crawler behavior.

**Configuration:**
```
User-agent: *
Allow: /
Sitemap: https://wardstudio.com/sitemap.xml
```

**Meaning:**
- All crawlers allowed
- All paths accessible
- Sitemap location specified

---

### Meta Tags Strategy

**Dynamic Updates:**
- Meta tags change based on visible section
- Implemented via `SEOHead` component
- Updates on scroll using Intersection Observer

**Tag Categories:**

1. **Standard Meta Tags**
   - `<title>` - Page title (section-specific)
   - `<meta name="description">` - Section description
   - `<meta name="keywords">` - Relevant keywords

2. **Open Graph (Facebook/LinkedIn)**
   - `og:title` - Social share title
   - `og:description` - Social share description
   - `og:type` - "website"
   - `og:url` - Current URL
   - `og:image` - Social share image

3. **Twitter Cards**
   - `twitter:card` - "summary_large_image"
   - `twitter:title` - Tweet title
   - `twitter:description` - Tweet description
   - `twitter:image` - Tweet image

4. **Schema.org (JSON-LD)**
   - Structured data for rich snippets
   - Person schema for personal brand
   - Professional information
   - Contact methods

---

## Keyboard Navigation

### Key Bindings

| Key | Action |
|-----|--------|
| ↓ (Arrow Down) | Next section |
| ↑ (Arrow Up) | Previous section |
| S | Next section (alternative) |
| W | Previous section (alternative) |

### Section Order

1. Hero (index 0)
2. Capabilities (index 1)
3. Work (index 2)
4. How I Work (index 3)
5. Contact (index 4)
6. Footer (index 5)

### Implementation Details

**Scroll Behavior:**
- Smooth animated scrolling
- `scrollIntoView({ behavior: 'smooth', block: 'start' })`
- Hero uses `window.scrollTo({ top: 0 })`

**Input Protection:**
- Keyboard shortcuts disabled when focus is in:
  - `<input>` elements
  - `<textarea>` elements
- Prevents interference with form filling

**Visual Feedback:**
- `KeyboardIndicator` component shows available keys
- Auto-hides after first interaction or 5 seconds
- Positioned in bottom-right corner

---

## Interactive Features

### 1. Hero Hover Effects

**Trigger Elements:**
- "design" keyword
- "engineering" keyword

**Effects:**
- **Design Hover:**
  - Background: Orange (#FF6B35)
  - Text: White
  - Transition: 300ms
  
- **Engineering Hover:**
  - Background: Black (#000000)
  - Text: White
  - Transition: 300ms

**Implementation:**
```tsx
const [hoveredWord, setHoveredWord] = useState<'design' | 'engineering' | null>(null);
```

---

### 2. Footer Scroll Animation

**Effect:** WARD typography scales from small to large as footer enters viewport.

**Scale Range:** 0.3 → 1.0 (30% to 100%)

**Calculation:**
```typescript
const progress = Math.max(0, Math.min(1, 1 - (rect.top / windowHeight)));
const newScale = 0.3 + (progress * 0.7);
```

**Breakdown:**
- `rect.top`: Distance from viewport top to footer top
- `windowHeight`: Viewport height
- `progress`: 0 when footer just enters, 1 when fully visible
- `newScale`: Interpolated scale value

**Additional Effects:**
- Hover changes background to orange
- All text becomes white
- Cursor: default (prevents accidental selection)

---

### 3. Tooltip System

**Appearance:**
- Orange background (#FF6B35)
- Black text
- Small arrow pointing down
- Follows mouse cursor
- 8px offset from cursor

**Activation:**
- Triggers on `onMouseEnter` of buttons/links
- Displays contextual witty message
- Updates position on mouse move
- Fades out on `onMouseLeave`

**Message Logic:**
```typescript
getTooltipMessage(buttonText: string): string
```
- 70+ predefined messages
- Maps button text to witty response
- Falls back to generic messages

---

### 4. Case Study Overlays

**Trigger:** Click on any ProjectCard

**Layout:**
- Full-screen overlay (fixed position)
- Dark semi-transparent backdrop
- Centered content card
- Close button (top-right)
- Scrollable content area

**Content Sections:**
1. **Header**
   - Project title
   - Category badge
   - Year
   - Close button

2. **Overview**
   - Context paragraph
   - Problem statement

3. **Approach**
   - Solution methodology
   - Key strategies

4. **Tools & Technologies**
   - Comma-separated list
   - Technology stack

5. **Outcomes**
   - Measurable results
   - Success metrics

**Animations:**
- Fade in/out (300ms)
- Scale animation on open
- Smooth transitions

---

### 5. Easter Egg Games

**Activation:**
- Footer "Games" link
- Opens full-screen game overlay

**Game Selection:**
- Desktop (≥768px): ZECH Runner (Chrome dino)
- Mobile (<768px): Flappy Bird

**Shared Features:**
- Full-screen canvas
- Score tracking
- Game over state
- Restart functionality
- Close button

**ZECH Runner (Desktop):**
- Jump: Space or ↑
- Obstacles appear randomly
- Speed increases over time
- High score tracking

**Flappy Bird (Mobile):**
- Tap to flap
- Pipe obstacles
- Gap varies randomly
- Gravity simulation

---

## Tech Stack

### Core Technologies

- **React 18** - UI library
- **TypeScript** - Type safety
- **Tailwind CSS v4** - Styling
- **Motion (Framer Motion)** - Animations
- **Vite** - Build tool

### Key Libraries

- **motion/react** - Animation library
  - `import { motion } from "motion/react"`
  - Smooth transitions
  - Enter/exit animations
  - Scroll-based animations

- **lucide-react** - Icon library
  - Menu, X, Mail, Calendar icons
  - Chevron icons for navigation hints

### Browser APIs Used

- **Canvas API** - Game rendering
- **Intersection Observer** - Section detection (SEO)
- **Scroll Events** - Footer animation, keyboard nav tracking
- **Keyboard Events** - Navigation shortcuts
- **Mouse Events** - Tooltip positioning

### Development Tools

- **ESLint** - Code linting
- **PostCSS** - CSS processing
- **TypeScript Compiler** - Type checking

---

## Styling System

### CSS Architecture

**File Structure:**
```
/src/styles
├── fonts.css   # Font imports (Google Fonts, etc.)
└── theme.css   # Design tokens, base styles, Tailwind config
```

### Design Tokens (theme.css)

**Colors:**
```css
--color-orange: #FF6B35;
--color-background: hsl(0 0% 100%);
--color-foreground: hsl(0 0% 3.9%);
--color-muted: hsl(0 0% 96.1%);
--color-muted-foreground: hsl(0 0% 45.1%);
--color-border: hsl(0 0% 89.8%);
```

**Typography:**
- Font family: Inter (primary)
- Responsive sizing
- Line height ratios
- Weight scale

**Spacing:**
- Tailwind default scale
- Consistent padding/margins
- Responsive breakpoints

### Tailwind Configuration

**Custom Utilities:**
- `transition-colors` - 300ms color transitions
- `transition-all` - Multi-property transitions
- Custom easing functions

**Responsive Breakpoints:**
- `sm`: 640px
- `md`: 768px
- `lg`: 1024px
- `xl`: 1280px

---

## Performance Considerations

### Optimization Strategies

1. **Lazy Loading**
   - Game components only render when overlay opens
   - Case study details load on demand

2. **Event Debouncing**
   - Scroll listeners optimized
   - Mouse move throttling for tooltip

3. **Animation Performance**
   - CSS transforms (GPU accelerated)
   - `will-change` hints for animations
   - Motion's optimized animation engine

4. **Code Splitting**
   - Component-based architecture
   - Vite's automatic code splitting

5. **Image Optimization**
   - Unsplash images served via CDN
   - Responsive image sizing
   - Lazy loading images below fold

---

## Accessibility Considerations

### Keyboard Navigation

- All interactive elements focusable
- Logical tab order
- Keyboard shortcuts for power users
- Input protection (shortcuts disabled in forms)

### Semantic HTML

- Proper heading hierarchy (h1, h2, h3)
- Semantic section elements
- Form labels and ARIA attributes
- Alt text for images

### Screen Readers

- Descriptive link text
- ARIA labels for icon buttons
- Form validation messages
- Skip navigation (could be added)

### Color Contrast

- Text meets WCAG AA standards
- Sufficient contrast ratios
- Focus indicators visible

---

## Future Enhancement Ideas

### Features to Consider

1. **Dark Mode**
   - Toggle in footer
   - Respect system preference
   - Smooth theme transition

2. **Real Backend Integration**
   - Contact form submission to email service
   - Database for case studies
   - Analytics tracking

3. **More Games**
   - Additional Easter eggs
   - High score leaderboard
   - More game variety

4. **Blog Section**
   - Technical writing
   - Case study deep-dives
   - Process documentation

5. **Testimonials**
   - Client quotes
   - Project references
   - Social proof

6. **Enhanced Animations**
   - Parallax scrolling
   - More hover effects
   - Micro-interactions

7. **Internationalization**
   - Multi-language support
   - Localized content
   - Regional adaptations

---

## Deployment Checklist

### Pre-Deployment

- [ ] Update sitemap.xml with production domain
- [ ] Update robots.txt with production domain
- [ ] Update SEO meta tags with production URLs
- [ ] Test all forms and interactions
- [ ] Verify responsive design on all devices
- [ ] Check browser compatibility
- [ ] Optimize images
- [ ] Minify CSS/JS
- [ ] Test keyboard navigation
- [ ] Verify SEO meta tags

### Production Configuration

- [ ] Set up analytics (Google Analytics, Plausible, etc.)
- [ ] Configure CDN for assets
- [ ] Set up SSL certificate
- [ ] Configure caching headers
- [ ] Set up error tracking (Sentry, etc.)
- [ ] Create 404 page
- [ ] Set up monitoring
- [ ] Configure security headers

### Post-Deployment

- [ ] Submit sitemap to Google Search Console
- [ ] Submit sitemap to Bing Webmaster Tools
- [ ] Test all functionality in production
- [ ] Monitor performance metrics
- [ ] Check SEO indexing status
- [ ] Verify social share previews
- [ ] Test from different locations/devices

---

## Contact & Support

**Portfolio Owner:** Zechariah Ward  
**Studio:** Ward Studio  
**Website:** https://wardstudio.com  
**Email:** [Contact form on site]

---

## License

© 2026 Ward Studio. All rights reserved.

---

*Last Updated: February 15, 2026*
