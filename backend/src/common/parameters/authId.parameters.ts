export default interface AuthIdParams {
   // services should never assume authId was provided as once project is compiled into javascript types will be ignored
   authId?: string
}