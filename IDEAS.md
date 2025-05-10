# 🌊 Isle Up – A 3D Lights Out Puzzle Game with Islands  

## 🧠 Core Concept  
A 5x5 grid of small islands scattered in a shallow sea. Each island can be **raised** (above sea level) or **sunken** (underwater).  
Clicking an island toggles its own state **and the adjacent islands’ states (N, S, E, W)**.  
The goal is to **raise all the islands** above water.

---

## 🎮 Game Mechanics  
- **Grid:** 5x5 islands placed on a large shallow ocean plane.  
- **States:**
  - **Sunken Island:** Flat, submerged just under water. Maybe only a few rocks visible.  
  - **Raised Island:** Above water, lush with grass or palm trees.  
- **Player Interaction:**
  - Clicking (or tapping) an island raises/sinks it and its direct neighbors.  
  - Optional: Limit the number of clicks or track move count for a challenge.

---

## 💡 Visual Design & Feedback  
- **Sunken State:**
  - Water shader with a ripple effect.  
  - Darker tones, only rocks or a tree stump poking out.  
- **Raised State:**
  - Mini island with sand, greenery, and maybe a palm tree.  
  - Bright lighting and subtle animations (birds flying, etc.).  
- **Toggle Animation:**
  - Smooth elevation movement with splash particles or foam rings.  
  - Subtle sound cue: “splash” for sinking, “bloom” or “ding” for raising.

---

## 🗺️ Scene Style Ideas  
- **Camera:** Slightly angled top-down isometric view with orbit/pan control.  
- **Environment:**
  - Blue tropical ocean with wave movement.  
  - Skybox with clouds and a glowing sun.  
  - Floating buoys or coral framing the grid.  
- **UI:**
  - Minimal: move counter, reset button, and level number.  
  - Optional: Undo button and level selector menu.

---

## 🏆 Optional Features  
- **Levels & Patterns:**
  - Predefined puzzles (Easy → Hard).  
  - Procedural/random generation for infinite replay.  
- **Achievements:**
  - "Calm the Sea" – Complete a level with minimum moves.  
  - "Master of Tides" – Finish 10 puzzles in a row.  
- **Visual Rewards:**
  - Sparkling water when all islands are raised.  
  - Dolphins jump, or a rescue boat docks.
  - Marine Iguanas - move to bask on the raised rocks.
  - Coconut Crabs - slow-moving onto the new land.
  - Ghost Crabs - fast-moving scuttle onto the new land.   
  - Sea Snakes - medium-moving on the the new land.
  - Large Marine Snails/Gastropods - slowest-moving onto the new land.

---

## 🧱 Implementation Notes (Three.js)  
- **Island Geometry:** Extruded cylinders or boxes with grass/sand textures.  
- **Water Plane:** Transparent blue plane with vertex displacement for waves.  
- **Animation:** Use `gsap` or `tween.js` to animate raising/sinking islands.  
- **Lighting:** Use directional sun light + ambient for island highlights.  

---

## 🌐 Name Ideas  
- **Isle Up**  
- **Rise & Tide**  
- **Puzzle Archipelago**  
- **High Water**  
- **Island Raiser**  

---

## ✅ Next Step Suggestions  
- Build a prototype with flat island tiles before adding elevation animation.  
- Use simple color states (blue = sunken, green = raised) during early dev
