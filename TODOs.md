# TODOs

[ ] optimizations
    [x] reduce triangles 
        - performance: 58,580 triangles (Note: double the triangles due to shadows being used)
        - blender: 29282
        [x] use a new island model which has less than 1000 triangles

[x] render a 5 x 5 grid of islands with some below water
[ ] raise or sink island when clicked
    [x] overlay clickable grid
    [x] animate islands which clicked
        * Note: no longer using InstancedMesh as the shader does not take into account the altered position
    [x] raise or sink neighboring islands
    [x] show ripples on water which island toggled
    [ ] improve ripples on toggle
        [x] keep animating previous ripples when new ripples triggered
        [x] make ripples more spaced out
        [x] make ripples peaks more defined
        [ ] have different ripples for up and down
[x] selector
    [x] highlight palm tree on hover
    [x] highlight island on hover
    [x] pulse animate selector
    [x] support tweaking selector color
    [x] improve hover effect
    [x] highlight cell border rather than island
[ ] add island features
    [x] palm trees
        [x] use custom shader to show foam at water level
    [x] barrels - float when island sinks
    [x] boats - float when island sinks
    [x] chests - float when island sinks
    [ ] rocks
    [ ] hut
    [ ] sea gulls
[x] change pointer on hover
[x] tweak water colors
[x] increase size of water plane so the corners can't be seen
[x] restrict OrbitControls
[x] adjust camera position & fov to fit all islands on mobile
[x] tweak water wave speed and amplitude
[ ] UI
    [x] Heading 
        [x] island logo?
    [x] Level
        [x] level button shows star when earned
        [x] level selector overlay
        [x] only completed levels and next uncompleted level (ie. unlocked level) can be selected
    [x] About
        [x] island logo?
        [x] add instructions
        [x] fix credits
    [x] Moves
        [x] track number of moves
    [x] Reset
        [x] reset level
    [x] Splash screen
        [x] Welcome to 'Isle Up'
        [x] Tag line: Raise all the islands
        [x] Play button
        [x] island logo?

    [ ] Level Completed    
        [x] show 'WELL DONE'
        [ ] Level n completed in n moves
        [ ] Handle all levels completed
            [x] show 'ALL LEVELS COMPLETED'
            [x] show 'OK' button
        [x] 'NEXT LEVEL' button
        [x] 'RETRY' button
        [ ] level complete animation
            [ ] raise & sink islands in a pattern?
            [ ] sparkling water?
[ ] Sound
    [ ] Ambient sound - waves, seagulls?
    [ ] Sound FX
        [x] Island Raise/Sink - wave
        [x] completing level
[x] Local Storage (using persist from zustand/middleware)
    [x] Save
    [x] Load
    [x] Data
        [x] level (last level played)
        [x] bestMoves (array of best # moves per level)
[x] Level selection improvements
    [x] group levels
    [x] only show one level group at a time
    [x] highlight selected level
    [x] highlight group for selected level 
[ ] Acheivements
    [ ] completed a level
    [ ] completed 5 levels
    [ ] completed 10 levels
    [ ] completed 15 levels
    [ ] completed 20 levels
    [ ] completed 25 levels
    [ ] completed 30 levels
    [ ] repeated a move 3 times
    [ ] repeated a move 5 times
    [ ] repeated a move 9 times
    [ ] earned a star
    [ ] earned 5 stars
    [ ] earned 10 stars
    [ ] earned 20 stars
    [ ] earned 30 stars
    [ ] earned all stars 00 - 09
    [ ] earned all stars 10 - 19
    [ ] earned all stars 20 - 29
    [ ] reset level
    [ ] turn off sound
    [ ] turn on sound
    [ ] view info
    [ ] view level selector

[x] favicon
[x] Fix bug - sometimes hovering and clicking islands is not working
            - SOLUTION: call computeBoundingSphere() on the instancedMesh after updating positions
[x] Fix bug - canvas repositions on start
[x] Fix bug - cell border render artifact when far from camera
[x] Fix bug - shadows do not render properly sometimes
[x] Fix bug - render issue when water reaches the lowest level (z-fighting?)

[ ] Feedback from Challenge 17 review 
    [x] whiter water waves and ripples
    [ ] for level 00, have a "click here" indicator
    [x] increase sound volume
    [x] shorter wave sound effects - use Bloop SFX
    [x] add music - can be turned off & setting saved to local storage

[x] Fix bug - bloop sound does not play when selecting a new level
[x] Fix bug - cannot click islands inside header & footer overlays
