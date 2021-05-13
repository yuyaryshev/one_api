const b64 = '0123456789abcdefghijklmnoqprstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_-';

function toBase64(x) {
    let a = '';
    while(true) {
        a+=b64[x%64];
        x = Math.floor(x / 64);
        if(x<64) {
            a+= b64[x];
            return a+'000000000000'.substr(0,6-a.length);
        }
    }
}

function fromBase64(a) {
    let x = 0;
    for(let i=a.length-1; i>=0; i--)
        x = x*64 + b64.indexOf(a[i]);
    return x;
}

let y = 0;

let x = 5000000000;
console.log(toBase64(x));
console.log(fromBase64(toBase64(x)));

console.log('=============================================');

const n = 100*1000*1000;
console.time(`benchmark encode/decode ${n} samples`);
for(let i=1;i<n;i++) {
    y+=fromBase64(toBase64(i))
}
console.timeEnd(`benchmark encode/decode ${n} samples`);
