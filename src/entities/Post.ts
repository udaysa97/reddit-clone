import { Entity, PrimaryKey, Property } from "@mikro-orm/core";
import { Field, Int, ObjectType } from "type-graphql";

@ObjectType() // without this we could not pass it as array type to posts resolver
@Entity()
export class Post {
  @Field(()=> Int)    // if we dont add this graph ql wont infer this data
  @PrimaryKey()
  id!: number;

  @Field(() => String)
  @Property({type: 'date'})
  createdAt = new Date();

  @Field(() => String)
  @Property({type: 'date', onUpdate: () => new Date() })
  updatedAt = new Date();

  @Field()
  @Property({type: 'text'}) // tells it is a database property
  title!: string;


}

// on running npx mikro-orm migration:crete it creates a sql command for us. To force cerrtain datatypes in the command we add {type}