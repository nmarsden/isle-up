# TODOs

[ ] optimizations
    [x] reduce triangles 
        - performance: 58,580 triangles (Note: double the triangles due to shadows being used)
        - blender: 29282
        [x] use a new island model which has less than 1000 triangles
        [x] turn off shadows

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
[ ] add island features
    [x] palm trees
        [x] use custom shader to show foam at water level
    [ ] rocks
    [ ] hut
    [ ] sea gulls
[ ] change pointer on hover
[x] tweak water colors
[x] increase size of water plane so the corners can't be seen
[x] restrict OrbitControls
[x] adjust camera position & fov to fit all islands on mobile
[x] tweak water wave speed and amplitude
[ ] UI
    [x] Heading 
    [ ] Level
    [x] About
    [ ] Moves
    [ ] Reset
