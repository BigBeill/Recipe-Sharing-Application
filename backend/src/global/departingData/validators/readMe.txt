Any data being sent from the server to the client MUST pass one of these validators

REMEMBER: Typescript compiles into JavaScript before runtime!
   - This means: until a validator is run on an object, a variable can be anything, Typescript means nothing in production
   - Do not blindly trust Typescript, Do not blindly trust your IDE, Do not trust hard coded data
   - Use a validator on everything being sent back to the client

TODO: create a more general purpose DLP function, security in layers would be super helpful if more people start working on this project