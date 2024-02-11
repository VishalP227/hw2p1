'use strict';

const http = require('http')
const fs = require('fs')
const url = require('url')

// helper functions to count distinct number of anagrams
function fact(num) {
    let res = BigInt(1)
    for(let i = 1; i <= num; i++){
        res *= BigInt(i);
    }
    return res
}

function countDistinctAnagrams(inputString) {
    if (inputString.length === 0){
        return "empty";
    }

    if (inputString.match(/^[a-zA-Z]+$/) === null) {
        return "invalid";
    }

    inputString = inputString.toLowerCase();
    let totalPermutations = fact(inputString.length);

    const charCounts = {}
    for(const char of inputString){
        charCounts[char] = (charCounts[char] || 0) + 1;
    }

    for(const i in charCounts){
        charCounts[i] = BigInt(charCounts[i]);
    }

    for(const count of Object.values(charCounts)){
        totalPermutations /= fact(count);
    }

    return totalPermutations.toString();
}

// variables to keep track of number of requests and errors
let requestCount = 0;
let errorCount = 0;

// main server logic
const server = http.createServer((req,res)=>{
    const parsedUrl = url.parse(req.url, true);
    const path = parsedUrl.pathname;
    requestCount += 1;

    // path : /ping 
    if(path === '/ping'){
        res.writeHead(204);
        res.end();
    }
    // path : /anagram?p=[string] 
    else if(path.startsWith('/anagram')){
        const inputString = parsedUrl.query.p;
        const result = countDistinctAnagrams(inputString);
        if (result === 'empty' || result === 'invalid'){
            res.writeHead(400);
            errorCount += 1;
            res.end();
        } else {
            res.writeHead(200, {'content-type': 'application/json'})
            const jsonRes = JSON.stringify({p: inputString, total: result}); 
            res.end(jsonRes);
        }
        
    }
    // path : /secret 
    else if(path === '/secret'){
        const filePath = '/tmp/secret.key';
        if(fs.existsSync(filePath)){
            const fileContent = fs.readFileSync(filePath, 'utf8');
            res.writeHead(200, {'content-type': 'text/plain'});
            res.end(fileContent);
        } else {
            res.writeHead(404);
            errorCount += 1;
            res.end();
        } 
    }
    // path : /status
    else if(req.url === '/status'){
        res.writeHead(200, {'content-type': 'application/json'})
        const jsonDict = {
            time: new Date().toISOString().slice(0,19) + 'Z',
            req: requestCount,
            err: errorCount
        };
        const statusRes = JSON.stringify(jsonDict);
        res.end(statusRes);
    }
    // path : /<any other path>
    else {
        res.writeHead(404);
        errorCount += 1;
        res.end();
    }
    
})


server.listen(8088)
console.log('Server listening on port 8088...')