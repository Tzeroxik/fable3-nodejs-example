module App

open Express
open Fable.Core.JS
open Fable.Core.DynamicExtensions

let [<Literal>] PORT = 8080

let app = express()

app.get "/ping" (fun req res -> 
                    let apiKey = req.headers.["x-api-key"] |> Option.ofObj
                    let method = req.method |> string 
                    let host   = req.headers.["host"]  
                    let path   = req.originalUrl
                    let msg    = $"Request: {method} {host}{path}"
                    console.log($"ApiKey? {apiKey.IsSome}")
                    console.log(msg)
                    res.send msg)

app.listen PORT (fun () -> console.log($"Running on {PORT}...") )