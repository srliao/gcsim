# compute

`compute` is meant to be run as a containerized service (primarily in a k8s cluster for easy upgrading). Expected workflow:

- check for work
- complete work received
- if work failed due to forbidden, then that means this compute is out of date; cron job will terminate
- otherwise wait x min and repeat

Generally the server will respond with a batch of random work to do, so each work cycle will be something like:

- ask server for batch of work
- completely batch of work
- wait for some x seconds of timeout
- ask for work again
- repeat until server responds with 404 (i.e out of work)
- once out of work, schedule the next check to happen in x min