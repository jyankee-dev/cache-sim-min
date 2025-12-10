import promptSync from 'prompt-sync';
var tracker = [-1, -1, -1, -1];
var cache = new Array(4).fill(new Array(9).fill(-1));
var RAM = Array.from({ length: 1024 }, () => parseInt(Math.random() * 500));
console.log("Display issues with prompt sync occur when prompts require line breaks. If you experience this, increase the size of your terminal window or zoom out");
(() => {
    const updateTracker = (lru, line) => {
        if (!lru) tracker[line]++;
        else {
            tracker = tracker.map((el, index) => {
                if (index === line) return 1;
                if ((el !== -1) && (el < tracker[line] || tracker[line] == -1)) return el+1;
                return el;
            });
        }
    }
    const replaceInCache = (lru, TAG, block) => {
        let line;
        if (lru) line = tracker.indexOf(Math.max(...(tracker.filter(a => a !== -1))));
        else line = tracker.indexOf(Math.min(...(tracker.filter(a => a !== -1))));
        console.log(`Cache miss. Replacing cache line ${line}`)
        cache[line] = cache[line].map((el, i) => { return i === 0 ? TAG : block[i-1]});
        updateTracker(lru, line);
    }
    const prompt = promptSync();
    var input;
    var toggleValid = false;
    while (!toggleValid) {
        input = prompt("Enter 0 for LRU, Enter 1 for LFU, Enter 2 to EXIT");
        if (Number.isNaN(parseInt(input)) || parseInt(input) < 0 || parseInt(input) > 2) console.log("Enter a valid option");
        else  toggleValid = !toggleValid;
    }
    if (parseInt(input) == 2) return;
    const lru = parseInt(input) === 0;
    while (true) {
        while (toggleValid) {
            input = prompt("Input byte address (in decimal integer format, 0 - 1023) CPU tries to visit(-1 to view cache. If table renders strangely, please zoom out with CTRL-. -2 to exit): ")
            if (Number.isNaN(parseInt(input)) || parseInt(input) > 1023 || parseInt(input) < -2) console.log("Enter a valid integer");
            else toggleValid = !toggleValid
        }
        toggleValid = !toggleValid;
        if (parseInt(input) == -1) console.log(cache);
        if (parseInt(input) == -2) return;
        else {
            var TAG = Math.floor(parseInt(input / 8)).toString(2).padStart(7, '0');
            var block = cache[0].map((c, index) => { return RAM[Math.floor(parseInt(input) / 8) + index]});
            let updated = false;
            for (let line = 0; line < tracker.length && !updated; line++) {
                if (tracker[line] == -1) {
                    console.log(`Assigning to empty line ${line}`)
                    cache[line] = cache[line].map((el, i) => { return i === 0 ? TAG : block[i-1]});
                    updated = updateTracker(lru, line) ? true : false;
                } else if (cache[line][0] === TAG) {
                    console.log(`Cache hit on ${cache[line][parseInt(input) % 8]} for line ${line}`);
                    updated = updateTracker(lru, line) ? true : false;
                }
            }
            if(!updated) replaceInCache(lru, TAG, block);
        }
    }
})();