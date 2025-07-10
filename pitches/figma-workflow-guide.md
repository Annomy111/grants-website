# Figma to FlyerAlarm: Complete Workflow Guide
## From AI-Generated Designs to Print-Ready Files

---

## 🚀 QUICK START OVERVIEW

1. **Generate** designs using Figma First Draft with provided prompts
2. **Refine** each design with follow-up prompts
3. **Convert** from digital to print specifications
4. **Export** according to FlyerAlarm requirements
5. **Verify** files meet all print standards

**Time Estimate:** 2-3 hours for all three products

---

## 📋 PREREQUISITES

### Figma Access Requirements
- Figma account (Free or Paid)
- First Draft AI access (currently in beta)
- Basic Figma knowledge helpful but not required

### Tools You'll Need
- Figma (web or desktop)
- PDF reader for verification
- Calculator for dimension conversions
- Color reference guide (optional)

---

## 🎨 STEP-BY-STEP WORKFLOW

### Phase 1: Initial Setup (15 minutes)

1. **Create Project Structure**
   ```
   Create new Figma file: "URC2025_Flyers"
   Add pages:
   - DIN A4 Flyer
   - Wickelfalz Panels
   - Zickzackfalz Panels
   - Final Assembly
   - Print Exports
   ```

2. **Set Up Color Styles**
   ```
   Create color styles:
   - Ukrainian Blue: #0057B7
   - Ukrainian Yellow: #FFD700
   - Success Green: #00AA44
   - Error Red: #FF6B6B
   - Dark Gray: #333333
   - Light Gray: #F5F5F5
   ```

3. **Configure Text Styles**
   ```
   Headlines: Inter Bold, 48/36/28px
   Body: Inter Regular, 16/14px
   Captions: Inter Regular, 12px
   Numbers: Inter Black, 42/32px
   ```

---

### Phase 2: Design Generation

#### For DIN A4 Flyer (30 minutes)

1. **Open First Draft**
   - Press ⌘/Ctrl + K
   - Select "First Draft"
   - Choose "Basic Site" template

2. **Generate Base Design**
   - Copy main prompt from `figma-prompts-din-a4.md`
   - Paste and generate
   - Wait for completion (usually 10-20 seconds)

3. **Apply Refinements**
   - Use refinement prompts one by one
   - Allow each to complete before next
   - Check results after each prompt

4. **Manual Adjustments**
   - Fine-tune spacing
   - Verify color accuracy
   - Check text alignment

#### For Multi-Panel Designs (45-60 minutes each)

1. **Generate Each Panel**
   - Create separate frame for each panel
   - Use individual panel prompts
   - Name clearly (e.g., "Wickelfalz_Panel1_Cover")

2. **Maintain Consistency**
   - After first panel, copy color styles
   - Use consistent spacing values
   - Keep font sizes uniform

3. **Assembly Process**
   - Create assembly frame with correct dimensions
   - Copy panels into position
   - Add fold line indicators

---

### Phase 3: Print Conversion (30 minutes)

#### 1. Dimension Adjustment

**From Digital to Print:**
```
Digital Frame → Print Frame
1. Select frame
2. Change units to mm (Preferences > Units)
3. Set exact dimensions:
   - DIN A4: 210mm x 297mm
   - Wickelfalz: 632mm x 299mm (assembled)
   - Zickzackfalz: 632mm x 212mm (assembled)
4. Add 1mm bleed:
   - Create larger frame behind design
   - Extend backgrounds to bleed edge
   - Keep text within safety margin
```

#### 2. Color Conversion

**RGB to CMYK Preparation:**
```
While Figma uses RGB, prepare for CMYK:

Ukrainian Blue (#0057B7)
→ Note: C100 M60 Y0 K10

Ukrainian Yellow (#FFD700)
→ Note: C0 M15 Y100 K0

Success Green (#00AA44)
→ Note: C80 M0 Y100 K0

Document these for printer reference
```

#### 3. Typography Handling

**Convert Text to Outlines:**
```
1. Select all text layers
2. Right-click → "Outline stroke"
3. Alternative: Export with fonts embedded
4. Verify no text is editable
```

---

### Phase 4: Export Process (20 minutes)

#### Export Settings for FlyerAlarm

1. **Configure Export**
   ```
   Select frame(s)
   Export settings:
   - Format: PDF
   - Include "Bleed"
   - Check "Outline text"
   - No compression
   ```

2. **File Naming**
   ```
   Follow FlyerAlarm convention:
   - URC2025_FlyerA4_EN_Print.pdf
   - URC2025_Wickelfalz_EN_Print.pdf
   - URC2025_Zickzack_EN_Print.pdf
   ```

3. **Resolution Check**
   ```
   For images in design:
   - Right-click image → "Copy as PNG"
   - Check resolution is 300+ DPI
   - Replace low-res images if needed
   ```

---

## 🔧 TROUBLESHOOTING COMMON ISSUES

### Issue: First Draft generates web-style design
**Solution:**
```
Add to prompt: "Remove all web navigation elements, buttons, and links. This is for print, not digital. Use static text and images only."
```

### Issue: Panels don't align properly
**Solution:**
```
1. Use Figma's alignment tools
2. Set up guides at fold points
3. Check with View > Show Rulers
4. Snap to pixel grid OFF for print
```

### Issue: Colors look different than expected
**Solution:**
```
1. Calibrate your monitor
2. Use Figma's color picker precisely
3. Document exact hex values
4. Request printed color proof from FlyerAlarm
```

### Issue: Text too small for print
**Solution:**
```
Minimum sizes for print:
- Body text: 11pt (14px in Figma)
- Captions: 8pt (11px in Figma)
- Fine print: 6pt (8px in Figma)
Multiply Figma px by 0.75 for pt size
```

---

## ✅ FINAL CHECKLIST

### Before Sending to FlyerAlarm:

- [ ] **Dimensions**
  - Correct size in mm
  - 1mm bleed added
  - 3mm safety margins respected

- [ ] **Content**
  - All text proofread
  - Contact info verified
  - No placeholder content
  - Images high resolution

- [ ] **Technical**
  - Fonts outlined or embedded
  - Colors documented for CMYK
  - No transparency effects
  - File under 300MB

- [ ] **Export**
  - PDF format
  - Proper file naming
  - Bleed included
  - Print resolution

---

## 💡 PRO TIPS

### Speed Up Your Workflow

1. **Template Your Success**
   - Save first successful panel as component
   - Duplicate and modify for consistency
   - Create "master" color and text styles

2. **Batch Operations**
   - Select multiple similar elements
   - Apply changes simultaneously
   - Use Figma's bulk rename feature

3. **Version Control**
   - Duplicate frames before major changes
   - Name versions clearly (v1, v2, final)
   - Keep "safe" version while experimenting

### Quality Enhancements

1. **Visual Hierarchy**
   ```
   After generation, check:
   - Primary message stands out
   - Clear reading flow
   - Adequate white space
   - Consistent alignment
   ```

2. **Print Optimization**
   ```
   Enhance for print:
   - Increase contrast slightly
   - Avoid pure black text on color
   - Check thin lines (min 0.25pt)
   - Test readability at arm's length
   ```

---

## 📚 RESOURCES

### Helpful Links
- [Figma First Draft Documentation](https://help.figma.com/hc/en-us/articles/23955143044247)
- [FlyerAlarm File Requirements](https://www.flyeralarm.com/de)
- [RGB to CMYK Converter](https://www.rapidtables.com/convert/color/rgb-to-cmyk.html)
- [Print Design Best Practices](https://www.printplace.com/blog/print-design-tips/)

### Emergency Contacts
- Figma Support: support@figma.com
- FlyerAlarm: info@flyeralarm.de
- FlyerAlarm Tech: datenupload@flyeralarm.de

---

## 🎯 EXPECTED OUTCOMES

When complete, you'll have:

1. **Three Print-Ready Designs**
   - Professional appearance
   - Consistent branding
   - FlyerAlarm-compliant files

2. **Reusable Assets**
   - Color styles for future use
   - Text styles library
   - Layout templates

3. **Documented Process**
   - Clear workflow for updates
   - Troubleshooting guide
   - Version history in Figma

---

## 🚦 FINAL WORDS

Remember: Figma First Draft is a starting point, not the finish line. The AI gives you a foundation to build upon. Your expertise in refining, adjusting, and optimizing for print is what transforms these generated designs into professional conference materials.

**Success Rate:** Following this workflow, expect 80-90% completion from AI generation, with 10-20% manual refinement needed for print perfection.

Good luck with your URC 2025 presentation! 🎉

---

*Last updated: Based on Figma First Draft capabilities as of 2024*