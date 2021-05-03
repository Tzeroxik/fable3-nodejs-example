module App

open Express
open Fable.Core.JS

let [<Literal>] PORT = 8080

let app = express()

app.get "/ping" (fun _req res -> res.send "Hello World")

app.listen PORT (fun () -> console.log($"Running on {PORT}") )