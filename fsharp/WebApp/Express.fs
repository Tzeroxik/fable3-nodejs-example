module Express

open Fable.Core.JsInterop

type Method = GET | POST | PUT | HEAD

type Headers = 
    abstract host: option<string> 

type Response = 
    abstract send: string -> unit

type Request = 
    abstract headers: Headers
    abstract method: Method
    abstract originalUrl: string

type Handler = Request -> Response -> unit 

type Application = 
    abstract get: string -> Handler -> unit
    abstract listen: int -> (unit -> unit) -> unit

let express(): Application = importDefault("express")