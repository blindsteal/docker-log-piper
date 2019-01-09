# Purpose

Write container logs to a known file for further processing.

# Grafana Sample

Run `docker-compose up -d` in the `sample` folder to spin up a monitoring stack.

Grafana should now be available on http://localhost:3000 (use credentials `admin:admin`). 

Navigate to the 'Explore' page using the menu on the left and you should be able to switch between the preconfigured Loki and Prometheus datasources. Click the metrics/log labels button next to the query field to explore the available data.

The stack contains the following building blocks:
- [Grafana](http://docs.grafana.org/) (http://localhost:3000): build dashboards and alerts using metrics and logs collected by Prometheus and Loki
- [Prometheus](https://prometheus.io/docs/introduction/overview/) (http://localhost:9090): time-series DB for metrics, scrapes `/metrics` endpoints to collect them
- node-exporter: provides host system metrics for prometheus
- [Loki](https://github.com/grafana/loki): Log DB
- Promtail: part of Loki, responsible for monitoring directories and sending Logs to Loki
- piper: this nodejs script, makes container logs available for promtail by piping them to files in a docker volume