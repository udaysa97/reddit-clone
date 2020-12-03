import { Post } from "../entities/Post";
import { MyContext } from "src/types";
import { Arg, Ctx, Int, Mutation, Query, Resolver } from "type-graphql";

@Resolver()
export class PostResolver{
   @Query(() =>  [Post])
   posts(
       @Ctx() {em}: MyContext): Promise<Post[]>
   {
       return em.find(Post, {});
   }

   @Query(() =>  Post, {nullable: true})
   post(
       @Arg('id', ()=> Int) id: number,         // Taking in arguments by @Arg id:number is typeScript  ('id), ()... is graphQL  'id' what we pass as arg in graphQl GUI. and ////id:number and {id} below is what we name this variable within function
       @Ctx() {em}: MyContext): Promise<Post | null> // This is typescript. GraphQl return type is handles after @Query
   {
       return em.findOne(Post, {id});
   }

    @Mutation(() =>  Post)  // Query for getting data. Mutation for inserting updating or changing data in server
   async createPost(
       @Arg("title", ()=> String) title: string,   // !!Special note. ()=> string/int in this and above not needed. It is automatically inferred based on typeScript type. /////Sometimes it does not work so be safe
       @Ctx() {em}: MyContext): Promise<Post> // since we returning single post object only below
   {
       const post = em.create(Post, {title});
       await em.persistAndFlush(post);

       return post;
   }

    @Mutation(() =>  Post, {nullable: true})  // nullable so that if no post for id we return null
   async updatePost(
       @Arg("id") id: number,   // !!Special note. ()=> string/int in this and above not needed. It is automatically inferred based on typeScript type. /////Sometimes it does not work so be safe
       @Arg("title", ()=> String, {nullable:true}) title: string,       // To set something as nullable we need to explicitly mention
       @Ctx() {em}: MyContext): Promise<Post | null> // since we returning single post object only below
   {
       const post = await em.findOne(Post, {id});
       //console.log('cheeeeck' + post.title);
       if(!post){
           return null;
       }
       if(typeof title !== undefined){
       post.title = title;
       await em.persistAndFlush(post);
       }
       return post;
   }

    @Mutation(() =>  Boolean)  
   async deletePost(
       @Arg("id") id: number,       
       @Ctx() {em}: MyContext): Promise<Boolean> 
   {
       try{
           
       await em.nativeDelete(Post, {id});
       return true;
       }catch{
           return false
       }
       
   }


}