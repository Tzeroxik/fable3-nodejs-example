module App

open Express
open Fable.Core.JS

let [<Literal>] PORT = 8080

let app = express()

app.get "/ping" (fun req res -> 
                    let method = req.method |> string
                    let host   = req.headers.host 
                    let path   = req.originalUrl
                    let msg    = $"Request: {method} {host}{path}"
                    console.log(msg)
                    res.send msg)

app.listen PORT (fun () -> console.log($"Running on {PORT}...") )