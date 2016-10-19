# Leap-Drawing

One of my summer projects to try and create a basic drawing program using Leap Motion and BonsaiJS.
You can draw by pointing any leap Pointable (e.g. chopstick) and putting the tip across the z-plane.

## Instructions

1. Clone repo
2. Plug in Leap Motion and ensure client is on
3. Open ```src\leap.html```. Use any pointable tool to draw on the screen. 
4. Pen will "touch" canvas at z-index past the vertical plane intersecting Leap Origin. 

## Attributions

This project uses [BonsaiJS](https://bonsaijs.org/), [LeapJS](https://github.com/leapmotion/leapjs), and [jQuery](https://jquery.com/).

Thank you to [FiBO Institute](http://fibo.kmutt.ac.th/) at King Mongkut's University of Technology Thonburi for lending me a Leap Motion to experiment on.

## TODO 

1. Massively fix the logic to scale from Leap Coordinate System to Canvas.
2. Move past the current straight-path-joining method of drawing to create a true drawing application.