# DCI

This repo contains examples of implementing the DCI (Data, Context,
Interaction) pattern in the Golang and Javascript.

At the time I wrote these, I was using DCI as an impetutus to learn more about
JS and Go. Thus you'll see different versions for each implementation, as I
learned more about the language and as my understanding of DCI increased I
refined my approach. Refining these examples has taken a couple of months even
though they are all included in the same commit.

## Golang
To run the golang examples clone the repo and source 'setgopath' and then go
to the godci directory select the version and run for example in the v4
directory 'go run dcitutv4.go'

v4, v5, v6 are the latest and most correct versions. v4 expresses all of the dci
principles correctly. v5 is an evolution of v4 and shows how to incoproate the
concept of a buisness rule into dci. v6 is an evolution of v5 and refactors the
codebase into separate packages and adds tests.

## Javascript
These examples require node version 0.10.30+. To run go to jsdci and run 'node
jsdciv5'.

v5 is the latest and most correct version.  v6 is an interesting but failed
experiement.

