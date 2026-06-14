# KIDSbSAFE Design System

## Brand
**Name:** KIDSbSAFE  
**Tone:** Trustworthy, modern, protective — NOT scary, NOT spy-themed  

## Colors
```
Primary gradient:  #7C3AED → #A78BFA  (purple/violet)
Accent:            #EC4899             (pink)
CTA:               #F97316             (orange)
Background:        #0A0B14             (near black)
Surface:           rgba(255,255,255,0.05) glassmorphism cards
Border:            rgba(255,255,255,0.08)
Text primary:      #F8FAFC
Text secondary:    #94A3B8
Success:           #10B981
Warning:           #F59E0B
Danger:            #EF4444
```

## Typography
- **Display:** Outfit (700, 800) — headings, brand name
- **Body:** Inter (400, 500, 600) — body, labels, UI

## Glassmorphism
```css
background: rgba(255, 255, 255, 0.04);
border: 1px solid rgba(255, 255, 255, 0.08);
backdrop-filter: blur(12px);
border-radius: 16px;
```

## Spacing
- Base unit: 4px
- Cards: 24px padding
- Sections: 80px vertical

## Motion
- Page load: staggered fade+slide up (60ms delay between items)
- Hover: scale(1.02) on cards, 200ms ease
- Alerts: pulse glow on high-risk

## Anti-patterns
- NO spy icons (magnifying glass, eye icon overuse)
- NO fear-based red everywhere
- NO cartoon illustrations
- NO stock photo clichés
