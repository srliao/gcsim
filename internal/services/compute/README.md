# compute

`compute` is meant to be run as a containerized service (primarily in a k8s cluster for easy upgrading). Expected workflow:

- regular cron job to check for more work to do
- complete work received
- if work failed due to forbidden, then that means this compute is out of date; cron job will terminate