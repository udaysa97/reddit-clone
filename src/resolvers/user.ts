import { User } from "../entities/User";
import { MyContext } from "src/types";
import { Arg, Ctx, Field, InputType, Mutation, ObjectType, Resolver } from "type-graphql";
import argon2 from 'argon2';


@InputType() // we get as inputs
class UsernamePasswordInput{
    @Field()
    username: string
    @Field()
    password: string
}

@ObjectType()
class FieldError{
    @Field()
    field: string;

    @Field()
    message: string;

}

@ObjectType() // we send as response
class UserResponse{ // creating one response object that can contain error, user both or none depends on scenario
    @Field(()=> [FieldError], {nullable: true})
    errors?: FieldError[];  // ? means can be undefined

    @Field(()=>User, {nullable:true})
    user?: User;
}
@Resolver()
export class UserResolver{
   @Mutation(() =>  UserResponse)
   async register(
       @Arg('options') option: UsernamePasswordInput, // If this dint infer on own we need to add ()=> Usernamepas... after 'options'
       @Ctx() {em}: MyContext
   ): Promise<UserResponse>{
       if(option.username.length <= 2){
           return{
errors:[{
    field: 'username',
    message: 'Length must be greater than 2'
}]
           }
       }

       if(option.password.length <= 3){
           return{
errors:[{
    field: 'password',
    message: 'Length must be greater than 3'
}]
           }
       }
       const hashPasssword = await argon2.hash(option.password)
       const user = em.create(User, {username: option.username, password: hashPasssword});
       await em.persistAndFlush(user);
       return {user};
   }


   @Mutation(() =>  UserResponse)
   async login(
       @Arg('options') option: UsernamePasswordInput, // If this dint infer on own we need to add ()=> Usernamepas... after 'options'
       @Ctx() {em}: MyContext
   ): Promise<UserResponse>{
       const user = await em.findOne(User,{username: option.username.toLowerCase()});
       if(!user){
           return{
               errors:[{
                   field: 'username',
                   message: 'username does not exist'
                }],
           };
       }
       const valid = await argon2.verify(user.password, option.password); // check hash pass againt plain text pass
       if(!valid){
                return{
               errors:[{
                   field: 'password',
                   message: 'Incorrect username/password'
                }],
           };
       }

       return {
           user,
       };
   }
}
