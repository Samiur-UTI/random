process.env.UV_THREADPOOL_SIZE = 5;

const crypto = require('crypto');

const start =  Date.now();

crypto.pbkdf2('A','B',10000,1024,'sha512', () => {
    console.log('1:', Date.now() - start)
})
crypto.pbkdf2('A','B',10000,1024,'sha512', () => {
    console.log('2:', Date.now() - start)
})
crypto.pbkdf2('A','B',10000,1024,'sha512', () => {
    console.log('3:', Date.now() - start)
})
crypto.pbkdf2('A','B',10000,1024,'sha512', () => {
    console.log('4:', Date.now() - start)
})
crypto.pbkdf2('A','B',10000,1024,'sha512', () => {
    console.log('5:', Date.now() - start)
})
