# Design Guidelines: Lifesaver Tech - Smart Intake Form

## Design Approach

**Selected Approach:** Design System Foundation (Material Design principles) with SaaS Tool References (Linear, Notion, Typeform)

**Justification:** This is a utility-focused business tool that doubles as a marketing demo. It requires trustworthy, professional aesthetics with clear hierarchy and intuitive interactions. Drawing from Linear's clean typography and Typeform's form design excellence while maintaining Material Design's structured approach to form components.

**Key Design Principles:**
- Clarity over cleverness: Every element serves the conversion goal
- Progressive disclosure: Guide users naturally from value proposition to form submission
- Trust-building: Professional polish signals reliability for business owners
- Efficiency: Minimize friction in the submission flow

---

## Core Design Elements

### A. Typography

**Font Families:**
- Primary: Inter (headings, UI elements, form labels)
- Secondary: System UI fonts for body text

**Type Scale:**
- Hero Headline: text-5xl md:text-6xl font-bold (48-60px)
- Section Headings: text-3xl md:text-4xl font-semibold (36-48px)
- Subsection Headings: text-xl md:text-2xl font-medium (20-24px)
- Body Text: text-base md:text-lg (16-18px)
- Form Labels: text-sm font-medium uppercase tracking-wide (14px)
- Helper Text: text-sm (14px)
- Button Text: text-base font-semibold (16px)

**Line Heights:**
- Headings: leading-tight (1.25)
- Body: leading-relaxed (1.625)
- Form elements: leading-normal (1.5)

---

### B. Layout System

**Spacing Primitives:** Use Tailwind units of 2, 4, 8, 12, 16, 20, 24 (e.g., p-4, gap-8, mt-12)

**Section Padding:**
- Desktop: py-20 to py-24
- Tablet: py-16
- Mobile: py-12

**Container Structure:**
- Full-width sections with max-w-6xl centered containers
- Form sections: max-w-2xl for optimal reading/input width
- Content sections: max-w-5xl

**Grid System:**
- Features/Benefits: grid-cols-1 md:grid-cols-2 lg:grid-cols-3
- Form layout: Single column on all viewports for focus
- Trust indicators: grid-cols-2 md:grid-cols-4

---

## Component Library

### Navigation (Header)
- Fixed position with subtle backdrop blur
- Logo (left): "Lifesaver Tech" wordmark with icon
- Navigation links (right): Features, How It Works, Contact
- CTA button (far right): "Get Started" with primary styling
- Mobile: Hamburger menu with slide-out drawer
- Height: h-16 with px-6 horizontal padding

### Hero Section
- Height: min-h-[600px] (not forced viewport)
- Layout: Two-column on desktop (60/40 split), stacked on mobile
- Left column: 
  - Headline: "Never Miss a Lead Again"
  - Subheadline: "Automated intake forms that instantly organize leads in Google Sheets and notify your team"
  - Two CTAs side-by-side: "Try Demo Form" (primary) + "See How It Works" (secondary)
  - Trust badge row: "Trusted by 500+ businesses • Free to start • No credit card"
- Right column: Hero image showing dashboard/form interface mockup
- Image: Use illustrative screenshot or professional hero image

### Features Section
- Three-column grid on desktop, single column mobile
- Each feature card includes:
  - Icon (top, size: w-12 h-12)
  - Heading (text-xl font-semibold)
  - Description (text-base, 2-3 lines)
  - Micro-detail or stat if applicable
- Cards: Subtle border, padding p-8, rounded-lg
- Gap between cards: gap-8

**Feature Cards:**
1. "Instant Google Sheets Logging" - Auto-sync to spreadsheets
2. "Real-Time Email Alerts" - Never miss a notification
3. "Slack Integration" - Team coordination made easy

### How It Works Section
- Split layout: Left side numbered steps, right side visual representation
- Steps (3-4 items):
  - Large numbers (text-4xl font-bold with opacity-20 background)
  - Step title (text-lg font-semibold)
  - Step description (text-base)
- Visual: Diagram or screenshot sequence showing the flow
- Spacing between steps: space-y-8

### Demo Intake Form Section (Primary Conversion Point)
- Centered layout with max-w-2xl
- Section header above form: "Try It Now - Submit a Test Lead"
- Form container: Elevated card with border, rounded-lg, p-8 md:p-12
- Form fields (vertical stack with space-y-6):
  1. Name (text input, required)
  2. Email (email input, required, with validation icon)
  3. Phone (tel input, optional tag visible)
  4. Message (textarea, rows-4, required)
- Each field:
  - Label above (text-sm font-medium uppercase tracking-wide)
  - Input: Full width, h-12 for text inputs, rounded-md, px-4
  - Helper text below if needed (text-sm)
  - Error states: Red border + error message
- Submit button: Full width on mobile, w-auto on desktop, h-12, px-8
- Success message: Inline confirmation with icon + "Thanks! We'll be in touch soon"
- Loading state: Button disabled with spinner

### Social Proof Section
- Two-column layout: Testimonial + Stats
- Testimonial card:
  - Quote text (text-lg italic)
  - Attribution: Name, role, company
  - Small avatar image
- Stats grid (2x2):
  - Large number (text-4xl font-bold)
  - Label below (text-sm uppercase)
  - Examples: "500+ Businesses", "10k+ Leads Captured", "99.9% Uptime"

### Footer
- Three-column layout on desktop, stacked mobile
- Column 1: Logo + tagline + social links
- Column 2: Quick links (Features, Pricing, Documentation, Support)
- Column 3: Newsletter signup mini-form with email input + subscribe button
- Bottom bar: Copyright + Privacy Policy + Terms links
- Padding: py-12, gap-12 between columns

---

## Animations

**Minimal, Purposeful Motion:**
- Form field focus: Subtle border glow transition (duration-200)
- Button hover: Slight elevation shift (transform translateY -1px)
- Form submission: Loading spinner on button
- Success message: Fade in (duration-300)
- No scroll animations, parallax, or distracting effects

---

## Images

**Image Strategy:**

1. **Hero Image (Required):**
   - Location: Right side of hero section
   - Content: Dashboard/interface mockup showing the intake form and Google Sheets integration
   - Style: Clean screenshot with subtle shadow or frame
   - Dimensions: Approximately 600x400px, responsive scaling

2. **How It Works Visual:**
   - Location: Right side of How It Works section
   - Content: Flow diagram or sequential screenshots
   - Style: Minimalist, schematic representation of the automation flow

3. **Optional Supporting Images:**
   - Small icons for feature cards (can use icon library instead)
   - Testimonial avatars (if using real testimonials)
   - Trust badges/logos if applicable

**No large background images** - keep backgrounds clean for readability and form focus.