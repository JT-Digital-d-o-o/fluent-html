# Depth and Shadows

Depth makes interfaces feel tangible and guides attention. Simulate a consistent light source, use shadows to communicate elevation, and don't overdo it — subtle cues are more effective than photo-realism.

---

## Emulate a Light Source

Light comes from above. Top edges catch light (lighter), bottom edges face away (darker). This is the only rule you need to create raised and inset elements.

### Raised elements (buttons, cards)

1. **Top edge**: slightly lighter than the face — use a top border or inset box-shadow with a slight vertical offset
2. **Bottom shadow**: small dark box-shadow with slight vertical offset (shadow only below)
3. Keep blur radius small — shadows should have sharp edges (like a wall outlet shadow)

### DON'T: Use semi-transparent white for the light edge

Overlaying white sucks saturation from the underlying color. Choose the lighter color by hand.

### Inset elements (inputs, wells, checkboxes)

1. **Bottom edge**: slightly lighter — bottom border or inset shadow with negative vertical offset
2. **Top shadow**: small dark inset box-shadow with slight positive vertical offset

### DON'T: Try for photo-realism

Borrowing visual cues from the real world adds depth. Trying to perfectly replicate reality leads to busy, unclear interfaces.

---

## Shadows Convey Elevation

Shadows position elements on a virtual z-axis. The shadow size communicates how far an element is from the background.

| Elevation | Shadow | Use case |
|---|---|---|
| Low | Small, tight blur | Buttons — noticeable but not dominant |
| Medium | Moderate blur and offset | Dropdowns — floating above surrounding UI |
| High | Large blur and offset | Modals — capturing full attention |

### DO: Define an elevation system

5 shadow levels is usually plenty. Define the smallest and largest, fill in the middle linearly. This speeds up workflow and maintains consistency.

### DO: Use shadows for interaction feedback

- **Drag**: add a larger shadow when user clicks to drag → element feels like it pops forward
- **Press**: switch to smaller or no shadow on click → element feels pressed into the page

Think about where you want the element on the z-axis, then assign the shadow accordingly.

---

## Two-Part Shadows

The best shadows combine two layers, each serving a different purpose:

### Shadow 1: Direct light shadow
- Larger and softer
- Considerable vertical offset, large blur radius
- Simulates shadow from a direct light source

### Shadow 2: Ambient occlusion
- Tighter and darker
- Less vertical offset, smaller blur radius
- Simulates area where even ambient light can't reach (directly underneath the element)

### DO: Adjust for elevation

At **low elevation**: the tight ambient shadow should be distinct.
At **high elevation**: the tight shadow should be almost or completely invisible (objects far from a surface lose their ambient shadow).

---

## Flat Design Can Still Have Depth

You don't need shadows to create depth.

### Color as depth

- **Lighter than background** → feels raised
- **Darker than background** → feels inset

Works for both flat and non-flat designs.

### Solid shadows

Short vertical offset with **zero blur radius** — creates depth while maintaining a flat aesthetic. Great for cards and buttons.

---

## Overlapping Elements

Overlapping is one of the most effective depth techniques.

### DO: Cross background boundaries

- Offset cards so they cross transitions between different backgrounds
- Make elements taller than their parent to overlap on both sides
- Use for small components too (carousel controls, avatars)

### DO: Add invisible borders to overlapping images

When images overlap, they can clash. Give them a border that matches the background color — creates the appearance of layers without ugly collisions.
