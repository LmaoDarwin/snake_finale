NOTE TO SELF :
- dont mind the compatibilty across certain sizes if the instruction doesn't tell you to. --waste of time
- do things accordingly to its core use, do things according to its queue to be created. 
    e.g: making the play button first and then canvas. so you dont waste time changing code --waste of time and useless.
- functionality over design. but do design first. --reducing making time

Known solved issue to concern :
1. Controller queue
2. Snake tails using unshift
3. Game scene to differentiate different state of gameplay
4. Rewind (please simplify the rewind as best as you can)
5. Apple spawn and vanish 3 sec spawn and 5 sec vanish delay 
    - please use setInterval 1 sec and use counter to differ 3 and 5 seconds delay, otherwise it will be buggy
6. Rewind direction has to be saved due to the differ that player can make
7. Apple spawn according to grid

Known issue can be better polished out :
1. Separated JS file? --type="module" is unaccepted  
2. Use the game setInterval to do rewind --please polish if have time.
3. 

INSTRUCTIONS TO MAKING (from experience) :
    needed game scene : -onGame -onRewind -onGameOver
    needed game design : snake, apple, logo, icons, instruction
    ** BONUS POINT : use jsDocs to help document the code through intelisense **

1. All Html tag; button, canvas, instruction, etc
2. Canvas board design.
3. Logo, timer, name , highscore, score (use placeholder)
4. Snake movement. (pls notice directionQueue issue)
5. Apple spawn (use counter and setInterval every second to differ spawn and vanish with one setInterval)
6. Score increment.
7. Highscore (use Math.max)
8. Game over and its box notification
9. Rewind (save currCoordinate and currDirection to array in Rewind class)
10. Cancel rewind