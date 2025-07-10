# Figma First Draft Prompts - Zickzackfalz (Zigzag/Accordion Fold)
## 6-Panel Progressive Story for URC 2025

---

## OVERVIEW

The Zickzackfalz creates an accordion-style reveal with 6 square panels (210mm x 210mm each). The design tells a progressive story from problem to solution to action.

**Panel Flow:**
- Front Side: [1: Intro] → [2: Problem] → [3: Solution]
- Back Side: [4: Features] → [5: Impact] → [6: CTA]

---

## FRONT SIDE PANELS

### PANEL 1: INTRODUCTION
**Template: Basic App**

**Main Prompt:**
```
Create a bold splash screen with gradient background from #0057B7 to #0066CC. Add a centered badge with "🇩🇪 × 🇺🇦" in white, 18px with semi-transparent background. Main title "Transform Your Grant Search" should be 48px extra bold white, split across two lines for impact. Add subtitle "From 40+ hours of searching to 30 seconds of AI-powered discovery" in 22px light white with 0.9 opacity. At the bottom, create a large yellow call-to-action button (#FFD700) with rounded corners showing "Discover €75M+ in Funding" in 18px bold #333333. Ensure all elements are perfectly centered with generous padding.
```

**Refinement:**
```
Add subtle geometric pattern overlay using rgba(255,255,255,0.05) to create depth. Increase button size and add subtle shadow for prominence.
```

---

### PANEL 2: THE PROBLEM
**Template: Basic App**

**Main Prompt:**
```
Design a problem visualization screen with white background. Add a red header bar (#FF6B6B) with "Step 1" in 14px and "The Problem" in 28px bold white text. Create a 2x2 grid of problem statistics. Each stat has an emoji icon (36px), large number in 32px bold #D32F2F, and label in 14px #666666. Stats: "⏰ 40+ Hours per search", "🌐 100+ Websites to check", "📅 65% Miss deadlines", "❌ 80% Language barrier". At the bottom, add a quote box with light gray background (#F5F5F5), italic text "We spend more time searching for grants than actually working on our mission" in 16px #555555, with attribution "- Ukrainian NGO Director" in 14px.
```

---

### PANEL 3: SOLUTION OVERVIEW
**Template: Basic App**

**Main Prompt:**
```
Create a solution showcase with light blue background (#F0F9FF). Add green header (#00AA44 to #00CC55) with "Step 2" and "The Solution" in white. Design four solution cards with white background, rounded corners, and subtle shadows. Each card contains: emoji (28px), title in 18px bold #0057B7, and description in 14px #555555. Cards: "🎯 One Platform - All grants in a single searchable database", "🤖 AI Matching - Get personalized recommendations instantly", "🇺🇦 Full Translation - Every grant available in Ukrainian", "📱 Mobile Ready - Access anywhere, anytime". Add small text at bottom right: "Unfold for more →" in 12px italic #999999.
```

---

## BACK SIDE PANELS

### PANEL 4: HOW IT WORKS
**Template: Basic Site**

**Main Prompt:**
```
Design a comparison table screen with white background. Add yellow header (#FFD700) with "Step 3" and "How It Works" in #333333. Create a two-column comparison table. Left column header "Traditional Search" with red X icons, right column "Our Platform" with green checkmarks. Row items: "✗ 100+ websites vs ✓ One platform", "✗ 40+ hours vs ✓ 30 seconds", "✗ English only vs ✓ Ukrainian + English", "✗ Manual matching vs ✓ AI recommendations", "✗ Desktop only vs ✓ Mobile optimized". Use 14px for all table text, with #666666 for left column and #333333 for right. Add subtle alternating row backgrounds.
```

---

### PANEL 5: PROVEN IMPACT
**Template: Basic App**

**Main Prompt:**
```
Create an impact metrics screen with #F8F9FA background. Add blue header (#0057B7) with "Step 4" and "Proven Impact" in white. Design a 2x2 grid of metric cards with white background and shadows. Each shows: number in 32px bold #0057B7, label in 13px #666666. Metrics: "€478K Funding facilitated", "2,400+ NGOs served", "38 Countries reached", "3x Success rate". Below the grid, add a success story card with light green background (#E8F5E9), star emoji (36px), and quote "In 30 minutes, we found 8 relevant grants. This platform is a game-changer!" in 16px bold #2E7D32.
```

---

### PANEL 6: CALL TO ACTION
**Template: Basic App**

**Main Prompt:**
```
Design a high-impact CTA screen with dark gradient background (#333333 to #000000). Add white text: "Ready to Transform Your Funding Search?" in 36px bold, followed by "Join 2,400+ organizations already using our platform" in 18px with 0.9 opacity. Create two CTA elements: primary yellow button (#FFD700) with "Start Free Today" in 18px bold #333333, and secondary link "grants.netlify.app" in 16px #FFD700. At the bottom, add an event badge with semi-transparent border, containing "Meet Us at URC 2025" in 20px bold #FFD700 and "Booth #42 • Live Demos" in 16px white.
```

---

## ASSEMBLY INSTRUCTIONS

### Creating the Accordion Layout:

1. **Frame Setup:**
```
Create two frames: "Zickzack_Front" and "Zickzack_Back", each 632mm x 212mm (includes bleed).
```

2. **Panel Arrangement:**
```
Front: Place panels 1-3 side by side, left to right
Back: Place panels 4-6 side by side, left to right (note: these appear in reverse when folded)
```

3. **Fold Indicators:**
```
Add dashed red lines at 211mm and 422mm to show fold positions. Label them "Valley" and "Mountain" folds alternately.
```

4. **Visual Flow Check:**
```
Ensure the story flows logically as panels unfold. Add subtle visual connectors (arrows, continuing patterns) between panels where appropriate.
```

---

## SQUARE FORMAT CONSIDERATIONS

Since each panel is square (210mm x 210mm):

**Adjustment Prompts:**
```
1. "Adjust the layout to be perfectly square, with equal padding on all sides"
2. "Center all elements vertically and horizontally within the square format"
3. "Ensure no content is cut off when cropped to square dimensions"
```

---

## REFINEMENT STRATEGIES

### For Visual Consistency:
```
Apply to each panel: "Match the visual style of [previous panel] while maintaining the square format. Use consistent spacing of 20px between elements and ensure all text sizes match the established hierarchy."
```

### For Print Optimization:
```
"Increase color saturation by 20% for better print reproduction. Ensure all text has sufficient contrast against backgrounds. Make thin lines at least 1pt thick."
```

### For Accordion Flow:
```
"Add a subtle visual element that continues from panel to panel, creating a sense of connection as the brochure unfolds. This could be a gradient that shifts, or a geometric pattern that evolves."
```

---

## COMMON CHALLENGES & SOLUTIONS

### Challenge: Panels look disconnected
**Solution:** Add this to each panel prompt: "This is panel [X] of a 6-panel accordion brochure that tells the story of transforming grant discovery for Ukrainian NGOs"

### Challenge: Square format issues
**Solution:** "Redesign the layout to work perfectly in a 1:1 square ratio, redistributing elements vertically to fill the space effectively"

### Challenge: Text too small when printed
**Solution:** "Increase all font sizes by 2-4px while maintaining hierarchy. Minimum body text should be 14px"

---

## ALTERNATIVE APPROACHES

### Method 1: Story-First Design
Instead of focusing on layout, emphasize the narrative:
```
"Panel [X] of a grant platform story: [specific content]. Design this as a square card that connects visually to the previous panel about [previous topic]."
```

### Method 2: Template Switching
Try different templates for different effects:
- Panels 1,3,5: Use "Basic App" for modern feel
- Panels 2,4,6: Use "Basic Site" for information-heavy content

### Method 3: Color-Coded Sections
```
"Create panel [X] with [color] as the dominant theme, representing [stage of journey]. Maintain visual consistency with other panels while using color to differentiate sections."
```

---

## EXPORT SPECIFICATIONS

- [ ] Each panel exactly 210mm x 210mm
- [ ] 1mm bleed on outer edges only
- [ ] Fold lines marked for reference
- [ ] CMYK color conversion complete
- [ ] All fonts outlined
- [ ] 300 DPI resolution verified
- [ ] PDF/X-3:2002 format

---

## PRO TIPS

1. **Test the Fold:** Print a low-res version and fold it to check flow
2. **Number Panels:** Add tiny numbers during design (remove before print)
3. **Edge Safety:** Keep critical content 5mm from fold lines
4. **Continuity Check:** View all panels together as thumbnails

---

*Remember: Accordion folds create a dynamic reveal experience. Each panel should entice the reader to unfold the next section!*