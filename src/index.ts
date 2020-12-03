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

const apolloServer = new ApolloServer({
schema: await buildSchema({ // SIDE NOTE: whenever npm intalling, If the repo already contains .ts files we donmt need to install types for typescript. it was needed for graph. wont be needed for Argon
    resolvers: [HelloResolver, PostResolver, UserResolver],
    validate: false,
}),
context: () => ({em : orm.em })   // a special; object accesible by all resolvers
});

apolloServer.applyMiddleware({app});
app.listen(5000, ()=>{
    console.log('server running at port 5000');
});
};

main().catch((err) =>{
    console.log(err);
});

