module Express

open Fable.Core
open Fable.Core.JsInterop

type Response = 
    abstract send: string -> unit
type Request = obj

type Handler = Request -> Response -> unit 

type Application = 
    abstract get: string -> Handler -> unit
    abstract listen: int -> (unit -> unit) -> unit

let express(): Application = importDefault("express")