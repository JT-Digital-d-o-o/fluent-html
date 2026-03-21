# Images and User Content

Images can make or break a design. Use high-quality photos, handle text-over-image contrast deliberately, respect intended sizes, and protect your layouts from user-uploaded chaos.

---

## Use Good Photos

Bad photos ruin a design even when everything else is well-crafted.

### DO: Invest in quality

- Hire a professional photographer for specific needs
- Use high-quality stock photography (Unsplash for free options)

### DON'T: Design with placeholders expecting to swap in smartphone photos later

It never works. The quality gap between placeholder and amateur photography will undermine the entire design.

---

## Text Over Images

Background images have both light and dark areas, making text hard to read regardless of color.

### Technique 1: Add an overlay

Semi-transparent black overlay helps light text stand out. Semi-transparent white overlay helps dark text. Trade-off: you're lightening/darkening the entire image.

### Technique 2: Lower image contrast

Reduces the dynamics between light and dark areas. Adjust brightness to compensate for the overall change in lightness.

### Technique 3: Colorize the image

1. Lower the image contrast
2. Desaturate the image
3. Add a solid fill using "multiply" blend mode

Also helps the image pair with brand colors.

### Technique 4: Text shadow as a glow

Use a large blur radius with no offset — looks like a subtle glow, not a shadow. Combine with a slight contrast reduction on the image for best results.

---

## Respect Intended Sizes

Every visual element was designed to work at a specific size range.

### DON'T: Scale up small icons

Icons drawn at 16-24px look chunky and disproportionate at 3-4x size. They lack the detail to fill a larger space.

### DO: Enclose small icons in a shape

Give the shape a background color. The icon stays near its intended size while the shape fills the larger space.

### DON'T: Scale down full screenshots

A full-size screenshot at 70% makes 16px text into 4px text — unreadable.

### DO: Use these alternatives instead

- Take the screenshot at a smaller screen size (tablet layout)
- Take a partial screenshot to avoid shrinking
- Draw a simplified version of the UI with details removed and small text replaced by lines

### DON'T: Scale down detailed icons either

A 128px logo shrunk to 16px favicon turns to mush. Redraw a super simplified version at the target size.

---

## User-Uploaded Content

You can't control what users upload, but you can protect your layout.

### DO: Control shape and size

Center images inside fixed containers and crop overflow. Use CSS `background-size: cover` for consistent aspect ratios regardless of source image dimensions.

### DO: Prevent background bleed

When a user's image has a background color similar to your UI background, the image loses its defined shape.

### DON'T: Use a border to fix bleed

Borders clash with the colors in the image.

### DO: Use a subtle inner box-shadow

Most people will barely notice it's there, but it defines the image edge cleanly. A semi-transparent inner border works too.
