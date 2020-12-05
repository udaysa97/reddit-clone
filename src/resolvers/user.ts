import { User } from "../entities/User";
import { MyContext } from "src/types";
import { Arg, Ctx, Field, InputType, Mutation, ObjectType, Query, Resolver } from "type-graphql";
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
    @Query(()=> User, {nullable: true})
    async me( // simple query to check if retrieving from cookie working properly
        @Ctx(){ req, em }: MyContext
    ){
        //console.log(req.session);
        if(!req.session.userId){
            // not logged in
            return null;
        }
        const user = await em.findOne(User, {id: req.session.userId});
        return user;
    }
   @Mutation(() =>  UserResponse)
   async register(
       @Arg('options') option: UsernamePasswordInput, // If this dint infer on own we need to add ()=> Usernamepas... after 'options'
       @Ctx() {em,req}: MyContext
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
       try{
       await em.persistAndFlush(user);
       }catch(error){
           if(error.code === '23505' || error.details.include('already exists')){
               //duplicate username error. determined by consoling the error. For safety will also add a er.details include
               return {
                   errors:[
                       {
                           field: 'username',
                           message: 'Please choose another username'
                       }
                   ]
               }

           }
           //console.log('message:',error.message)
       }
       // store user in session(remove if registration should not directly login user)
       req.session.userId = user.id;
       return {user};
   }


   @Mutation(() =>  UserResponse)
   async login(
       @Arg('options') option: UsernamePasswordInput, // If this dint infer on own we need to add ()=> Usernamepas... after 'options'
       @Ctx() {em, req}: MyContext
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
       //req.session!.userId = user.id; // ! tells ts that it will not be undefined To avoid adding ! see change in types.ts
       //console.log('saving:', user.id);
       req.session.userId = user.id;
      // console.log('savingss:', req.session);

       return {
           user,
       };
   }
}
