import * as redis from 'redis';

export const pub = redis.createClient();
export const sub = redis.createClient();

const connectRedis = async () => {
    await Promise.all([
        pub.connect(),
        sub.connect()
    ]);
}

connectRedis();

pub.on("connect", (err) => {
    if (!err) {
        console.log("REDIS PUB CONNECTED")
    }
})
sub.on("connect", (err) => {
    if (!err) {
        console.log("REDIS SUB CONNECTED")
    }
})


