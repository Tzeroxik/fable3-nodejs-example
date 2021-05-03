module Express

open Fable.Core.JsInterop
open Fable.Core.JS

type Method = GET | POST | PUT | HEAD

type Response = 
    abstract send: string -> unit

type Request = 
    abstract headers: Object
    abstract method: Method
    abstract originalUrl: string

type Handler = Request -> Response -> unit 

type Application = 
    abstract get: string -> Handler -> unit
    abstract listen: int -> (unit -> unit) -> unit

let express(): Application = importDefault("express")