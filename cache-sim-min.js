import promptSync from 'prompt-sync'; // required to take input in Node
var tracker = [-1, -1, -1, -1];
var cache = new Array(4).fill(new Array(9).fill(-1));
var RAM = Array.from({ length: 1024 }, () => parseInt(Math.random() * 500));
console.log("Display issues with prompt sync occur when prompts require line breaks. If you experience this, increase the size of your terminal window or zoom out"); // Could be less lines without this warning
(() => {
    const updateTracker = (lru, line) => {  
        if (!lru) tracker[line]++; // increments the line's hit count by 1 for lfu *lru is a boolean parameter to save lines.
        else {
            tracker = tracker.map((el, index) => {
                if ((el !== -1) && (el < tracker[line] || tracker[line] == -1)) return el+1; // increment all less than the hit line
                return index === line ? 1 : el; // set hit to 1 and keep the rest the same
            });
        }
    }
    const replaceInCache = (lru, TAG, block) => {
        const line = lru ? tracker.indexOf(Math.max(...(tracker.filter(a => a !== -1)))) : tracker.indexOf(Math.min(...(tracker.filter(a => a !== -1)))); // identify line to replace. lru: greatest index, lfu: least index
        console.log(`Cache miss. Replacing cache line ${line}`); 
        cache[line] = cache[line].map((el, i) => { return i === 0 ? TAG : block[i-1]}); // get new values for the line
        updateTracker(lru, line);
    }
    const prompt = promptSync(); // gets prompt
    var input;
    var toggleValid = false; // tracks valid input
    while (!toggleValid) {
        input = prompt("Enter 0 for LRU, Enter 1 for LFU, Enter 2 to EXIT");
        if (Number.isNaN(parseInt(input)) || parseInt(input) < 0 || parseInt(input) > 2) console.log("Enter a valid option"); // catches all invalid input
        else  toggleValid = !toggleValid; // breaks when valid input received
    }
    if (parseInt(input) == 2) return; // quit condition
    const lru = parseInt(input) === 0; // lru is true if user inputs 0, otherwise false (lfu)
    while (true) { // wooooooOOOoOooOooOOoOOO
        while (toggleValid) { // checks opposite case so we can save an assignment
            input = prompt("Input byte address (in decimal integer format, 0 - 1023) CPU tries to visit(-1 to view cache. If table renders strangely, please zoom out with CTRL-. -2 to exit): ")
            if (Number.isNaN(parseInt(input)) || parseInt(input) > 1023 || parseInt(input) < -2) console.log("Enter a valid integer"); 
            else toggleValid = !toggleValid
        }
        if (parseInt(input) == -1) console.log(cache); // show cache 
        else if (parseInt(input) == -2) return; // quit
        else {
            var TAG = Math.floor(parseInt(input) / 8).toString(2).padStart(7, '0'); // calculate tag as binary
            var block = cache[0].map((c, index) => { return RAM[Math.floor(parseInt(input) / 8) + index]}); // calculate block as binary
            let updated = false; 
            for (let line = 0; line < tracker.length && !updated; line++) { // for less lines, this is the place to try (initial state of -1 handling)
                if (tracker[line] == -1) { // assign to empty line
                    console.log(`Assigning to empty line ${line}`)
                    cache[line] = cache[line].map((el, i) => { return i === 0 ? TAG : block[i-1]}); // set first to TAG, the rest to block elements
                    updated = updateTracker(lru, line) ? false : true; 
                } else if (cache[line][0] === TAG) {
                    console.log(`Cache hit on ${cache[line][parseInt(input) % 8]} for line ${line}`);
                    updated = updateTracker(lru, line) ? false : true;
                }
            }
            if(!updated) replaceInCache(lru, TAG, block);
        }
    }
})();