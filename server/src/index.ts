import "reflect-metadata"; // to be done in graphql
import {MikroORM} from "@mikro-orm/core";
import { __prod__ } from "./constants";
import {Post} from './entities/Post';
import microConfig from './mikro-orm.config';
import express from 'express';
import {ApolloServer} from 'apollo-server-express';
import {buildSchema} from 'type-graphql'
import { HelloResolver } from "./resolvers/hello";
import { PostResolver } from "./resolvers/post";
import { UserResolver } from "./resolvers/user";
import redis from 'redis';
import session from 'express-session';
import connectRedis from 'connect-redis';
import { MyContext } from "./types";


const main = async()=>{
    const orm = await MikroORM.init(microConfig); // connect to DB
    await orm.getMigrator().up(); // run migration
// const post = orm.em.create(Post, {title: 'My first post'}); // then run sql // it wa there to test if post created or not. Removing now 
//console.log('---------------------sql2-------------------');
//   above is somewhat same as. No DB work yet. Only post instance is created const post = new Post('my first post');
//await orm.em.persistAndFlush(post); // nativeInsert(Post, {title: ''hello})   This will create our post

//const posts = await orm.em.find(Post,{});  // This finds all post for us
//console.log(posts);

const app = express();
// app.get('/', (_,res)=>{  // if we want to ignore a variable like req we can add a _ (good practice)
//      res.send('hello');
// })

// code directly taken and changed a bit from connect-redis github
// Important to place between express() and apply middlewear.
// Since we use the session inside the apollo middlewear
const RedisStore = connectRedis(session);
const redisClient = redis.createClient()

app.use(
  session({
      name: 'qid', // name of cookie
    store: new RedisStore({ // setting ttl tels how long we want redis to last
         client: redisClient ,
         disableTouch:true, // read TTL. this will reduce number of requests to redis.
        }), // tell express session we use redis store
        cookie: {
            maxAge: 1000 * 60 * 60 * 24 * 365 * 10, // 10 years in ms
            httpOnly: true, // security. in JS in front end we cannot access code
            sameSite: "lax", // csrf
            secure: false ,// since local is not https but prod will be we let env decide. Set to false if prod is not HTTPS

        },
        saveUninitialized: false, // only store data if there is data to store
    secret: 'fgfdgfdgdfgdf',  // encrypt secret. need to hide later
    resave: false, // to avoid continued ping to redis 
  })
);

const apolloServer = new ApolloServer({
schema: await buildSchema({ // SIDE NOTE: whenever npm intalling, If the repo already contains .ts files we donmt need to install types for typescript. it was needed for graph. wont be needed for Argon
    resolvers: [HelloResolver, PostResolver, UserResolver],
    validate: false,
}),
// context: () => ({em : orm.em })   // a special; object accesible by allresolvers
// });

context: ({req,res}): MyContext => ({em : orm.em, req,res }), //New context so that req,res can carry cookies after addition of redis store. Need to change types.ts too. adding MyContext adds typescript checking to make sure we send all params
});

apolloServer.applyMiddleware({app});
app.listen(5000, ()=>{
    console.log('server running at port 5000');
});
};

main().catch((err) =>{
    console.log(err);
});

