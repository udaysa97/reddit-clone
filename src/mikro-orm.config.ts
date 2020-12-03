import { __prod__ } from "./constants";
import { Post } from "./entities/Post";
import {MikroORM} from '@mikro-orm/core';
import path from 'path';

export default{
    migrations:{
        path: path.join(__dirname, "./migrations"), // path to the folder with migrations,   -dirname gives the absolute path
      pattern: /^[\w-]+\d+\.[tj]s$/,
    },
        entities: [Post],
        dbName: 'reddit',
        // user: '',
        // password: ''
        type: 'postgresql',
        debug : !__prod__,
    } as Parameters<typeof MikroORM.init>[0]; //as const;   // with as const typrescript takes the type inside our obejct as string likedbNAme and not type

// as Parameters <,,,> is defining the type of value init wants as its first parameter [0] at end = first param expected